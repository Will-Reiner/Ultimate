import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  emoji?: string;

  @IsEnum(['daily', 'weekly', 'custom'])
  frequency_type: 'daily' | 'weekly' | 'custom';

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  days_of_week?: number[];

  @IsString()
  @IsOptional()
  color?: string;
}
