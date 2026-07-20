import { PartialType } from '@nestjs/mapped-types';
import { CreateAliexpressOperationDto } from './create-aliexpress-operation.dto';

export class UpdateAliexpressOperationDto extends PartialType(
  CreateAliexpressOperationDto,
) {}
