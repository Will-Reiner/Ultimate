import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEntryDto {
  @IsDateString()
  @IsOptional()
  completed_at?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
