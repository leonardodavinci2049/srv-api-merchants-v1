import { IsInt, IsPositive } from 'class-validator';

export class FindConfigSelectIdDto {
  @IsInt()
  @IsPositive()
  CONFIG_ID: number;
}

