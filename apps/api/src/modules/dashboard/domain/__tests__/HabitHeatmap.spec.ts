import { HabitHeatmap, HeatmapDay } from '../value-objects/HabitHeatmap';

describe('HabitHeatmap', () => {
  it('deve criar com dados válidos e expor getter', () => {
    const days: HeatmapDay[] = [
      { date: '2026-01-01', status: 'complete' },
      { date: '2026-01-02', status: 'failed' },
      { date: '2026-01-03', status: 'not_due' },
    ];

    const heatmap = HabitHeatmap.create(days);

    expect(heatmap.days).toEqual(days);
    expect(heatmap.days.length).toBe(3);
  });

  it('deve serializar com toJSON', () => {
    const days: HeatmapDay[] = [
      { date: '2026-01-01', status: 'partial' },
    ];

    const heatmap = HabitHeatmap.create(days);

    expect(heatmap.toJSON()).toEqual(days);
  });

  it('deve criar com lista vazia', () => {
    const heatmap = HabitHeatmap.create([]);

    expect(heatmap.days).toEqual([]);
  });
});
