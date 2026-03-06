import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { Habit, HabitEntry } from '@prisma/client';

function toHabitResponse(habit: Habit) {
  return {
    id: habit.id,
    user_id: habit.userId,
    title: habit.title,
    description: habit.description ?? null,
    emoji: habit.emoji ?? null,
    frequency_type: habit.frequencyType,
    days_of_week: habit.daysOfWeek,
    color: habit.color ?? null,
    is_archived: habit.isArchived,
    created_at: habit.createdAt.toISOString(),
    updated_at: habit.updatedAt.toISOString(),
  };
}

function toEntryResponse(entry: HabitEntry) {
  return {
    id: entry.id,
    habit_id: entry.habitId,
    completed_at: entry.completedAt.toISOString(),
    note: entry.note ?? null,
  };
}

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return habits.map(toHabitResponse);
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) throw new NotFoundException('Hábito não encontrado.');
    return toHabitResponse(habit);
  }

  async create(userId: string, dto: CreateHabitDto) {
    const habit = await this.prisma.habit.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        emoji: dto.emoji,
        frequencyType: dto.frequency_type,
        daysOfWeek: dto.days_of_week ?? [],
        color: dto.color,
      },
    });
    return toHabitResponse(habit);
  }

  async update(id: string, userId: string, dto: UpdateHabitDto) {
    await this.findOne(id, userId);
    const habit = await this.prisma.habit.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.emoji !== undefined && { emoji: dto.emoji }),
        ...(dto.frequency_type !== undefined && { frequencyType: dto.frequency_type }),
        ...(dto.days_of_week !== undefined && { daysOfWeek: dto.days_of_week }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.is_archived !== undefined && { isArchived: dto.is_archived }),
      },
    });
    return toHabitResponse(habit);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.habit.delete({ where: { id } });
  }

  async getEntries(habitId: string, userId: string, from: Date, to: Date) {
    await this.findOne(habitId, userId);
    const entries = await this.prisma.habitEntry.findMany({
      where: { habitId, completedAt: { gte: from, lt: to } },
      orderBy: { completedAt: 'asc' },
    });
    return entries.map(toEntryResponse);
  }

  async createEntry(habitId: string, userId: string, dto: CreateEntryDto) {
    await this.findOne(habitId, userId);

    const completedAt = dto.completed_at ? new Date(dto.completed_at) : new Date();
    const startOfDay = new Date(completedAt);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existing = await this.prisma.habitEntry.findFirst({
      where: { habitId, completedAt: { gte: startOfDay, lt: endOfDay } },
    });
    if (existing) throw new ConflictException('Hábito já foi completado hoje.');

    const entry = await this.prisma.habitEntry.create({
      data: { habitId, completedAt, note: dto.note },
    });
    return toEntryResponse(entry);
  }
}
