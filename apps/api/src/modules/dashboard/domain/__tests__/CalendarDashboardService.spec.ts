import { CalendarDashboardService } from '../services/CalendarDashboardService';
import { CalendarEventInput } from '../inputs/CalendarInput';

function buildEvent(
  overrides: Partial<CalendarEventInput> = {},
): CalendarEventInput {
  return {
    id: 'ev1',
    title: 'Event',
    type: 'meeting',
    startAt: new Date(2026, 0, 15, 10),
    endAt: new Date(2026, 0, 15, 11),
    isAllDay: false,
    ...overrides,
  };
}

describe('CalendarDashboardService', () => {
  describe('aggregateEvents', () => {
    it('deve ordenar eventos por startAt ascendente', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev3', startAt: new Date(2026, 0, 17, 9) }),
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 16, 14) }),
      ];

      const result = CalendarDashboardService.aggregateEvents(events);

      expect(result.map((e) => e.id)).toEqual(['ev1', 'ev2', 'ev3']);
    });

    it('deve retornar array vazio quando não há eventos', () => {
      const result = CalendarDashboardService.aggregateEvents([]);

      expect(result).toEqual([]);
    });

    it('deve manter eventos com mesmo startAt na ordem original', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 15, 10) }),
      ];

      const result = CalendarDashboardService.aggregateEvents(events);

      expect(result.length).toBe(2);
    });
  });

  describe('computeMonthlyDensity', () => {
    it('deve contar eventos por dia no mês', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 15, 14) }),
        buildEvent({ id: 'ev3', startAt: new Date(2026, 0, 20, 9) }),
      ];

      const density = CalendarDashboardService.computeMonthlyDensity(
        events,
        1,
        2026,
      );
      const days = density.days;

      const day15 = days.find((d) => d.date === '2026-01-15');
      const day20 = days.find((d) => d.date === '2026-01-20');

      expect(day15?.eventCount).toBe(2);
      expect(day20?.eventCount).toBe(1);
    });

    it('deve incluir todos os dias do mês, mesmo sem eventos', () => {
      const density = CalendarDashboardService.computeMonthlyDensity(
        [],
        1,
        2026,
      );

      // Janeiro tem 31 dias
      expect(density.days.length).toBe(31);
      expect(density.days.every((d) => d.eventCount === 0)).toBe(true);
    });

    it('deve incluir 28 dias para fevereiro de ano não-bissexto', () => {
      const density = CalendarDashboardService.computeMonthlyDensity(
        [],
        2,
        2026,
      );

      expect(density.days.length).toBe(28);
    });

    it('deve incluir 29 dias para fevereiro de ano bissexto', () => {
      const density = CalendarDashboardService.computeMonthlyDensity(
        [],
        2,
        2028,
      );

      expect(density.days.length).toBe(29);
    });

    it('deve marcar isHighDensity quando eventCount > 5', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 8) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 15, 9) }),
        buildEvent({ id: 'ev3', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev4', startAt: new Date(2026, 0, 15, 11) }),
        buildEvent({ id: 'ev5', startAt: new Date(2026, 0, 15, 12) }),
        buildEvent({ id: 'ev6', startAt: new Date(2026, 0, 15, 13) }),
      ];

      const density = CalendarDashboardService.computeMonthlyDensity(
        events,
        1,
        2026,
      );
      const day15 = density.days.find((d) => d.date === '2026-01-15');

      expect(day15?.eventCount).toBe(6);
      expect(day15?.isHighDensity).toBe(true);
    });

    it('deve não marcar isHighDensity quando eventCount <= 5', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 8) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 15, 9) }),
        buildEvent({ id: 'ev3', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev4', startAt: new Date(2026, 0, 15, 11) }),
        buildEvent({ id: 'ev5', startAt: new Date(2026, 0, 15, 12) }),
      ];

      const density = CalendarDashboardService.computeMonthlyDensity(
        events,
        1,
        2026,
      );
      const day15 = density.days.find((d) => d.date === '2026-01-15');

      expect(day15?.eventCount).toBe(5);
      expect(day15?.isHighDensity).toBe(false);
    });

    it('deve filtrar eventos de outros meses', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 1, 15, 10) }), // Feb
      ];

      const density = CalendarDashboardService.computeMonthlyDensity(
        events,
        1,
        2026,
      );
      const day15 = density.days.find((d) => d.date === '2026-01-15');

      expect(day15?.eventCount).toBe(1);
    });
  });

  describe('getEventsForDay', () => {
    it('deve filtrar eventos para um dia específico', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
        buildEvent({ id: 'ev2', startAt: new Date(2026, 0, 16, 14) }),
        buildEvent({ id: 'ev3', startAt: new Date(2026, 0, 15, 16) }),
      ];

      const result = CalendarDashboardService.getEventsForDay(
        events,
        new Date(2026, 0, 15),
      );

      expect(result.length).toBe(2);
      expect(result.map((e) => e.id).sort()).toEqual(['ev1', 'ev3']);
    });

    it('deve retornar array vazio quando não há eventos no dia', () => {
      const events: CalendarEventInput[] = [
        buildEvent({ id: 'ev1', startAt: new Date(2026, 0, 15, 10) }),
      ];

      const result = CalendarDashboardService.getEventsForDay(
        events,
        new Date(2026, 0, 16),
      );

      expect(result).toEqual([]);
    });

    it('deve retornar array vazio quando não há eventos', () => {
      const result = CalendarDashboardService.getEventsForDay(
        [],
        new Date(2026, 0, 15),
      );

      expect(result).toEqual([]);
    });
  });
});
