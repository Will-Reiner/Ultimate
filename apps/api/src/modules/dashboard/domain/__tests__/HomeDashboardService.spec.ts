import { HomeDashboardService, HomeSummaryInput } from '../services/HomeDashboardService';
import { HomeSummary } from '../value-objects/HomeSummary';
import { HabitInput, HabitEntryInput } from '../inputs/HabitInput';
import { TaskInput } from '../inputs/TaskInput';
import { CalendarEventInput } from '../inputs/CalendarInput';
import { JournalEntryInput } from '../inputs/JournalInput';

function buildHabit(overrides: Partial<HabitInput> = {}): HabitInput {
  return {
    id: 'h1',
    name: 'Habit',
    type: 'build',
    status: 'active',
    trackingMode: 'boolean',
    frequencyType: 'daily',
    frequencyDays: [],
    frequencyTimesPerWeek: null,
    frequencyEveryNDays: null,
    dailyTarget: null,
    createdAt: new Date(2026, 0, 1),
    currentStreak: 0,
    ...overrides,
  };
}

function buildHabitEntry(overrides: Partial<HabitEntryInput> = {}): HabitEntryInput {
  return {
    habitId: 'h1',
    date: '2026-01-15',
    entryType: 'check_in',
    value: 1,
    trigger: null,
    ...overrides,
  };
}

function buildTask(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    id: 't1',
    title: 'Task',
    statusType: 'todo',
    priorityLevel: 'medium',
    deadline: null,
    assigneeId: null,
    projectId: null,
    completedAt: null,
    ...overrides,
  };
}

function buildEvent(overrides: Partial<CalendarEventInput> = {}): CalendarEventInput {
  return {
    id: 'ev1',
    title: 'Event',
    type: 'meeting' as const,
    startAt: new Date(2026, 0, 15, 10),
    endAt: new Date(2026, 0, 15, 11),
    isAllDay: false,
    ...overrides,
  };
}

function buildJournalEntry(overrides: Partial<JournalEntryInput> = {}): JournalEntryInput {
  return {
    id: 'j1',
    date: new Date(2026, 0, 15),
    moodLevel: 7,
    tagIds: [],
    ...overrides,
  };
}

// 2026-01-15 é uma quinta-feira (getDay() === 4)
const REF_DATE = new Date(2026, 0, 15);

function makeInput(overrides: Partial<HomeSummaryInput> = {}): HomeSummaryInput {
  return {
    habits: [],
    habitEntries: [],
    tasks: [],
    events: [],
    journalEntries: [],
    referenceDate: REF_DATE,
    ...overrides,
  };
}

