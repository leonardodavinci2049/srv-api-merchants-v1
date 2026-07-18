import type { SortType } from './shopee-product-offer.interface';

/**
 * Configuracao de transporte usada pelo adapter da API Shopee.
 * Todos os campos sao derivados do registro selecionado no banco de dados.
 */
export interface ShopeeConfiguration {
  credential: string;
  secretKey: string;
  affiliateSubids: string;
  endpoint: string;
  timeoutMs: number;
}

/**
 * Configuracao Shopee resolvida a partir do registro selecionado pelo caller.
 *
 * Estende ShopeeConfiguration (campos de transporte) e adiciona campos de
 * operacao/persistencia e defaults de request. O configId e mantido apenas
 * para contexto diagnostico; nada aqui deve ser logado como segredo.
 */
export interface ResolvedShopeeConfiguration extends ShopeeConfiguration {
  configId: number;
  clientId: number;
  appId: number;
  flagClick: number;
  currency: string;
  location: string;
  defaultPage: number;
  defaultSortType: SortType;
  defaultLimit: number;
}
