import {
  IsString,
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

export class UpdateHabitDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(['boolean', 'quantitative'])
  @IsOptional()
  tracking_mode?: 'boolean' | 'quantitative';

  @IsInt()
  @Min(1)
  @IsOptional()
  daily_target?: number | null;

  @IsString()
  @IsOptional()
  target_unit?: string | null;

  @IsEnum(['daily', 'weekly', 'specific_days', 'interval'])
  @IsOptional()
  frequency_type?: 'daily' | 'weekly' | 'specific_days' | 'interval';

  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  frequency_times_per_week?: number | null;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  frequency_days?: number[];

  @IsInt()
  @Min(2)
  @IsOptional()
  frequency_every_n_days?: number | null;

  @IsEnum(['deadline', 'ongoing'])
  @IsOptional()
  goal_type?: 'deadline' | 'ongoing' | null;

  @IsInt()
  @Min(1)
  @IsOptional()
  goal_target_value?: number | null;

  @IsString()
  @IsOptional()
  goal_target_unit?: string | null;

  @IsDateString()
  @IsOptional()
  goal_deadline?: string | null;

  @IsString()
  @IsOptional()
  category_id?: string | null;

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
