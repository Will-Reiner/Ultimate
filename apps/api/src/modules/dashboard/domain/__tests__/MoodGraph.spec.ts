import { MoodGraph } from '../value-objects/MoodGraph';

describe('MoodGraph', () => {
  it('deve criar com dataPoints e weeklyAverages', () => {
    const graph = MoodGraph.create(
      [{ date: '2026-01-15', level: 7 }],
      [{ weekStart: '2026-01-13', average: 7 }],
    );

    expect(graph.dataPoints).toEqual([{ date: '2026-01-15', level: 7 }]);
    expect(graph.weeklyAverages).toEqual([
      { weekStart: '2026-01-13', average: 7 },
    ]);
  });

  it('deve criar vazio quando não há dados', () => {
    const graph = MoodGraph.create([], []);

    expect(graph.dataPoints).toEqual([]);
    expect(graph.weeklyAverages).toEqual([]);
  });

  it('deve serializar corretamente com toJSON', () => {
    const graph = MoodGraph.create(
      [
        { date: '2026-01-15', level: 7 },
        { date: '2026-01-16', level: 8 },
      ],
      [{ weekStart: '2026-01-13', average: 7.5 }],
    );

    expect(graph.toJSON()).toEqual({
      dataPoints: [
        { date: '2026-01-15', level: 7 },
        { date: '2026-01-16', level: 8 },
      ],
      weeklyAverages: [{ weekStart: '2026-01-13', average: 7.5 }],
    });
  });

  it('deve retornar cópias defensivas dos arrays', () => {
    const graph = MoodGraph.create(
      [{ date: '2026-01-15', level: 7 }],
      [{ weekStart: '2026-01-13', average: 7 }],
    );

    const dp = graph.dataPoints;
    dp.push({ date: '2026-01-16', level: 5 });
    expect(graph.dataPoints).toHaveLength(1);
  });
});
