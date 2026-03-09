import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  Matches,
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

  @IsEnum(['build', 'quit'])
  @IsOptional()
  type?: 'build' | 'quit';

  @IsEnum(['daily', 'weekly'])
  frequency_type: 'daily' | 'weekly';

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  days_of_week?: number[];

  @IsInt()
  @Min(1)
  @IsOptional()
  goal_value?: number;

  @IsString()
  @IsOptional()
  goal_unit?: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'reminder_time must be in HH:mm format' })
  @IsOptional()
  reminder_time?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
