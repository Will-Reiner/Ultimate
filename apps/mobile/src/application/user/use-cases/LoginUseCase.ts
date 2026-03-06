import { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { UserErrors } from '@domain/user/errors/UserErrors';
import { AuthResultDTO } from '../dtos/UserDTO';

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<AuthResultDTO> {
    const { email, password } = input;

    if (!email || !password) {
      throw UserErrors.invalidCredentials();
    }

    const result = await this.userRepository.authenticate(email, password);

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        createdAt: result.user.createdAt.toISOString(),
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}
