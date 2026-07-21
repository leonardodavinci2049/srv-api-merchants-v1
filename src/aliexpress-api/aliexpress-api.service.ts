import { Injectable } from '@nestjs/common';

@Injectable()
export class AliexpressApiService {
  findOne(id: number) {
    return `This action returns a #${id} aliexpressOperation`;
  }
}
