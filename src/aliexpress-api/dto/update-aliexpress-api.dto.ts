import { PartialType } from '@nestjs/mapped-types';
import { CreateAliexpressApiDto } from './create-aliexpress-api.dto';

export class UpdateAliexpressApiDto extends PartialType(
  CreateAliexpressApiDto,
) {}
