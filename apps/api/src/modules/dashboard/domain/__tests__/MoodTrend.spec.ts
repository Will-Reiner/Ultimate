import { MoodTrend } from '../value-objects/MoodTrend';

describe('MoodTrend', () => {
  it('deve criar com direção improving', () => {
    const trend = MoodTrend.create('improving');

    expect(trend.direction).toBe('improving');
    expect(trend.toJSON()).toEqual({ direction: 'improving' });
  });

  it('deve criar com direção worsening', () => {
    const trend = MoodTrend.create('worsening');

    expect(trend.direction).toBe('worsening');
    expect(trend.toJSON()).toEqual({ direction: 'worsening' });
  });

  it('deve criar com direção stable', () => {
    const trend = MoodTrend.create('stable');

    expect(trend.direction).toBe('stable');
    expect(trend.toJSON()).toEqual({ direction: 'stable' });
  });
});
