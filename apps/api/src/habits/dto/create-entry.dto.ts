import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEntryDto {
  @IsDateString()
  @IsOptional()
  completed_at?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
