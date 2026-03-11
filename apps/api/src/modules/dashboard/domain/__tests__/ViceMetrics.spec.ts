import { ViceMetrics, ViceMetricsData } from '../value-objects/ViceMetrics';

describe('ViceMetrics', () => {
  const sampleData: ViceMetricsData = {
    habitId: 'h1',
    daysClean: 15,
    relapseFrequencyPerWeek: 0.5,
    relapseFrequencyPerMonth: 2,
    topTriggers: [
      { trigger: 'Estresse', count: 5 },
      { trigger: 'Tédio', count: 3 },
    ],
  };

  it('deve criar com dados válidos e expor getters', () => {
    const metrics = ViceMetrics.create(sampleData);

    expect(metrics.habitId).toBe('h1');
    expect(metrics.daysClean).toBe(15);
    expect(metrics.relapseFrequencyPerWeek).toBe(0.5);
    expect(metrics.relapseFrequencyPerMonth).toBe(2);
    expect(metrics.topTriggers).toEqual([
      { trigger: 'Estresse', count: 5 },
      { trigger: 'Tédio', count: 3 },
    ]);
  });

  it('deve serializar com toJSON', () => {
    const metrics = ViceMetrics.create(sampleData);

    expect(metrics.toJSON()).toEqual(sampleData);
  });

  it('deve criar com triggers vazio', () => {
    const data: ViceMetricsData = {
      ...sampleData,
      topTriggers: [],
    };

    const metrics = ViceMetrics.create(data);

    expect(metrics.topTriggers).toEqual([]);
  });
});
