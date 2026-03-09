import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  execute(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
