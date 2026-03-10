import { CalendarDensity, DayDensity } from '../value-objects/CalendarDensity';

describe('CalendarDensity', () => {
  it('deve criar com dias de baixa densidade', () => {
    const days: DayDensity[] = [
      { date: '2026-01-15', eventCount: 2, isHighDensity: false },
      { date: '2026-01-16', eventCount: 0, isHighDensity: false },
    ];

    const density = CalendarDensity.create(days);

    expect(density.days).toEqual(days);
  });

  it('deve criar com dias de alta densidade (eventCount > 5)', () => {
    const days: DayDensity[] = [
      { date: '2026-01-15', eventCount: 6, isHighDensity: true },
      { date: '2026-01-16', eventCount: 10, isHighDensity: true },
    ];

    const density = CalendarDensity.create(days);

    expect(density.days[0].isHighDensity).toBe(true);
    expect(density.days[1].isHighDensity).toBe(true);
  });

  it('deve marcar isHighDensity corretamente no limiar', () => {
    const days: DayDensity[] = [
      { date: '2026-01-15', eventCount: 5, isHighDensity: false },
      { date: '2026-01-16', eventCount: 6, isHighDensity: true },
    ];

    const density = CalendarDensity.create(days);

    expect(density.days[0].isHighDensity).toBe(false);
    expect(density.days[1].isHighDensity).toBe(true);
  });

  it('deve serializar com toJSON', () => {
    const days: DayDensity[] = [
      { date: '2026-01-15', eventCount: 3, isHighDensity: false },
    ];

    const density = CalendarDensity.create(days);

    expect(density.toJSON()).toEqual({ days });
  });
});
