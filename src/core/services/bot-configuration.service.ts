import { Injectable, Logger } from '@nestjs/common';
import { DbOperationService } from '../../db.operation/db.operation.service';
import { FindConfigSelectIdDto } from '../../db.operation/dto/find-config-select-id.dto';
import {
  BotConfiguration,
  ConfigSearchParams,
  DatabaseResponse,
} from '../interfaces/bot-configuration.interface';
import { ConfigurationMapper } from '../mappers/configuration.mapper';

/**
 * Serviço reutilizável para carregar configurações de bots do banco de dados
 * Implementa padrão escalável para qualquer bot do sistema
 */
@Injectable()
export class BotConfigurationService {
  private readonly logger = new Logger(BotConfigurationService.name);
  private configCache: Map<string, BotConfiguration> = new Map();
  private readonly cacheExpiration = 5 * 60 * 1000; // 5 minutos em ms

  constructor(private readonly dbOperationService: DbOperationService) {}

  /**
   * Carrega configuração do bot a partir do banco de dados
   * @param configId ID da configuração no banco (cada bot tem seu próprio ID)
   * @param projectId ID do projeto (padrão: 1)
   * @param useCache Se deve usar cache (padrão: true)
   * @returns Promise<BotConfiguration>
   */
  async loadBotConfiguration(
    configId: number,
    projectId: number = 1,
    useCache: boolean = true,
  ): Promise<BotConfiguration> {
    const cacheKey = `${projectId}-${configId}`;

    // Verificar cache primeiro
    if (useCache && this.configCache.has(cacheKey)) {
      const cached = this.configCache.get(cacheKey);
      if (cached) {
        this.logger.log(`Usando configuração do cache: ${cacheKey}`);
        return cached;
      }
    }

    try {
      /*       this.logger.log(
        `Carregando configuração do banco: PROJECT_ID=${projectId}, CONFIG_ID=${configId}`,
      ); */

      // Preparar parâmetros para consulta
      const searchParams: FindConfigSelectIdDto = {
        configId,
      };

      // Buscar no banco de dados
      const response =
        await this.dbOperationService.tskFindConfigSelectId(searchParams);

      // Mapear resposta para configuração
      const config = ConfigurationMapper.mapDatabaseToBotConfig(
        response as DatabaseResponse,
      );

      // Salvar no cache
      if (useCache) {
        this.configCache.set(cacheKey, config);
        this.logger.log(`Configuração salva no cache: ${cacheKey}`);

        // Limpar cache após expiração
        setTimeout(() => {
          this.configCache.delete(cacheKey);
          this.logger.log(`Cache expirado removido: ${cacheKey}`);
        }, this.cacheExpiration);
      }

      return config;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Erro ao carregar configuração ${cacheKey}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Carrega configuração específica para o bot LeoBot (Leonardo2049Bot)
   * CONFIG_ID = 1 - Configuração principal do sistema
   */
  async loadLeoBotConfiguration(): Promise<BotConfiguration> {
    return this.loadBotConfiguration(1);
  }

  /**
   * Carrega configuração específica para o bot LinksdaMih
   * CONFIG_ID = 2 conforme especificado no plano de migração
   */
  async loadMihBotConfiguration(): Promise<BotConfiguration> {
    return this.loadBotConfiguration(2);
  }

  /**
   * Carrega configuração específica para o bot LinksdaBianca
   * CONFIG_ID = 3 conforme especificado no plano de migração
   */
  async loadBiancaBotConfiguration(): Promise<BotConfiguration> {
    return this.loadBotConfiguration(3);
  }

  /**
   * Carrega configuração específica para o bot Suporte da Mih
   * CONFIG_ID = 3 conforme especificado no plano de migração
   */
  async loadSuporteMihBotConfiguration(): Promise<BotConfiguration> {
    return this.loadBotConfiguration(5);
  }

  async loadBotContentShopeeConfiguration(): Promise<BotConfiguration> {
    return this.loadBotConfiguration(4);
  }

  /**
   * Invalida cache de uma configuração específica
   * @param configId ID da configuração
   * @param projectId ID do projeto
   */
  invalidateCache(configId: number, projectId: number = 1): void {
    const cacheKey = `${projectId}-${configId}`;
    if (this.configCache.has(cacheKey)) {
      this.configCache.delete(cacheKey);
      this.logger.log(`Cache invalidado: ${cacheKey}`);
    }
  }

  /**
   * Limpa todo o cache de configurações
   */
  clearCache(): void {
    this.configCache.clear();
    this.logger.log('Cache de configurações limpo completamente');
  }

  /**
   * Recarrega configuração forçando busca no banco
   * @param configId ID da configuração
   * @param projectId ID do projeto
   */
  async reloadConfiguration(
    configId: number,
    projectId: number = 1,
  ): Promise<BotConfiguration> {
    this.invalidateCache(configId, projectId);
    return this.loadBotConfiguration(configId, projectId, false);
  }

  /**
   * Método utilitário para criar parâmetros de busca padronizados
   * @param configId ID da configuração
   */
  createSearchParams(configId: number): ConfigSearchParams {
    return {
      configId,
    };
  }

  /**
   * Verifica se uma configuração existe no cache
   * @param configId ID da configuração
   * @param projectId ID do projeto
   */
  isCached(configId: number, projectId: number = 1): boolean {
    const cacheKey = `${projectId}-${configId}`;
    return this.configCache.has(cacheKey);
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.configCache.size,
      keys: Array.from(this.configCache.keys()),
    };
  }
}
