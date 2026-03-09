import { UserResponseDto } from '../../../user/application/dtos/UserResponseDto';

export interface AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
  refresh_token: string;
}
