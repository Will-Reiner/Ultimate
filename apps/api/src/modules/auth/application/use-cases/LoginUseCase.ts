import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../../user/application/use-cases/FindUserByEmailUseCase';
import { PasswordService } from '../../../user/infrastructure/services/PasswordService';
import { User } from '../../../user/domain/entities/User';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const user = await this.findUserByEmail.execute(email);
    if (!user) throw new UnauthorizedException('Email ou senha incorretos.');

    const valid = await this.passwordService.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou senha incorretos.');

    return user;
  }
}
