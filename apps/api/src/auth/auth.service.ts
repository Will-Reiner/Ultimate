import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email ou senha incorretos.');

    const valid = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!valid) throw new UnauthorizedException('Email ou senha incorretos.');

    return this.buildAuthResponse(user);
  }

  async register(name: string, email: string, password: string) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new ConflictException('Email já cadastrado.');

    const user = await this.usersService.create(name, email, password);
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
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
        avatar_url: user.avatarUrl ?? null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
