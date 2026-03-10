import { GetCategoriesUseCase } from '../use-cases/GetCategoriesUseCase';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';

function createMockCategoryRepo(): jest.Mocked<ICategoryRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
  };
}

describe('GetCategoriesUseCase', () => {
  it('deve retornar todas as categorias', async () => {
    const repo = createMockCategoryRepo();
    repo.findAll.mockResolvedValue([
      Category.restore({ id: 'c1', name: 'Saúde', icon: '❤️', color: '#ef4444' }),
      Category.restore({ id: 'c2', name: 'Fitness', icon: '💪', color: '#f97316' }),
    ]);
    const uc = new GetCategoriesUseCase(repo);

    const result = await uc.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'c1', name: 'Saúde', icon: '❤️', color: '#ef4444' });
    expect(result[1]).toEqual({ id: 'c2', name: 'Fitness', icon: '💪', color: '#f97316' });
  });

  it('deve retornar array vazio se não há categorias', async () => {
    const repo = createMockCategoryRepo();
    repo.findAll.mockResolvedValue([]);
    const uc = new GetCategoriesUseCase(repo);

    const result = await uc.execute();

    expect(result).toEqual([]);
  });
});
