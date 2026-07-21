import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ResolvedShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import { ResultModel } from 'src/core/utils/result.model';
import {
  CONFIG_LOOKUP_STATUS,
  DbOperationService,
} from 'src/db.operation/db.operation.service';
import {
  ConfigShopeeSelectResult,
  TblConfigShopeeRecord,
} from 'src/db.operation/types/db.operation.type';
import {
  MissingShopeeConfigField,
  ShopeeConfigurationMapper,
} from '../mappers/shopee-configuration.mapper';

/**
 * Resolver dedicado a configuracao Shopee: carrega o registro exato pelo
 * CONFIG_ID validado na request, mapeia apenas os campos Shopee, valida
 * integridade/ativo e devolve uma ResolvedShopeeConfiguration tipada.
 *
 * Lookup direto por request (sem cache) para que credential rotation tenha
 * efeito imediato e o caller selecione sempre o registro atual.
 */
@Injectable()
export class ShopeeConfigurationResolver {
  private readonly logger = new Logger(ShopeeConfigurationResolver.name);

  constructor(
    private readonly dbOperationService: DbOperationService,
    private readonly mapper: ShopeeConfigurationMapper,
  ) {}

  async resolve(configId: number): Promise<ResolvedShopeeConfiguration> {
    if (!Number.isInteger(configId) || configId <= 0) {
      // Defense-in-depth: a validacao de request deve pegar isto antes.
      throw new UnprocessableEntityException(
        'configId deve ser um inteiro positivo',
      );
    }

    const result =
      await this.dbOperationService.tskFindConfigSelectId(configId);

    this.assertExecutionSuccess(result, configId);
    const record = extractRecord(result, configId);

    const mapped = this.mapper.map(record);
    if (mapped.inactive) {
      throw new UnprocessableEntityException(
        `Configuracao CONFIG_ID=${configId} esta inativa`,
      );
    }
    if (!mapped.config) {
      const categories = formatMissingCategories(mapped.missing);
      throw new UnprocessableEntityException(
        `Configuracao CONFIG_ID=${configId} esta incompleta: ${categories}`,
      );
    }

    return mapped.config;
  }

  private assertExecutionSuccess(result: ResultModel, configId: number): void {
    if (result.statusCode === CONFIG_LOOKUP_STATUS.EXECUTION_FAILURE) {
      this.logger.error(
        `Falha de execucao ao carregar CONFIG_ID=${configId}: ${result.message}`,
      );
      throw new InternalServerErrorException(
        'Falha ao carregar a configuracao solicitada',
      );
    }
  }
}

/**
 * Extrai o registro da resposta do banco ou joga NotFoundException quando o
 * CONFIG_ID solicitado nao existe. Mantem o ID solicitado no contexto sem
 * expor credenciais.
 */
export function extractRecord(
  result: ResultModel,
  configId: number,
): TblConfigShopeeRecord {
  const record = (result.data as ConfigShopeeSelectResult | undefined)?.[0];
  if (!record) {
    throw new NotFoundException(
      `Configuracao CONFIG_ID=${configId} nao encontrada`,
    );
  }
  return record;
}

/**
 * Formata a lista de campos ausentes em categorias legiveis pelo frontend,
 * sem expor valores reais.
 */
export function formatMissingCategories(
  missing: MissingShopeeConfigField[],
): string {
  if (missing.length === 0) return 'campos obrigatorios ausentes';
  return missing.join(', ');
}
