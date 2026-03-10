import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['build', 'quit'])
  @IsOptional()
  type?: 'build' | 'quit';

  @IsEnum(['boolean', 'quantitative'])
  @IsOptional()
  tracking_mode?: 'boolean' | 'quantitative';

  @IsInt()
  @Min(1)
  @IsOptional()
  daily_target?: number;

  @IsString()
  @IsOptional()
  target_unit?: string;

  @IsEnum(['daily', 'weekly', 'specific_days', 'interval'])
  frequency_type: 'daily' | 'weekly' | 'specific_days' | 'interval';

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  frequency_times_per_week?: number;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  frequency_days?: number[];

  @IsInt()
  @Min(2)
  @IsOptional()
  frequency_every_n_days?: number;

  @IsEnum(['deadline', 'ongoing'])
  @IsOptional()
  goal_type?: 'deadline' | 'ongoing';

  @IsInt()
  @Min(1)
  @IsOptional()
  goal_target_value?: number;

  @IsString()
  @IsOptional()
  goal_target_unit?: string;

  @IsDateString()
  @IsOptional()
  goal_deadline?: string;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsBoolean()
  @IsOptional()
  track_relapse_intensity?: boolean;

  @IsBoolean()
  @IsOptional()
  track_relapse_trigger?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tag_ids?: string[];

  @IsArray()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { each: true, message: 'Each reminder must be in HH:mm format' })
  @IsOptional()
  reminders?: string[];
}
