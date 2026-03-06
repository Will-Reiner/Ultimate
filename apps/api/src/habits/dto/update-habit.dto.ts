import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class UpdateHabitDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  emoji?: string;

  @IsEnum(['daily', 'weekly', 'custom'])
  @IsOptional()
  frequency_type?: 'daily' | 'weekly' | 'custom';

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  days_of_week?: number[];

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}
