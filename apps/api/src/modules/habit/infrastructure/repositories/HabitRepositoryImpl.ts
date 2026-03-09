import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IHabitRepository,
  CreateHabitData,
  UpdateHabitData,
} from '../../domain/repositories/IHabitRepository';
import { Habit } from '../../domain/entities/Habit';
import { HabitEntry } from '../../domain/entities/HabitEntry';

function mapToHabit(raw: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  frequencyType: string;
  daysOfWeek: number[];
  goalValue: number | null;
  goalUnit: string | null;
  reminderTime: string | null;
  color: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Habit {
  return Habit.restore({
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    description: raw.description,
    emoji: raw.emoji,
    type: raw.type,
    frequencyType: raw.frequencyType,
    daysOfWeek: raw.daysOfWeek,
    goalValue: raw.goalValue,
    goalUnit: raw.goalUnit,
    reminderTime: raw.reminderTime,
    color: raw.color,
    isArchived: raw.isArchived,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

function mapToEntry(raw: {
  id: string;
  habitId: string;
  completedAt: Date;
  value: number;
  note: string | null;
}): HabitEntry {
  return HabitEntry.restore({
    id: raw.id,
    habitId: raw.habitId,
    completedAt: raw.completedAt,
    value: raw.value,
    note: raw.note,
  });
}

@Injectable()
export class HabitRepositoryImpl implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Habit[]> {
    const rows = await this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(mapToHabit);
  }

  async findOne(id: string, userId: string): Promise<Habit | null> {
    const raw = await this.prisma.habit.findFirst({ where: { id, userId } });
    return raw ? mapToHabit(raw) : null;
  }

  async create(data: CreateHabitData): Promise<Habit> {
    const raw = await this.prisma.habit.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        emoji: data.emoji,
        type: data.type,
        frequencyType: data.frequencyType,
        daysOfWeek: data.daysOfWeek,
        goalValue: data.goalValue,
        goalUnit: data.goalUnit,
        reminderTime: data.reminderTime,
        color: data.color,
      },
    });
    return mapToHabit(raw);
  }

  async update(id: string, data: UpdateHabitData): Promise<Habit> {
    const raw = await this.prisma.habit.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.emoji !== undefined && { emoji: data.emoji }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.frequencyType !== undefined && { frequencyType: data.frequencyType }),
        ...(data.daysOfWeek !== undefined && { daysOfWeek: data.daysOfWeek }),
        ...(data.goalValue !== undefined && { goalValue: data.goalValue }),
        ...(data.goalUnit !== undefined && { goalUnit: data.goalUnit }),
        ...(data.reminderTime !== undefined && { reminderTime: data.reminderTime }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    });
    return mapToHabit(raw);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.habit.delete({ where: { id } });
  }

  async getEntries(habitId: string, from: Date, to: Date): Promise<HabitEntry[]> {
    const rows = await this.prisma.habitEntry.findMany({
      where: { habitId, completedAt: { gte: from, lt: to } },
      orderBy: { completedAt: 'asc' },
    });
    return rows.map(mapToEntry);
  }

  async findEntryBetween(habitId: string, from: Date, to: Date): Promise<HabitEntry | null> {
    const raw = await this.prisma.habitEntry.findFirst({
      where: { habitId, completedAt: { gte: from, lt: to } },
    });
    return raw ? mapToEntry(raw) : null;
  }

  async createEntry(habitId: string, completedAt: Date, value: number, note?: string): Promise<HabitEntry> {
    const raw = await this.prisma.habitEntry.create({
      data: { habitId, completedAt, value, note },
    });
    return mapToEntry(raw);
  }
}
