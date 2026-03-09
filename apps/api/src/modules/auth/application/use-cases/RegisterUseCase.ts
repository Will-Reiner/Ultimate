import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from '../../../user/application/use-cases/CreateUserUseCase';
import { EmailAlreadyInUseError } from '../../../user/domain/errors/UserErrors';
import { User } from '../../../user/domain/entities/User';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
  ) {}

  async execute(name: string, email: string, password: string): Promise<User> {
    try {
      return await this.createUser.execute(name, email, password);
    } catch (err) {
      if (err instanceof EmailAlreadyInUseError) throw new ConflictException(err.message);
      throw err;
    }
  }
}