describe('HomeDashboardService', () => {
  describe('pendingHabits', () => {
    it('conta hábitos devidos hoje que não foram completados', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', frequencyType: 'daily' }),
          buildHabit({ id: 'h2', frequencyType: 'daily' }),
        ],
        habitEntries: [
          buildHabitEntry({ habitId: 'h1', date: '2026-01-15' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.pendingHabits).toBe(1);
    });

    it('ignora hábitos não ativos', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', status: 'paused' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.pendingHabits).toBe(0);
    });

    it('ignora hábitos que não são devidos hoje (specific_days)', () => {
      // REF_DATE é quinta (4), hábito é para segunda (1)
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', frequencyType: 'specific_days', frequencyDays: [1] }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.pendingHabits).toBe(0);
    });

    it('considera hábito quantitativo como completado quando valor >= dailyTarget', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', trackingMode: 'quantitative', dailyTarget: 3 }),
        ],
        habitEntries: [
          buildHabitEntry({ habitId: 'h1', date: '2026-01-15', value: 2 }),
          buildHabitEntry({ habitId: 'h1', date: '2026-01-15', value: 1 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.pendingHabits).toBe(0);
    });

    it('conta hábito quantitativo como pendente quando valor < dailyTarget', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', trackingMode: 'quantitative', dailyTarget: 5 }),
        ],
        habitEntries: [
          buildHabitEntry({ habitId: 'h1', date: '2026-01-15', value: 2 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.pendingHabits).toBe(1);
    });
  });

  describe('todayTasks', () => {
    it('conta tarefas com deadline hoje que não estão concluídas', () => {
      const input = makeInput({
        tasks: [
          buildTask({ id: 't1', deadline: REF_DATE, statusType: 'todo' }),
          buildTask({ id: 't2', deadline: REF_DATE, statusType: 'in_progress' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayTasks).toBe(2);
    });

    it('inclui tarefas atrasadas (deadline antes de hoje)', () => {
      const input = makeInput({
        tasks: [
          buildTask({ id: 't1', deadline: new Date(2026, 0, 10), statusType: 'todo' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayTasks).toBe(1);
    });

    it('exclui tarefas concluídas', () => {
      const input = makeInput({
        tasks: [
          buildTask({ id: 't1', deadline: REF_DATE, statusType: 'done' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayTasks).toBe(0);
    });

    it('exclui tarefas sem deadline', () => {
      const input = makeInput({
        tasks: [
          buildTask({ id: 't1', deadline: null, statusType: 'todo' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayTasks).toBe(0);
    });
  });

  describe('nextEvents', () => {
    it('retorna os próximos 3 eventos ordenados por startAt', () => {
      const input = makeInput({
        events: [
          buildEvent({ id: 'ev3', title: 'Terceiro', startAt: new Date(2026, 0, 17, 10) }),
          buildEvent({ id: 'ev1', title: 'Primeiro', startAt: new Date(2026, 0, 15, 14) }),
          buildEvent({ id: 'ev4', title: 'Quarto', startAt: new Date(2026, 0, 18, 10) }),
          buildEvent({ id: 'ev2', title: 'Segundo', startAt: new Date(2026, 0, 16, 9) }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.nextEvents).toHaveLength(3);
      expect(result.nextEvents[0].id).toBe('ev1');
      expect(result.nextEvents[1].id).toBe('ev2');
      expect(result.nextEvents[2].id).toBe('ev3');
    });

    it('exclui eventos passados', () => {
      const input = makeInput({
        events: [
          buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 14, 10) }),
          buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 15, 10) }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.nextEvents).toHaveLength(1);
      expect(result.nextEvents[0].id).toBe('ev2');
    });
  });

  describe('todayMood', () => {
    it('retorna o moodLevel da entrada de hoje', () => {
      const input = makeInput({
        journalEntries: [
          buildJournalEntry({ date: new Date(2026, 0, 15), moodLevel: 8 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayMood).toBe(8);
    });

    it('retorna null quando não há entrada de hoje', () => {
      const input = makeInput({
        journalEntries: [
          buildJournalEntry({ date: new Date(2026, 0, 14), moodLevel: 5 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayMood).toBeNull();
    });

    it('retorna null quando a entrada de hoje não tem mood', () => {
      const input = makeInput({
        journalEntries: [
          buildJournalEntry({ date: new Date(2026, 0, 15), moodLevel: null }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.todayMood).toBeNull();
    });
  });

  describe('habitCompletionToday', () => {
    it('calcula a porcentagem de hábitos devidos e completados hoje', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1' }),
          buildHabit({ id: 'h2' }),
          buildHabit({ id: 'h3' }),
        ],
        habitEntries: [
          buildHabitEntry({ habitId: 'h1', date: '2026-01-15' }),
          buildHabitEntry({ habitId: 'h2', date: '2026-01-15' }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      // 2 de 3 completados = 66.67%
      expect(result.habitCompletionToday).toBeCloseTo(66.67, 1);
    });

    it('retorna 0 quando nenhum hábito é devido hoje', () => {
      const input = makeInput({ habits: [] });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.habitCompletionToday).toBe(0);
    });
  });

  describe('taskCompletionThisWeek', () => {
    // 2026-01-15 (quinta). Semana: segunda 12 a domingo 18.
    it('calcula a porcentagem de tarefas concluídas na semana', () => {
      const input = makeInput({
        tasks: [
          buildTask({
            id: 't1',
            deadline: new Date(2026, 0, 14), // terça
            statusType: 'done',
            completedAt: new Date(2026, 0, 14),
          }),
          buildTask({
            id: 't2',
            deadline: new Date(2026, 0, 16), // sexta
            statusType: 'todo',
          }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      // 1 concluída de 2 na semana = 50%
      expect(result.taskCompletionThisWeek).toBe(50);
    });

    it('inclui tarefas completadas na semana sem deadline na semana', () => {
      const input = makeInput({
        tasks: [
          buildTask({
            id: 't1',
            deadline: new Date(2026, 0, 5), // semana passada
            statusType: 'done',
            completedAt: new Date(2026, 0, 13), // completada segunda desta semana
          }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      // 1 completada esta semana / 1 total = 100%
      expect(result.taskCompletionThisWeek).toBe(100);
    });

    it('retorna 0 quando não há tarefas na semana', () => {
      const input = makeInput({ tasks: [] });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.taskCompletionThisWeek).toBe(0);
    });
  });

  describe('topStreaks', () => {
    it('retorna os 3 hábitos ativos com maiores streaks', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', name: 'A', currentStreak: 5 }),
          buildHabit({ id: 'h2', name: 'B', currentStreak: 10 }),
          buildHabit({ id: 'h3', name: 'C', currentStreak: 3 }),
          buildHabit({ id: 'h4', name: 'D', currentStreak: 7 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.topStreaks).toHaveLength(3);
      expect(result.topStreaks[0]).toEqual({ habitId: 'h2', name: 'B', currentStreak: 10 });
      expect(result.topStreaks[1]).toEqual({ habitId: 'h4', name: 'D', currentStreak: 7 });
      expect(result.topStreaks[2]).toEqual({ habitId: 'h1', name: 'A', currentStreak: 5 });
    });

    it('ignora hábitos não ativos', () => {
      const input = makeInput({
        habits: [
          buildHabit({ id: 'h1', name: 'A', currentStreak: 10, status: 'archived' }),
          buildHabit({ id: 'h2', name: 'B', currentStreak: 5 }),
        ],
      });

      const result = HomeDashboardService.computeSummary(input);
      expect(result.topStreaks).toHaveLength(1);
      expect(result.topStreaks[0].habitId).toBe('h2');
    });
  });

  describe('entrada vazia', () => {
    it('retorna zeros, nulls e arrays vazios para inputs vazios', () => {
      const result = HomeDashboardService.computeSummary(makeInput());

      expect(result.pendingHabits).toBe(0);
      expect(result.todayTasks).toBe(0);
      expect(result.nextEvents).toEqual([]);
      expect(result.todayMood).toBeNull();
      expect(result.habitCompletionToday).toBe(0);
      expect(result.taskCompletionThisWeek).toBe(0);
      expect(result.topStreaks).toEqual([]);
    });
  });

  describe('HomeSummary VO', () => {
    it('toJSON retorna todos os campos', () => {
      const input = makeInput({
        habits: [buildHabit({ id: 'h1', name: 'Meditation', currentStreak: 5 })],
        habitEntries: [buildHabitEntry({ habitId: 'h1', date: '2026-01-15' })],
        tasks: [buildTask({ deadline: REF_DATE, statusType: 'todo' })],
        events: [buildEvent({ startAt: new Date(2026, 0, 15, 14) })],
        journalEntries: [buildJournalEntry({ moodLevel: 8 })],
      });

      const result = HomeDashboardService.computeSummary(input);
      const json = result.toJSON();

      expect(json).toEqual({
        pendingHabits: 0, // completed
        todayTasks: 1,
        nextEvents: [{ id: 'ev1', title: 'Event', startAt: new Date(2026, 0, 15, 14) }],
        todayMood: 8,
        habitCompletionToday: 100,
        taskCompletionThisWeek: 0, // deadline is today (thu), not completed
        topStreaks: [{ habitId: 'h1', name: 'Meditation', currentStreak: 5 }],
      });
    });
  });
});
