import { IsInt } from 'class-validator';

export class FindConfigSelectIdDto {
  @IsInt()
  PROJECT_ID?: number;

  @IsInt()
  CONFIG_ID: number;
}
