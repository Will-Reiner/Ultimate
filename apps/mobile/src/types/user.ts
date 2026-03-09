export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResultDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}
