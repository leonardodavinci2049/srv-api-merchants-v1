import { Injectable } from '@nestjs/common';

@Injectable()
export class AliexpressOperationService {
  findOne(id: number) {
    return `This action returns a #${id} aliexpressOperation`;
  }
}
