import { CompletionRate } from '../value-objects/CompletionRate';

describe('CompletionRate', () => {
  it('deve calcular 60% para 3 de 5', () => {
    const rate = CompletionRate.create(3, 5);

    expect(rate.completed).toBe(3);
    expect(rate.total).toBe(5);
    expect(rate.percentage).toBe(60);
    expect(rate.toJSON()).toEqual({ completed: 3, total: 5, percentage: 60 });
  });

  it('deve retornar 0% quando total é 0', () => {
    const rate = CompletionRate.create(0, 0);

    expect(rate.completed).toBe(0);
    expect(rate.total).toBe(0);
    expect(rate.percentage).toBe(0);
    expect(rate.toJSON()).toEqual({ completed: 0, total: 0, percentage: 0 });
  });

  it('deve calcular 100% para 5 de 5', () => {
    const rate = CompletionRate.create(5, 5);

    expect(rate.completed).toBe(5);
    expect(rate.total).toBe(5);
    expect(rate.percentage).toBe(100);
    expect(rate.toJSON()).toEqual({ completed: 5, total: 5, percentage: 100 });
  });
});
