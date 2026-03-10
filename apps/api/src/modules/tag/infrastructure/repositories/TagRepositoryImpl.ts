import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ITagRepository, CreateTagData } from '../../domain/repositories/ITagRepository';
import { Tag } from '../../domain/entities/Tag';

@Injectable()
export class TagRepositoryImpl implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Tag[]> {
    const rows = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    return rows.map(r => Tag.restore({ id: r.id, userId: r.userId, name: r.name, color: r.color }));
  }

  async findById(id: string, userId: string): Promise<Tag | null> {
    const row = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!row) return null;
    return Tag.restore({ id: row.id, userId: row.userId, name: row.name, color: row.color });
  }

  async findByName(userId: string, name: string): Promise<Tag | null> {
    const row = await this.prisma.tag.findUnique({ where: { userId_name: { userId, name } } });
    if (!row) return null;
    return Tag.restore({ id: row.id, userId: row.userId, name: row.name, color: row.color });
  }

  async create(data: CreateTagData): Promise<Tag> {
    const row = await this.prisma.tag.create({ data });
    return Tag.restore({ id: row.id, userId: row.userId, name: row.name, color: row.color });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.tag.delete({ where: { id } });
  }
}
