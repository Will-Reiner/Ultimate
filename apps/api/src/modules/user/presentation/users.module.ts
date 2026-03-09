import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../domain/repositories/IUserRepository';
import { UserRepositoryImpl } from '../infrastructure/repositories/UserRepositoryImpl';
import { PasswordService } from '../infrastructure/services/PasswordService';
import { FindUserByEmailUseCase } from '../application/use-cases/FindUserByEmailUseCase';
import { FindUserByIdUseCase } from '../application/use-cases/FindUserByIdUseCase';
import { CreateUserUseCase } from '../application/use-cases/CreateUserUseCase';

@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    PasswordService,
    FindUserByEmailUseCase,
    FindUserByIdUseCase,
    CreateUserUseCase,
  ],
  exports: [FindUserByEmailUseCase, FindUserByIdUseCase, CreateUserUseCase, PasswordService],
})
export class UsersModule {}
