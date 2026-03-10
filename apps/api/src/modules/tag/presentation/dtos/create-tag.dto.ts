import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color deve ser hex válido (#RRGGBB)' })
  color: string;
}
