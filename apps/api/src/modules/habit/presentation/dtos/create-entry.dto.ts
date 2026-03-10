import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateEntryDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  @IsOptional()
  date?: string;

  @IsEnum(['check_in', 'relapse'])
  @IsOptional()
  entry_type?: 'check_in' | 'relapse';

  @IsInt()
  @Min(1)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  intensity?: number;

  @IsString()
  @IsOptional()
  trigger?: string;
}
