import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IHabitRepository,
  CreateHabitData,
  UpdateHabitData,
  CreateEntryData,
} from '../../domain/repositories/IHabitRepository';
import { Habit, HabitType, TrackingMode, HabitStatus } from '../../domain/entities/Habit';
import { HabitEntry, EntryType } from '../../domain/entities/HabitEntry';
import { Frequency, FrequencyType } from '../../domain/value-objects/Frequency';
import { Goal, GoalType, GoalStatus } from '../../domain/value-objects/Goal';

type PrismaHabitWithRelations = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: string;
  trackingMode: string;
  dailyTarget: number | null;
  targetUnit: string | null;
  frequencyType: string;
  frequencyTimesPerWeek: number | null;
  frequencyDays: number[];
  frequencyEveryNDays: number | null;
  goalType: string | null;
  goalTargetValue: number | null;
  goalTargetUnit: string | null;
  goalDeadline: Date | null;
  goalStatus: string | null;
  categoryId: string | null;
  status: string;
  trackRelapseIntensity: boolean;
  trackRelapseTrigger: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: { tagId: string }[];
  reminders?: { time: string }[];
};

function mapToHabit(raw: PrismaHabitWithRelations): Habit {
  const frequency = Frequency.create({
    type: raw.frequencyType as FrequencyType,
    timesPerWeek: raw.frequencyTimesPerWeek ?? undefined,
    days: raw.frequencyDays.length > 0 ? raw.frequencyDays : undefined,
    everyNDays: raw.frequencyEveryNDays ?? undefined,
  });

  let goal: Goal | null = null;
  if (raw.goalType && raw.goalTargetValue != null && raw.goalTargetUnit) {
    goal = Goal.restore({
      type: raw.goalType as GoalType,
      targetValue: raw.goalTargetValue,
      targetUnit: raw.goalTargetUnit,
      deadline: raw.goalDeadline ?? undefined,
      status: (raw.goalStatus as GoalStatus) ?? 'in_progress',
    });
  }

  return Habit.restore({
    id: raw.id,
    userId: raw.userId,
    name: raw.name,
    description: raw.description,
    type: raw.type as HabitType,
    trackingMode: raw.trackingMode as TrackingMode,
    dailyTarget: raw.dailyTarget,
    targetUnit: raw.targetUnit,
    frequency,
    goal,
    categoryId: raw.categoryId,
    tags: raw.tags?.map((t) => t.tagId) ?? [],
    reminders: raw.reminders?.map((r) => r.time) ?? [],
    status: raw.status as HabitStatus,
    trackRelapseIntensity: raw.trackRelapseIntensity,
    trackRelapseTrigger: raw.trackRelapseTrigger,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

function mapToEntry(raw: {
  id: string;
  habitId: string;
  date: string;
  entryType: string;
  value: number;
  note: string | null;
  intensity: number | null;
  trigger: string | null;
  createdAt: Date;
}): HabitEntry {
  return HabitEntry.restore({
    id: raw.id,
    habitId: raw.habitId,
    date: raw.date,
    entryType: raw.entryType as EntryType,
    value: raw.value,
    note: raw.note,
    intensity: raw.intensity,
    trigger: raw.trigger,
    createdAt: raw.createdAt,
  });
}

const habitInclude = {
  tags: { select: { tagId: true } },
  reminders: { select: { time: true } },
};

@Injectable()
export class HabitRepositoryImpl implements IHabitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, status?: HabitStatus): Promise<Habit[]> {
    const rows = await this.prisma.habit.findMany({
      where: { userId, ...(status && { status }) },
      include: habitInclude,
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(mapToHabit);
  }

  async findOne(id: string, userId: string): Promise<Habit | null> {
    const raw = await this.prisma.habit.findFirst({
      where: { id, userId },
      include: habitInclude,
    });
    return raw ? mapToHabit(raw) : null;
  }

  async create(data: CreateHabitData): Promise<Habit> {
    const raw = await this.prisma.habit.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description,
        type: data.type,
        trackingMode: data.trackingMode,
        dailyTarget: data.dailyTarget,
        targetUnit: data.targetUnit,
        frequencyType: data.frequencyType,
        frequencyTimesPerWeek: data.frequencyTimesPerWeek,
        frequencyDays: data.frequencyDays ?? [],
        frequencyEveryNDays: data.frequencyEveryNDays,
        goalType: data.goalType,
        goalTargetValue: data.goalTargetValue,
        goalTargetUnit: data.goalTargetUnit,
        goalDeadline: data.goalDeadline,
        goalStatus: data.goalStatus ?? (data.goalType ? 'in_progress' : undefined),
        categoryId: data.categoryId,
        status: data.status ?? 'active',
        trackRelapseIntensity: data.trackRelapseIntensity ?? false,
        trackRelapseTrigger: data.trackRelapseTrigger ?? false,
        ...(data.tagIds?.length && {
          tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        }),
        ...(data.reminders?.length && {
          reminders: { create: data.reminders.map((time) => ({ time })) },
        }),
      },
      include: habitInclude,
    });
    return mapToHabit(raw);
  }

  async update(id: string, data: UpdateHabitData): Promise<Habit> {
    // Handle tags: delete existing + recreate
    if (data.tagIds !== undefined) {
      await this.prisma.habitTag.deleteMany({ where: { habitId: id } });
    }
    // Handle reminders: delete existing + recreate
    if (data.reminders !== undefined) {
      await this.prisma.reminder.deleteMany({ where: { habitId: id } });
    }

    const raw = await this.prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.trackingMode !== undefined && { trackingMode: data.trackingMode }),
        ...(data.dailyTarget !== undefined && { dailyTarget: data.dailyTarget }),
        ...(data.targetUnit !== undefined && { targetUnit: data.targetUnit }),
        ...(data.frequencyType !== undefined && { frequencyType: data.frequencyType }),
        ...(data.frequencyTimesPerWeek !== undefined && { frequencyTimesPerWeek: data.frequencyTimesPerWeek }),
        ...(data.frequencyDays !== undefined && { frequencyDays: data.frequencyDays }),
        ...(data.frequencyEveryNDays !== undefined && { frequencyEveryNDays: data.frequencyEveryNDays }),
        ...(data.goalType !== undefined && { goalType: data.goalType }),
        ...(data.goalTargetValue !== undefined && { goalTargetValue: data.goalTargetValue }),
        ...(data.goalTargetUnit !== undefined && { goalTargetUnit: data.goalTargetUnit }),
        ...(data.goalDeadline !== undefined && { goalDeadline: data.goalDeadline }),
        ...(data.goalStatus !== undefined && { goalStatus: data.goalStatus }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.trackRelapseIntensity !== undefined && { trackRelapseIntensity: data.trackRelapseIntensity }),
        ...(data.trackRelapseTrigger !== undefined && { trackRelapseTrigger: data.trackRelapseTrigger }),
        ...(data.tagIds !== undefined && data.tagIds.length > 0 && {
          tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
        }),
        ...(data.reminders !== undefined && data.reminders.length > 0 && {
          reminders: { create: data.reminders.map((time) => ({ time })) },
        }),
      },
      include: habitInclude,
    });
    return mapToHabit(raw);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.habit.delete({ where: { id } });
  }

  async getEntries(habitId: string, from: string, to: string, entryType?: string): Promise<HabitEntry[]> {
    const rows = await this.prisma.habitEntry.findMany({
      where: {
        habitId,
        date: { gte: from, lte: to },
        ...(entryType && { entryType }),
      },
      orderBy: { date: 'asc' },
    });
    return rows.map(mapToEntry);
  }

  async findEntryByDate(habitId: string, date: string, entryType?: string): Promise<HabitEntry | null> {
    const raw = await this.prisma.habitEntry.findFirst({
      where: { habitId, date, ...(entryType && { entryType }) },
    });
    return raw ? mapToEntry(raw) : null;
  }

  async createEntry(data: CreateEntryData): Promise<HabitEntry> {
    const raw = await this.prisma.habitEntry.create({
      data: {
        habitId: data.habitId,
        date: data.date,
        entryType: data.entryType,
        value: data.value,
        note: data.note,
        intensity: data.intensity,
        trigger: data.trigger,
      },
    });
    return mapToEntry(raw);
  }
}
