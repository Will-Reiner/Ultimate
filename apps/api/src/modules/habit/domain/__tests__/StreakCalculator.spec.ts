import { calculateStreak, StreakResult } from '../services/StreakCalculator';
import { HabitEntry } from '../entities/HabitEntry';
import { Frequency } from '../value-objects/Frequency';

function makeEntry(date: string, entryType: 'check_in' | 'relapse' = 'check_in', value = 1): HabitEntry {
  return HabitEntry.restore({
    id: `entry-${date}-${entryType}`,
    habitId: 'habit-1',
    date,
    entryType,
    value,
    note: null,
    intensity: null,
    trigger: null,
    createdAt: new Date(),
  });
}

describe('StreakCalculator', () => {
  const createdAt = new Date(2026, 0, 1); // Jan 1, 2026 (Thursday)

  describe('hábito build - cálculo básico', () => {
    const daily = Frequency.create({ type: 'daily' });

    it('deve retornar 0 quando não há check-ins', () => {
      const result = calculateStreak({
        entries: [],
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.creditDays).toBe(0);
    });

    it('deve retornar 1 para um único dia completado (hoje)', () => {
      const result = calculateStreak({
        entries: [makeEntry('2026-01-05')],
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(1);
    });

    it('deve contar dias due consecutivos completados', () => {
      const entries = [
        makeEntry('2026-01-03'),
        makeEntry('2026-01-04'),
        makeEntry('2026-01-05'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(3);
    });

    it('deve quebrar streak quando dia due não foi completado', () => {
      // Jan 3, skip Jan 4, Jan 5
      const entries = [
        makeEntry('2026-01-03'),
        makeEntry('2026-01-05'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(1);
    });

    it('deve ignorar dias não-due no cálculo (não quebram streak)', () => {
      // specific_days: Mon(1), Wed(3), Fri(5)
      // Jan 5 = Mon, Jan 7 = Wed, Jan 9 = Fri (2026)
      const mwf = Frequency.create({ type: 'specific_days', days: [1, 3, 5] });
      const entries = [
        makeEntry('2026-01-05'), // Monday
        makeEntry('2026-01-07'), // Wednesday
        makeEntry('2026-01-09'), // Friday
      ];
      const result = calculateStreak({
        entries,
        frequency: mwf,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 9),
      });

      expect(result.currentStreak).toBe(3);
    });
  });

  describe('hábito build - crédito por dia extra', () => {
    // specific_days: Mon(1), Wed(3), Fri(5)
    const mwf = Frequency.create({ type: 'specific_days', days: [1, 3, 5] });

    it('deve acumular crédito quando check-in é feito em dia não-due', () => {
      // Jan 6 = Tue (not due), Jan 7 = Wed (due)
      const entries = [
        makeEntry('2026-01-06'), // Tuesday - extra
        makeEntry('2026-01-07'), // Wednesday - due
      ];
      const result = calculateStreak({
        entries,
        frequency: mwf,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 7),
      });

      expect(result.creditDays).toBe(1);
    });

    it('deve usar crédito para cobrir um dia due sem check-in', () => {
      // Jan 5 = Mon (due, completed)
      // Jan 6 = Tue (not due, completed → +1 credit)
      // Jan 7 = Wed (due, NOT completed → uses credit)
      // Jan 9 = Fri (due, completed)
      const entries = [
        makeEntry('2026-01-05'), // Monday
        makeEntry('2026-01-06'), // Tuesday (extra)
        makeEntry('2026-01-09'), // Friday
      ];
      const result = calculateStreak({
        entries,
        frequency: mwf,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 9),
      });

      // Mon + (credit covers Wed) + Fri = 3 streak, credit used up
      expect(result.currentStreak).toBe(3);
      expect(result.creditDays).toBe(0);
    });

    it('deve consumir apenas 1 crédito por dia due perdido', () => {
      // 2 extra days, miss 1 due day → 1 credit remains
      // Jan 5 = Mon (due)
      // Jan 6 = Tue (extra, +1)
      // Jan 7 = Wed (due, missed → -1 credit)
      // Jan 8 = Thu (extra, +1)
      // Jan 9 = Fri (due)
      const entries = [
        makeEntry('2026-01-05'),
        makeEntry('2026-01-06'),
        makeEntry('2026-01-08'),
        makeEntry('2026-01-09'),
      ];
      const result = calculateStreak({
        entries,
        frequency: mwf,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 9),
      });

      expect(result.currentStreak).toBe(3);
      expect(result.creditDays).toBe(1);
    });

    it('deve acumular múltiplos créditos com múltiplos dias extras', () => {
      // Jan 5 = Mon (due)
      // Jan 6, 7(extra - Tue not due), Jan 8 (extra - Thu not due)
      // Wait: Jan 7 = Wed IS due. Let me pick better dates.
      // Use interval every 3 days from Jan 1: due Jan 1, 4, 7, 10...
      const interval3 = Frequency.create({ type: 'interval', everyNDays: 3 });
      // Due: Jan 1, 4, 7. Extra: Jan 2, 3, 5, 6
      const entries = [
        makeEntry('2026-01-01'), // due
        makeEntry('2026-01-02'), // extra
        makeEntry('2026-01-03'), // extra
        makeEntry('2026-01-04'), // due
      ];
      const result = calculateStreak({
        entries,
        frequency: interval3,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 4),
      });

      expect(result.creditDays).toBe(2);
    });

    it('não deve quebrar streak se há crédito disponível', () => {
      const interval3 = Frequency.create({ type: 'interval', everyNDays: 3 });
      // Due: Jan 1, 4, 7. Extra: Jan 2. Miss Jan 4 due → credit covers it.
      const entries = [
        makeEntry('2026-01-01'), // due
        makeEntry('2026-01-02'), // extra (+1 credit)
        // Jan 4 missed (due) → credit -1
        makeEntry('2026-01-07'), // due
      ];
      const result = calculateStreak({
        entries,
        frequency: interval3,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 7),
      });

      expect(result.currentStreak).toBe(3);
      expect(result.creditDays).toBe(0);
    });

    it('deve quebrar streak se não há crédito suficiente', () => {
      const interval3 = Frequency.create({ type: 'interval', everyNDays: 3 });
      // Due: Jan 1, 4, 7. No extras. Miss Jan 4 → streak breaks.
      const entries = [
        makeEntry('2026-01-01'), // due
        // Jan 4 missed, no credit
        makeEntry('2026-01-07'), // due
      ];
      const result = calculateStreak({
        entries,
        frequency: interval3,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 7),
      });

      expect(result.currentStreak).toBe(1);
    });
  });

  describe('hábito build - quantitativo', () => {
    const daily = Frequency.create({ type: 'daily' });

    it('não deve contar check-in incompleto como completado para streak', () => {
      // dailyTarget = 8, value = 3 → incomplete
      const entries = [
        makeEntry('2026-01-05', 'check_in', 3),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: 8,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(0);
    });

    it('deve contar check-in que atinge meta diária como completado', () => {
      const entries = [
        makeEntry('2026-01-04', 'check_in', 8),
        makeEntry('2026-01-05', 'check_in', 10),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: 8,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(2);
    });
  });

  describe('vício quit', () => {
    const daily = Frequency.create({ type: 'daily' });

    it('deve contar dias consecutivos sem recaída desde a criação', () => {
      // Created Jan 1, reference Jan 5 → 5 days clean (Jan 1-5)
      const result = calculateStreak({
        entries: [],
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 5),
      });

      expect(result.currentStreak).toBe(5);
    });

    it('deve zerar streak ao registrar recaída', () => {
      // Created Jan 1, relapse Jan 3, reference Jan 3
      const entries = [
        makeEntry('2026-01-03', 'relapse'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 3),
      });

      expect(result.currentStreak).toBe(0);
    });

    it('deve recomeçar contagem após recaída', () => {
      // Created Jan 1, relapse Jan 3, reference Jan 6 → 3 days clean (Jan 4-6)
      const entries = [
        makeEntry('2026-01-03', 'relapse'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 6),
      });

      expect(result.currentStreak).toBe(3);
    });

    it('deve lidar com múltiplas recaídas no mesmo dia', () => {
      const entries = [
        makeEntry('2026-01-03', 'relapse'),
        HabitEntry.restore({
          id: 'entry-2026-01-03-relapse-2',
          habitId: 'habit-1',
          date: '2026-01-03',
          entryType: 'relapse',
          value: 1,
          note: null,
          intensity: null,
          trigger: null,
          createdAt: new Date(),
        }),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 6),
      });

      // Last relapse was Jan 3. Days clean: Jan 4, 5, 6 = 3
      expect(result.currentStreak).toBe(3);
    });
  });

  describe('streak geral', () => {
    const daily = Frequency.create({ type: 'daily' });

    it('deve calcular maior streak histórico', () => {
      // Streak of 3 (Jan 1-3), break, streak of 2 (Jan 5-6)
      const entries = [
        makeEntry('2026-01-01'),
        makeEntry('2026-01-02'),
        makeEntry('2026-01-03'),
        // Jan 4 missed
        makeEntry('2026-01-05'),
        makeEntry('2026-01-06'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 6),
      });

      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(3);
    });

    it('deve congelar streak ao pausar hábito', () => {
      // Streak of 3, then paused → streak stays at 3
      const entries = [
        makeEntry('2026-01-01'),
        makeEntry('2026-01-02'),
        makeEntry('2026-01-03'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'build',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'paused',
        referenceDate: new Date(2026, 0, 10), // 7 days later
        pausedAt: new Date(2026, 0, 3),
      });

      // Streak should freeze at 3, not count the missed days
      expect(result.currentStreak).toBe(3);
    });

    it('deve calcular longest streak para quit type', () => {
      // Created Jan 1, relapse Jan 4 (3 days clean), relapse Jan 8 (3 days clean), ref Jan 15 → 7 days clean
      const entries = [
        makeEntry('2026-01-04', 'relapse'),
        makeEntry('2026-01-08', 'relapse'),
      ];
      const result = calculateStreak({
        entries,
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'active',
        referenceDate: new Date(2026, 0, 15),
      });

      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(7);
    });

    it('deve congelar streak quit ao pausar', () => {
      // Created Jan 1, paused Jan 5, reference Jan 10
      const result = calculateStreak({
        entries: [],
        frequency: daily,
        habitType: 'quit',
        dailyTarget: null,
        habitCreatedAt: createdAt,
        status: 'paused',
        referenceDate: new Date(2026, 0, 10),
        pausedAt: new Date(2026, 0, 5),
      });

      // Should freeze at 5 (Jan 1-5)
      expect(result.currentStreak).toBe(5);
    });
  });
});
