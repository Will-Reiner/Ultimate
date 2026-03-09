import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../application/use-cases/RegisterUseCase';
import { AuthResponseDto } from '../application/dtos/AuthResponseDto';
import { User } from '../../user/domain/entities/User';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.loginUseCase.execute(email, password);
    return this.buildAuthResponse(user);
  }

  async register(name: string, email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.registerUseCase.execute(name, email, password);
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatarUrl,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
