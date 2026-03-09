import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/IUserRepository';
import { PasswordService } from '../../infrastructure/services/PasswordService';
import { EmailAlreadyInUseError } from '../../domain/errors/UserErrors';
import { User } from '../../domain/entities/User';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(name: string, email: string, password: string): Promise<User> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new EmailAlreadyInUseError();

    const passwordHash = await this.passwordService.hash(password);
    return this.userRepository.create({ name, email, passwordHash });
  }
}
