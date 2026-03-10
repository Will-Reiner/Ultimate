import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';

@Injectable()
export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } });
    return rows.map(r => Category.restore({ id: r.id, name: r.name, icon: r.icon, color: r.color }));
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.prisma.category.findUnique({ where: { id } });
    if (!row) return null;
    return Category.restore({ id: row.id, name: row.name, icon: row.icon, color: row.color });
  }
}
