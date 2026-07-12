import { Injectable } from '@nestjs/common';
import { processProcedureResultMutation } from 'src/core/procedure.result/process-procedure-result.mutation';
import { processProcedureResultMultiQuery } from 'src/core/procedure.result/process-procedure-result.query';
import { MESSAGES } from 'src/core/utils/constants/globalConstants';

import { resultQueryData } from 'src/core/utils/globalResult/global.result';
import { ResultModel } from 'src/core/utils/result.model';
import { DatabaseService } from 'src/database/database.service';

import { FindConfigSelectIdDto } from './dto/find-config-select-id.dto';
import { LinkGenerationCreateV2Dto } from './dto/link-generation-create-v2.dto';
import { LinkGenerationFindAllV2Dto } from './dto/link-generation-find-all-v2.dto';
import { PromoLinkFindAllV2Dto } from './dto/promo-link-find-all_v2.dto';
import { FindConfigSelectIdQuery } from './query/find-config-select-id.query';
import { LinkGenerationCreateV2Query } from './query/link-generation-create-v2.query';
import { LinkGenerationFindAllV2Query } from './query/link-generation-find-all-v2.query';
import { PromoLinkFindAllV2Query } from './query/promo-link-find-all_v2.query';

import { SpConfigSelectIdType } from './types/db.operation.type';
import {
  SpResultlinkGenerationFindAllData,
  SpResultPromoLinkFindAllData,
  SpResultRecordCreateType,
} from './types/link-generation.type';

@Injectable()
export class DbOperationService {
  constructor(private readonly dbService: DatabaseService) {}
  // xxxx
  async tskFindConfigSelectId(dataJsonDto: FindConfigSelectIdDto) {
    try {
      const queryString = FindConfigSelectIdQuery(dataJsonDto);

      const resultData = (await this.dbService.selectExecute(
        queryString,
      )) as unknown as SpConfigSelectIdType;

      const tblRecords = resultData[0];

      const qtRecords: number = tblRecords.length;

      const tblRecord = tblRecords[0] || 0;

      const recordId: number = tblRecord?.CONFIG_ID ?? 0;

      if (recordId > 0) {
        //TODO: Send instructions by email or WhatsApp
      }

      return resultQueryData<SpConfigSelectIdType>(
        recordId,
        0,
        '',
        resultData,
        qtRecords,
        '',
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : MESSAGES.UNKNOWN_ERROR;
      return new ResultModel(100404, errorMessage, 0, []);
    }
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
