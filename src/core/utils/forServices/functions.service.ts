import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Interface para informações do produto extraídas da URL
 */
export interface ProductInfo {
  productId: string;
  productName: string;
  originalPrice?: string;
  imageUrl?: string;
}

/**
 * Serviço com funções utilitárias reutilizáveis para outros serviços
 */
@Injectable()
export class FunctionsService {
  private readonly logger = new Logger(FunctionsService.name);

  /**
   * Normaliza valores monetários variados para o formato BRL (pt-BR), ex.: "R$ 1.234,56".
   * Aceita entradas como: 178, "178", "178,00", "R$178,00", "34.99", "1.234,56".
   * Retorna null se não conseguir interpretar um número válido.
   */
  normalizePriceToBRL(
    input: string | number | null | undefined,
  ): string | null {
    try {
      if (input === null || input === undefined) return null;

      // Se já for número, formata direto
      if (typeof input === 'number' && Number.isFinite(input)) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(input);
      }

      // Trabalhar com string
      const raw = String(input).trim();
      if (!raw) return null;

      // Pegar o primeiro trecho que pareça número (permite dígitos, pontos e vírgulas)
      const match = raw.match(/[\d.,]+/);
      if (!match) return null;
      let token = match[0];

      // Heurísticas de separadores
      const hasComma = token.includes(',');
      const hasDot = token.includes('.');

      if (hasComma && hasDot) {
        // Padrão BR: ponto milhar, vírgula decimal
        token = token.replace(/\./g, '').replace(',', '.');
      } else if (hasComma) {
        // Apenas vírgula -> decimal
        token = token.replace(',', '.');
      } else if (hasDot) {
        // Apenas ponto: decidir se é decimal ou milhar
        const parts = token.split('.');
        const lastLen = parts[parts.length - 1].length;
        if (lastLen === 1 || lastLen === 2) {
          // Provável decimal
          // mantém apenas o último ponto como decimal
          const intPart = parts.slice(0, -1).join('');
          const decPart = parts[parts.length - 1];
          token = `${intPart}.${decPart}`;
        } else {
          // Provável milhar -> remove pontos
          token = token.replace(/\./g, '');
        }
      }

      // Remover múltiplos pontos decimais acidentais, manter só o primeiro (mais à esquerda)
      const firstDot = token.indexOf('.');
      if (firstDot !== -1) {
        token =
          token.substring(0, firstDot + 1) +
          token.substring(firstDot + 1).replace(/\./g, '');
      }

      const value = parseFloat(token);
      if (!Number.isFinite(value)) return null;

      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(value);
    } catch (err) {
      this.logger.warn('Falha ao normalizar preço:', err);
      return null;
    }
  }
  /**
   * Flexible validation: verifies if the URL contains http/https and "shopee" in the URL
   * @param url - URL a ser validada
   * @returns true se a URL é válida para produtos da Shopee
   */
  isValidShopeeProductUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    const normalizedUrl = url.toLowerCase().trim();

    const validPrefixes = [
      'https://s.shopee.com',
      'https://br.shopee.com',
      'https://shopee.com.br',
      'https://br.shp.ee',
      'https://shp.ee',
    ];

    return validPrefixes.some((prefix) => normalizedUrl.startsWith(prefix));
  }

  /**
   * Verifica se a URL é uma URL encurtada da Shopee (shp.ee, s.shopee.com)
   */
  isShortShopeeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const normalized = url.toLowerCase().trim();
    const shortPrefixes = [
      'https://br.shp.ee',
      'https://shp.ee',
      'https://s.shopee.com',
    ];
    return shortPrefixes.some((prefix) => normalized.startsWith(prefix));
  }

  /**
   * Resolve uma URL encurtada da Shopee seguindo os redirects até obter a URL final
   * @param shortUrl - URL encurtada
   * @returns URL final após seguir os redirects, ou null se falhar
   */
  async resolveShortUrl(shortUrl: string): Promise<string | null> {
    try {
      const response = await axios.head(shortUrl, {
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: (status) => status < 400,
      });

      const resolvedUrl: string | undefined =
        (response.request as { res?: { responseUrl?: string } })?.res
          ?.responseUrl || response.config?.url;

      if (resolvedUrl && resolvedUrl !== shortUrl) {
        return resolvedUrl;
      }

      // Fallback: tentar com GET se HEAD não retornou a URL final
      const getResponse = await axios.get(shortUrl, {
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: (status) => status < 400,
      });

      const finalUrl: string | undefined =
        (getResponse.request as { res?: { responseUrl?: string } })?.res
          ?.responseUrl || getResponse.config?.url;
      if (finalUrl && finalUrl !== shortUrl) {
        return finalUrl;
      }

      this.logger.warn(
        `Não foi possível resolver a URL encurtada: ${shortUrl}`,
      );
      return null;
    } catch (error) {
      this.logger.error(`Erro ao resolver URL encurtada ${shortUrl}:`, error);
      return null;
    }
  }

  /**
   * Extrai o ID e nome do produto da URL da Shopee
   * Padrões suportados:
   *   - https://shopee.com.br/{produto-nome}-i.{shop_id}.{product_id}[?params]
   *   - https://shopee.com.br/product/{shop_id}/{product_id}[?params]
   * @param url - URL do produto da Shopee
   * @returns Objeto com informações do produto ou null se não conseguir extrair
   */
  extractProductNameId(url: string): ProductInfo | null {
    if (!url || typeof url !== 'string') return null;

    try {
      // Padrão 1: nome + i.{shop_id}.{product_id}
      const regexNamed = /\/([^/]+)-i\.(\d+)\.(\d+)(?:\?.*)?$/;
      const matchNamed = url.match(regexNamed);

      if (matchNamed?.[1] && matchNamed[3]) {
        const formattedName = matchNamed[1]
          .split('-')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');

        return {
          productId: matchNamed[3],
          productName: formattedName,
        };
      }

      // Padrão 2: /{qualquer_caminho}/{shop_id}/{product_id} (flexível para redirecionamentos)
      const regexGeneral = /\/[^/]+\/(\d+)\/(\d+)(?:\?.*)?$/;
      const matchGeneral = url.match(regexGeneral);

      if (matchGeneral?.[1] && matchGeneral[2]) {
        return {
          productId: matchGeneral[2],
          productName: '',
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Erro ao extrair informações do produto:', error);
      return null;
    }
  }

  /**
   * Formata mensagens promocionais inserindo uma linha em branco entre seções
   * Ex.:
   * Linha 1\n
   * Linha 2\n
   * Linha 3
   * - Mantém linhas já em branco
   * - Evita inserir linhas em branco duplicadas
   */
  formatPromoMessage(message: string): string {
    if (!message || typeof message !== 'string') return message;

    // Normaliza quebras de linha
    const lines = message.replace(/\r\n/g, '\n').split('\n');

    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const curr = lines[i];
      out.push(curr);

      const hasNext = i < lines.length - 1;
      if (!hasNext) continue;

      const currNonEmpty = curr.trim().length > 0;
      const nextNonEmpty = lines[i + 1].trim().length > 0;

      // Insere linha vazia somente entre duas linhas não vazias
      if (currNonEmpty && nextNonEmpty) {
        out.push('');
      }
    }

    // Evita múltiplas linhas em branco consecutivas (colapsa para uma)
    const collapsed = out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd();

    return collapsed;
  }
}
