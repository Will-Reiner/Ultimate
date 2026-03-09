import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
