import { JournalDashboardService } from '../services/JournalDashboardService';
import { JournalEntryInput, JournalTagInput } from '../inputs/JournalInput';

function buildEntry(
  overrides: Partial<JournalEntryInput> = {},
): JournalEntryInput {
  return {
    id: 'e1',
    date: new Date(2026, 0, 15),
    moodLevel: 7,
    tagIds: [],
    ...overrides,
  };
}

describe('JournalDashboardService', () => {
  const refDate = new Date(2026, 0, 15); // 2026-01-15 (Thursday)

  describe('computeMoodGraph', () => {
    it('deve retornar dataPoints dos últimos N dias', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 14), moodLevel: 6 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 15), moodLevel: 8 }),
        buildEntry({ id: 'e3', date: new Date(2026, 0, 10), moodLevel: 5 }),
      ];

      const graph = JournalDashboardService.computeMoodGraph(
        entries,
        7,
        refDate,
      );

      expect(graph.dataPoints).toEqual([
        { date: '2026-01-10', level: 5 },
        { date: '2026-01-14', level: 6 },
        { date: '2026-01-15', level: 8 },
      ]);
    });

    it('deve ignorar entradas com moodLevel null', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 14), moodLevel: null }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 15), moodLevel: 8 }),
      ];

      const graph = JournalDashboardService.computeMoodGraph(
        entries,
        7,
        refDate,
      );

      expect(graph.dataPoints).toEqual([{ date: '2026-01-15', level: 8 }]);
    });

    it('deve filtrar entradas fora do intervalo de dias', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 1), moodLevel: 5 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 15), moodLevel: 8 }),
      ];

      const graph = JournalDashboardService.computeMoodGraph(
        entries,
        7,
        refDate,
      );

      expect(graph.dataPoints).toEqual([{ date: '2026-01-15', level: 8 }]);
    });

    it('deve calcular médias semanais agrupadas por segunda-feira', () => {
      // Week of 2026-01-12 (Mon) to 2026-01-18 (Sun)
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 12), moodLevel: 6 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 13), moodLevel: 8 }),
        buildEntry({ id: 'e3', date: new Date(2026, 0, 15), moodLevel: 10 }),
      ];

      const graph = JournalDashboardService.computeMoodGraph(
        entries,
        7,
        refDate,
      );

      // All in same week starting 2026-01-12
      expect(graph.weeklyAverages).toEqual([
        { weekStart: '2026-01-12', average: 8 },
      ]);
    });

    it('deve retornar grafo vazio quando não há entradas', () => {
      const graph = JournalDashboardService.computeMoodGraph([], 7, refDate);

      expect(graph.dataPoints).toEqual([]);
      expect(graph.weeklyAverages).toEqual([]);
    });

    it('deve agrupar múltiplas semanas corretamente', () => {
      const entries: JournalEntryInput[] = [
        // Week of 2026-01-05 (Mon)
        buildEntry({ id: 'e1', date: new Date(2026, 0, 5), moodLevel: 4 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 7), moodLevel: 6 }),
        // Week of 2026-01-12 (Mon)
        buildEntry({ id: 'e3', date: new Date(2026, 0, 14), moodLevel: 8 }),
      ];

      const graph = JournalDashboardService.computeMoodGraph(
        entries,
        14,
        refDate,
      );

      expect(graph.weeklyAverages).toEqual([
        { weekStart: '2026-01-05', average: 5 },
        { weekStart: '2026-01-12', average: 8 },
      ]);
    });
  });

  describe('computeMoodTrend', () => {
    it('deve retornar improving quando média recente > anterior + 0.5', () => {
      const entries: JournalEntryInput[] = [
        // Previous 7 days (Jan 2-8): avg = 4
        buildEntry({ id: 'e1', date: new Date(2026, 0, 3), moodLevel: 4 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 5), moodLevel: 4 }),
        // Last 7 days (Jan 9-15): avg = 8
        buildEntry({ id: 'e3', date: new Date(2026, 0, 10), moodLevel: 8 }),
        buildEntry({ id: 'e4', date: new Date(2026, 0, 14), moodLevel: 8 }),
      ];

      const trend = JournalDashboardService.computeMoodTrend(entries, refDate);

      expect(trend.direction).toBe('improving');
    });

    it('deve retornar worsening quando média recente < anterior - 0.5', () => {
      const entries: JournalEntryInput[] = [
        // Previous 7 days (Jan 2-8): avg = 8
        buildEntry({ id: 'e1', date: new Date(2026, 0, 3), moodLevel: 8 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 5), moodLevel: 8 }),
        // Last 7 days (Jan 9-15): avg = 4
        buildEntry({ id: 'e3', date: new Date(2026, 0, 10), moodLevel: 4 }),
        buildEntry({ id: 'e4', date: new Date(2026, 0, 14), moodLevel: 4 }),
      ];

      const trend = JournalDashboardService.computeMoodTrend(entries, refDate);

      expect(trend.direction).toBe('worsening');
    });

    it('deve retornar stable quando diferença <= 0.5', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 3), moodLevel: 7 }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 10), moodLevel: 7 }),
      ];

      const trend = JournalDashboardService.computeMoodTrend(entries, refDate);

      expect(trend.direction).toBe('stable');
    });

    it('deve retornar stable quando não há dados em nenhum período', () => {
      const trend = JournalDashboardService.computeMoodTrend([], refDate);

      expect(trend.direction).toBe('stable');
    });

    it('deve retornar stable quando não há dados no período anterior', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 10), moodLevel: 8 }),
      ];

      const trend = JournalDashboardService.computeMoodTrend(entries, refDate);

      expect(trend.direction).toBe('stable');
    });

    it('deve retornar stable quando não há dados no período recente', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 3), moodLevel: 8 }),
      ];

      const trend = JournalDashboardService.computeMoodTrend(entries, refDate);

      expect(trend.direction).toBe('stable');
    });
  });

  describe('computeWritingStreak', () => {
    it('deve contar dias consecutivos até refDate', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 15) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 14) }),
        buildEntry({ id: 'e3', date: new Date(2026, 0, 13) }),
      ];

      const streak = JournalDashboardService.computeWritingStreak(
        entries,
        refDate,
      );

      expect(streak).toBe(3);
    });

    it('deve parar quando há uma lacuna', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 15) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 14) }),
        // gap on Jan 13
        buildEntry({ id: 'e3', date: new Date(2026, 0, 12) }),
      ];

      const streak = JournalDashboardService.computeWritingStreak(
        entries,
        refDate,
      );

      expect(streak).toBe(2);
    });

    it('deve retornar 0 quando não há entrada em refDate', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 14) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 13) }),
      ];

      const streak = JournalDashboardService.computeWritingStreak(
        entries,
        refDate,
      );

      expect(streak).toBe(0);
    });

    it('deve retornar 0 quando não há entradas', () => {
      const streak = JournalDashboardService.computeWritingStreak(
        [],
        refDate,
      );

      expect(streak).toBe(0);
    });

    it('deve contar entrada independente de moodLevel', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({
          id: 'e1',
          date: new Date(2026, 0, 15),
          moodLevel: null,
        }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 14), moodLevel: 5 }),
      ];

      const streak = JournalDashboardService.computeWritingStreak(
        entries,
        refDate,
      );

      expect(streak).toBe(2);
    });

    it('deve contar múltiplas entradas no mesmo dia como um só dia', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 15) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 15) }),
        buildEntry({ id: 'e3', date: new Date(2026, 0, 14) }),
      ];

      const streak = JournalDashboardService.computeWritingStreak(
        entries,
        refDate,
      );

      expect(streak).toBe(2);
    });
  });

  describe('computeEntryFrequency', () => {
    it('deve calcular porcentagem de dias com entrada no mês', () => {
      // January 2026 has 31 days
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 1) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 5) }),
        buildEntry({ id: 'e3', date: new Date(2026, 0, 10) }),
      ];

      const freq = JournalDashboardService.computeEntryFrequency(
        entries,
        1,
        2026,
      );

      // 3 / 31 * 100 ≈ 9.677...
      expect(freq).toBeCloseTo((3 / 31) * 100, 2);
    });

    it('deve considerar fevereiro com 28 dias', () => {
      // February 2026 is not a leap year = 28 days
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 1, 1) }),
        buildEntry({ id: 'e2', date: new Date(2026, 1, 15) }),
      ];

      const freq = JournalDashboardService.computeEntryFrequency(
        entries,
        2,
        2026,
      );

      expect(freq).toBeCloseTo((2 / 28) * 100, 2);
    });

    it('deve considerar fevereiro com 29 dias em ano bissexto', () => {
      // 2028 is a leap year
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2028, 1, 1) }),
        buildEntry({ id: 'e2', date: new Date(2028, 1, 29) }),
      ];

      const freq = JournalDashboardService.computeEntryFrequency(
        entries,
        2,
        2028,
      );

      expect(freq).toBeCloseTo((2 / 29) * 100, 2);
    });

    it('deve retornar 0 quando não há entradas', () => {
      const freq = JournalDashboardService.computeEntryFrequency([], 1, 2026);

      expect(freq).toBe(0);
    });

    it('deve filtrar entradas de outros meses', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 15) }), // Jan
        buildEntry({ id: 'e2', date: new Date(2026, 1, 15) }), // Feb
      ];

      const freq = JournalDashboardService.computeEntryFrequency(
        entries,
        1,
        2026,
      );

      expect(freq).toBeCloseTo((1 / 31) * 100, 2);
    });

    it('deve contar dias únicos mesmo com múltiplas entradas no mesmo dia', () => {
      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', date: new Date(2026, 0, 15) }),
        buildEntry({ id: 'e2', date: new Date(2026, 0, 15) }),
      ];

      const freq = JournalDashboardService.computeEntryFrequency(
        entries,
        1,
        2026,
      );

      expect(freq).toBeCloseTo((1 / 31) * 100, 2);
    });
  });

  describe('computeTagFrequency', () => {
    it('deve contar ocorrências de cada tag', () => {
      const tags: JournalTagInput[] = [
        { id: 't1', name: 'Ansiedade' },
        { id: 't2', name: 'Trabalho' },
      ];

      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', tagIds: ['t1', 't2'] }),
        buildEntry({ id: 'e2', tagIds: ['t1'] }),
        buildEntry({ id: 'e3', tagIds: ['t2', 't1'] }),
      ];

      const freq = JournalDashboardService.computeTagFrequency(entries, tags);

      expect(freq.tags).toEqual([
        { tagId: 't1', tagName: 'Ansiedade', count: 3 },
        { tagId: 't2', tagName: 'Trabalho', count: 2 },
      ]);
    });

    it('deve retornar vazio quando não há entradas', () => {
      const tags: JournalTagInput[] = [{ id: 't1', name: 'Ansiedade' }];

      const freq = JournalDashboardService.computeTagFrequency([], tags);

      expect(freq.tags).toEqual([]);
    });

    it('deve ignorar tagIds que não existem na lista de tags', () => {
      const tags: JournalTagInput[] = [{ id: 't1', name: 'Ansiedade' }];

      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', tagIds: ['t1', 't999'] }),
      ];

      const freq = JournalDashboardService.computeTagFrequency(entries, tags);

      expect(freq.tags).toEqual([
        { tagId: 't1', tagName: 'Ansiedade', count: 1 },
      ]);
    });

    it('deve ordenar tags por contagem decrescente', () => {
      const tags: JournalTagInput[] = [
        { id: 't1', name: 'A' },
        { id: 't2', name: 'B' },
        { id: 't3', name: 'C' },
      ];

      const entries: JournalEntryInput[] = [
        buildEntry({ id: 'e1', tagIds: ['t3'] }),
        buildEntry({ id: 'e2', tagIds: ['t3', 't1'] }),
        buildEntry({ id: 'e3', tagIds: ['t3', 't1', 't2'] }),
        buildEntry({ id: 'e4', tagIds: ['t1'] }),
      ];

      const freq = JournalDashboardService.computeTagFrequency(entries, tags);

      expect(freq.tags[0].tagId).toBe('t3');
      expect(freq.tags[0].count).toBe(3);
      expect(freq.tags[1].tagId).toBe('t1');
      expect(freq.tags[1].count).toBe(3);
      expect(freq.tags[2].tagId).toBe('t2');
      expect(freq.tags[2].count).toBe(1);
    });
  });
});
