import { IUserRepository } from '@domain/user/repositories/IUserRepository';
import { UserErrors } from '@domain/user/errors/UserErrors';
import { AuthResultDTO } from '../dtos/UserDTO';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<AuthResultDTO> {
    const { name, email, password } = input;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw UserErrors.invalidEmail();
    }

    if (!name || name.trim().length < 2) {
      throw UserErrors.invalidName();
    }

    if (!password || password.length < 8) {
      throw UserErrors.weakPassword();
    }

    const result = await this.userRepository.register(name.trim(), email, password);

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
