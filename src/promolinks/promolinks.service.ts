import { Injectable } from '@nestjs/common';
import { processProcedureResultMutation } from 'src/core/procedure.result/process-procedure-result.mutation';
import { processProcedureResultMultiQuery } from 'src/core/procedure.result/process-procedure-result.query';
import { MESSAGES } from 'src/core/utils/constants/globalConstants';
import { ResultModel } from 'src/core/utils/result.model';
import { DatabaseService } from 'src/database/database.service';
import { LinkGenerationCreateV2Dto } from './dto/link-generation-create-v2.dto';
import { LinkGenerationFindAllV2Dto } from './dto/link-generation-find-all-v2.dto';
import { PromoLinkFindAllV2Dto } from './dto/promo-link-find-all_v2.dto';
import { LinkGenerationCreateV2Query } from './query/link-generation-create-v2.query';
import { LinkGenerationFindAllV2Query } from './query/link-generation-find-all-v2.query';
import { PromoLinkFindAllV2Query } from './query/promo-link-find-all_v2.query';
import {
  SpResultlinkGenerationFindAllData,
  SpResultPromoLinkFindAllData,
  SpResultRecordCreateType,
} from './types/promolinks-type';

@Injectable()
export class PromolinksService {
  constructor(private readonly dbService: DatabaseService) {}
  create() {
    return 'This action adds a new promolink';
  }

  async taskLinkGenerationCreateV2(dataJsonDto: LinkGenerationCreateV2Dto) {
    try {
      const queryString = LinkGenerationCreateV2Query(dataJsonDto);

      const resultData = (await this.dbService.selectExecute(
        queryString,
      )) as unknown as SpResultRecordCreateType;

      return processProcedureResultMutation(
        resultData as unknown[],
        'Link generation  create failed',
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, 0, []);
    }
  }

  async taskLinkGenerationFindAllV2(dataJsonDto: LinkGenerationFindAllV2Dto) {
    try {
      const queryString = LinkGenerationFindAllV2Query(dataJsonDto);

      const resultData = (await this.dbService.selectExecute(
        queryString,
      )) as unknown as SpResultlinkGenerationFindAllData;

      return processProcedureResultMultiQuery(
        resultData as unknown[],
        ['Link generation find All'],
        'Link generation find All not found',
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, 0, []);
    }
  }

  async taskPromoLinkFindAllV2(dataJsonDto: PromoLinkFindAllV2Dto) {
    try {
      const queryString = PromoLinkFindAllV2Query(dataJsonDto);

      const resultData = (await this.dbService.selectExecute(
        queryString,
      )) as unknown as SpResultPromoLinkFindAllData;

      return processProcedureResultMultiQuery(
        resultData as unknown[],
        ['Promo link find All'],
        'Promo link find All not found',
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, 0, []);
    }
  }
}
