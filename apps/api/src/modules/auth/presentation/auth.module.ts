import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../user/presentation/users.module';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../application/use-cases/RegisterUseCase';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [LoginUseCase, RegisterUseCase, AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
