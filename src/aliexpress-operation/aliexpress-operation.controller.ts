import { Controller, Get, Param } from '@nestjs/common';
import { AliexpressOperationService } from './aliexpress-operation.service';

@Controller('aliexpress-operation')
export class AliexpressOperationController {
  constructor(
    private readonly aliexpressOperationService: AliexpressOperationService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aliexpressOperationService.findOne(+id);
  }
}
