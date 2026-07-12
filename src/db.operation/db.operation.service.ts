import { Injectable } from '@nestjs/common';
import { MESSAGES } from 'src/core/utils/constants/globalConstants';

import { resultQueryData } from 'src/core/utils/globalResult/global.result';
import { ResultModel } from 'src/core/utils/result.model';
import { DatabaseService } from 'src/database/database.service';

import { FindConfigSelectIdDto } from './dto/find-config-select-id.dto';
import { FindConfigSelectIdQuery } from './query/find-config-select-id.query';

import { SpConfigSelectIdType } from './types/db.operation.type';

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
}
