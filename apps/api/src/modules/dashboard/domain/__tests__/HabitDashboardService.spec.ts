import { HabitDashboardService } from '../services/HabitDashboardService';
import { HabitInput, HabitEntryInput } from '../inputs/HabitInput';

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

function buildEntry(overrides: Partial<HabitEntryInput> = {}): HabitEntryInput {
  return {
    habitId: 'h1',
    date: '2026-01-15',
    entryType: 'check_in',
    value: 1,
    trigger: null,
    ...overrides,
  };
}

describe('HabitDashboardService', () => {
  const refDate = new Date(2026, 2, 10); // 2026-03-10

  // ---- isDueOnDate (testado indiretamente via computeHeatmap) ----
  describe('isDueOnDate (via computeHeatmap)', () => {
    it('deve marcar todos os dias como due para hábito diário', () => {
      const habit = buildHabit({ frequencyType: 'daily' });
      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 7, refDate);

      // Sem entries, todos os dias due devem ser 'failed'
      const statuses = heatmap.days.map((d) => d.status);
      expect(statuses.every((s) => s === 'failed')).toBe(true);
      expect(heatmap.days.length).toBe(7);
    });

    it('deve marcar apenas dias específicos como due para specific_days', () => {
      // frequencyDays: [1, 3, 5] = segunda, quarta, sexta
      const habit = buildHabit({
        frequencyType: 'specific_days',
        frequencyDays: [1, 3, 5],
      });

      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 7, refDate);

      for (const day of heatmap.days) {
        const date = new Date(day.date + 'T00:00:00');
        const dayOfWeek = date.getDay();
        if ([1, 3, 5].includes(dayOfWeek)) {
          expect(day.status).toBe('failed');
        } else {
          expect(day.status).toBe('not_due');
        }
      }
    });

    it('deve marcar a cada N dias como due para interval', () => {
      // createdAt = 2026-01-01, frequencyEveryNDays = 3
      const habit = buildHabit({
        frequencyType: 'interval',
        frequencyEveryNDays: 3,
        createdAt: new Date(2026, 0, 1),
      });

      // refDate = 2026-03-10, período de 10 dias (01 a 10 de março)
      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 10, refDate);

      for (const day of heatmap.days) {
        const date = new Date(day.date + 'T00:00:00');
        const diffMs = date.getTime() - new Date(2026, 0, 1).getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays % 3 === 0) {
          expect(day.status).toBe('failed');
        } else {
          expect(day.status).toBe('not_due');
        }
      }
    });

    it('deve marcar todos os dias como due para weekly', () => {
      const habit = buildHabit({ frequencyType: 'weekly' });
      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 7, refDate);

      const statuses = heatmap.days.map((d) => d.status);
      expect(statuses.every((s) => s === 'failed')).toBe(true);
    });
  });

  // ---- computeCompletionRate ----
  describe('computeCompletionRate', () => {
    it('deve calcular taxa de conclusão para um dia (boolean)', () => {
      const habits = [buildHabit({ id: 'h1' }), buildHabit({ id: 'h2' })];
      const entries = [buildEntry({ habitId: 'h1', date: '2026-03-10' })];

      const rate = HabitDashboardService.computeCompletionRate(
        habits,
        entries,
        'day',
        refDate,
      );

      expect(rate.completed).toBe(1);
      expect(rate.total).toBe(2);
    });

    it('deve calcular taxa de conclusão para semana', () => {
      // refDate = 2026-03-10 (terça). Semana: seg 09 a dom 15
      const habit = buildHabit({ id: 'h1', frequencyType: 'daily' });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-09' }),
        buildEntry({ habitId: 'h1', date: '2026-03-10' }),
        buildEntry({ habitId: 'h1', date: '2026-03-11' }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        [habit],
        entries,
        'week',
        refDate,
      );

      expect(rate.completed).toBe(3);
      expect(rate.total).toBe(7);
    });

    it('deve calcular taxa de conclusão para mês', () => {
      const habit = buildHabit({ id: 'h1', frequencyType: 'daily' });
      // Março tem 31 dias, completar 2 dias
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-01' }),
        buildEntry({ habitId: 'h1', date: '2026-03-15' }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        [habit],
        entries,
        'month',
        refDate,
      );

      expect(rate.completed).toBe(2);
      expect(rate.total).toBe(31);
    });

    it('deve filtrar apenas hábitos ativos', () => {
      const habits = [
        buildHabit({ id: 'h1', status: 'active' }),
        buildHabit({ id: 'h2', status: 'paused' }),
        buildHabit({ id: 'h3', status: 'archived' }),
      ];
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10' }),
        buildEntry({ habitId: 'h2', date: '2026-03-10' }),
        buildEntry({ habitId: 'h3', date: '2026-03-10' }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        habits,
        entries,
        'day',
        refDate,
      );

      expect(rate.total).toBe(1);
      expect(rate.completed).toBe(1);
    });

    it('deve filtrar por habitId quando fornecido', () => {
      const habits = [
        buildHabit({ id: 'h1' }),
        buildHabit({ id: 'h2' }),
      ];
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10' }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        habits,
        entries,
        'day',
        refDate,
        'h1',
      );

      expect(rate.total).toBe(1);
      expect(rate.completed).toBe(1);
    });

    it('deve considerar dailyTarget para hábito quantitativo', () => {
      const habit = buildHabit({
        id: 'h1',
        trackingMode: 'quantitative',
        dailyTarget: 10,
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 6 }),
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 5 }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        [habit],
        entries,
        'day',
        refDate,
      );

      // soma = 11 >= 10
      expect(rate.completed).toBe(1);
      expect(rate.total).toBe(1);
    });

    it('deve não completar quando soma quantitativa é menor que target', () => {
      const habit = buildHabit({
        id: 'h1',
        trackingMode: 'quantitative',
        dailyTarget: 10,
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 3 }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        [habit],
        entries,
        'day',
        refDate,
      );

      expect(rate.completed).toBe(0);
      expect(rate.total).toBe(1);
    });

    it('deve considerar completo se quantitativo sem target e tem check_in', () => {
      const habit = buildHabit({
        id: 'h1',
        trackingMode: 'quantitative',
        dailyTarget: null,
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 1 }),
      ];

      const rate = HabitDashboardService.computeCompletionRate(
        [habit],
        entries,
        'day',
        refDate,
      );

      expect(rate.completed).toBe(1);
    });

    it('deve retornar 0/0 quando não há hábitos ativos', () => {
      const rate = HabitDashboardService.computeCompletionRate(
        [],
        [],
        'day',
        refDate,
      );

      expect(rate.completed).toBe(0);
      expect(rate.total).toBe(0);
    });
  });

  // ---- computeHeatmap ----
  describe('computeHeatmap', () => {
    it('deve marcar dia como complete quando boolean tem check_in', () => {
      const habit = buildHabit({ frequencyType: 'daily' });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10' }),
      ];

      const heatmap = HabitDashboardService.computeHeatmap(habit, entries, 1, refDate);

      expect(heatmap.days[0].status).toBe('complete');
      expect(heatmap.days[0].date).toBe('2026-03-10');
    });

    it('deve marcar dia como complete quando quantitativo atinge target', () => {
      const habit = buildHabit({
        trackingMode: 'quantitative',
        dailyTarget: 10,
        frequencyType: 'daily',
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 10 }),
      ];

      const heatmap = HabitDashboardService.computeHeatmap(habit, entries, 1, refDate);

      expect(heatmap.days[0].status).toBe('complete');
    });

    it('deve marcar dia como partial quando quantitativo não atinge target', () => {
      const habit = buildHabit({
        trackingMode: 'quantitative',
        dailyTarget: 10,
        frequencyType: 'daily',
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-10', value: 5 }),
      ];

      const heatmap = HabitDashboardService.computeHeatmap(habit, entries, 1, refDate);

      expect(heatmap.days[0].status).toBe('partial');
    });

    it('deve marcar dia como failed quando due e sem entries', () => {
      const habit = buildHabit({ frequencyType: 'daily' });
      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 1, refDate);

      expect(heatmap.days[0].status).toBe('failed');
    });

    it('deve marcar dia como not_due quando não é due', () => {
      // Terça-feira 2026-03-10, hábito só nos domingos (0)
      const habit = buildHabit({
        frequencyType: 'specific_days',
        frequencyDays: [0],
      });

      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 1, refDate);

      expect(heatmap.days[0].status).toBe('not_due');
    });

    it('deve gerar dias corretos para período de múltiplos dias', () => {
      const habit = buildHabit({ frequencyType: 'daily' });
      const heatmap = HabitDashboardService.computeHeatmap(habit, [], 3, refDate);

      expect(heatmap.days.length).toBe(3);
      expect(heatmap.days[0].date).toBe('2026-03-08');
      expect(heatmap.days[1].date).toBe('2026-03-09');
      expect(heatmap.days[2].date).toBe('2026-03-10');
    });
  });

  // ---- computeViceMetrics ----
  describe('computeViceMetrics', () => {
    it('deve calcular dias limpos desde último relapse', () => {
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 0, 1),
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-01', entryType: 'relapse', value: 1 }),
        buildEntry({ habitId: 'h1', date: '2026-03-05', entryType: 'relapse', value: 1 }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      // Desde 2026-03-05 até 2026-03-10 = 5 dias
      expect(metrics.daysClean).toBe(5);
    });

    it('deve calcular dias limpos desde criação quando não há relapses', () => {
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 2, 1), // 2026-03-01
      });

      const metrics = HabitDashboardService.computeViceMetrics(habit, [], refDate);

      // Desde 2026-03-01 até 2026-03-10 = 9 dias
      expect(metrics.daysClean).toBe(9);
    });

    it('deve calcular frequência de relapse por semana', () => {
      // createdAt = 2026-01-01, refDate = 2026-03-10
      // ~9.86 semanas (69 dias / 7)
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 0, 1),
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-01-15', entryType: 'relapse', value: 1 }),
        buildEntry({ habitId: 'h1', date: '2026-02-10', entryType: 'relapse', value: 1 }),
        buildEntry({ habitId: 'h1', date: '2026-03-01', entryType: 'relapse', value: 1 }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      // 69 dias / 7 = ~9.857 semanas; 3 / 9.857 ≈ 0.304
      const expectedWeeks = 69 / 7;
      const expectedFreq = 3 / expectedWeeks;
      expect(metrics.relapseFrequencyPerWeek).toBeCloseTo(expectedFreq, 2);
    });

    it('deve calcular frequência de relapse por mês', () => {
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 0, 1),
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-01-15', entryType: 'relapse', value: 1 }),
        buildEntry({ habitId: 'h1', date: '2026-02-10', entryType: 'relapse', value: 1 }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      // Jan 1 to Mar 10 = 68 dias; 68 / 30 = ~2.267 meses
      const expectedMonths = 68 / 30;
      const expectedFreq = 2 / expectedMonths;
      expect(metrics.relapseFrequencyPerMonth).toBeCloseTo(expectedFreq, 2);
    });

    it('deve usar mínimo de 1 mês para frequência mensal', () => {
      // createdAt = 2026-03-05, refDate = 2026-03-10 => 5 dias < 30
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 2, 5),
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-07', entryType: 'relapse', value: 1 }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      // min 1 mês → 1 / 1 = 1
      expect(metrics.relapseFrequencyPerMonth).toBe(1);
    });

    it('deve calcular top triggers ordenados por contagem', () => {
      const habit = buildHabit({ id: 'h1', type: 'quit' });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-01-10', entryType: 'relapse', trigger: 'Estresse' }),
        buildEntry({ habitId: 'h1', date: '2026-01-15', entryType: 'relapse', trigger: 'Tédio' }),
        buildEntry({ habitId: 'h1', date: '2026-01-20', entryType: 'relapse', trigger: 'Estresse' }),
        buildEntry({ habitId: 'h1', date: '2026-02-01', entryType: 'relapse', trigger: 'Estresse' }),
        buildEntry({ habitId: 'h1', date: '2026-02-10', entryType: 'relapse', trigger: 'Tédio' }),
        buildEntry({ habitId: 'h1', date: '2026-02-15', entryType: 'relapse', trigger: 'Ansiedade' }),
        buildEntry({ habitId: 'h1', date: '2026-02-20', entryType: 'relapse', trigger: null }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      expect(metrics.topTriggers).toEqual([
        { trigger: 'Estresse', count: 3 },
        { trigger: 'Tédio', count: 2 },
        { trigger: 'Ansiedade', count: 1 },
      ]);
    });

    it('deve limitar triggers a top 5', () => {
      const habit = buildHabit({ id: 'h1', type: 'quit' });
      const triggers = ['A', 'B', 'C', 'D', 'E', 'F'];
      const entries = triggers.flatMap((t, i) =>
        Array.from({ length: 6 - i }, (_, j) =>
          buildEntry({
            habitId: 'h1',
            date: `2026-01-${String(i * 5 + j + 1).padStart(2, '0')}`,
            entryType: 'relapse',
            trigger: t,
          }),
        ),
      );

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      expect(metrics.topTriggers.length).toBe(5);
      expect(metrics.topTriggers[0].trigger).toBe('A');
    });

    it('deve ignorar entries de check_in para contagem de relapses', () => {
      const habit = buildHabit({
        id: 'h1',
        type: 'quit',
        createdAt: new Date(2026, 0, 1),
      });
      const entries = [
        buildEntry({ habitId: 'h1', date: '2026-03-05', entryType: 'check_in', value: 1 }),
      ];

      const metrics = HabitDashboardService.computeViceMetrics(habit, entries, refDate);

      // Sem relapses, dias limpos desde criação: Jan 1 to Mar 10 = 68 dias
      expect(metrics.daysClean).toBe(68);
      expect(metrics.relapseFrequencyPerWeek).toBe(0);
    });

    it('deve retornar habitId correto', () => {
      const habit = buildHabit({ id: 'my-quit-habit', type: 'quit' });

      const metrics = HabitDashboardService.computeViceMetrics(habit, [], refDate);

      expect(metrics.habitId).toBe('my-quit-habit');
    });
  });
});
