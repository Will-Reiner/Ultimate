import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUserRepository, CreateUserData } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

function mapToUser(raw: {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return User.restore({
    id: raw.id,
    name: raw.name,
    email: raw.email,
    passwordHash: raw.password,
    avatarUrl: raw.avatarUrl ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? mapToUser(raw) : null;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? mapToUser(raw) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const raw = await this.prisma.user.create({
      data: { name: data.name, email: data.email, password: data.passwordHash },
    });
    return mapToUser(raw);
  }
}
