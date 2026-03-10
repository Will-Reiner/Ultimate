import { FinanceCategory, FinanceCategoryType } from '../entities/FinanceCategory';
import {
  InvalidFinanceCategoryNameError,
  InvalidFinanceCategoryTypeError,
  PredefinedCategoryImmutableError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Alimentacao',
    icon: 'utensils',
    color: '#FF5733',
    type: 'expense' as FinanceCategoryType,
    ...overrides,
  };
}

describe('FinanceCategory', () => {
  describe('criacao', () => {
    it('deve criar uma categoria customizada com campos obrigatorios', () => {
      const category = FinanceCategory.create(buildValidProps());

      expect(category.id).toBe('');
      expect(category.userId).toBe('user-1');
      expect(category.name).toBe('Alimentacao');
      expect(category.icon).toBe('utensils');
      expect(category.color).toBe('#FF5733');
      expect(category.type).toBe('expense');
      expect(category.isPredefined).toBe(false);
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar categoria do tipo income', () => {
      const category = FinanceCategory.create(buildValidProps({ type: 'income', name: 'Bonus' }));

      expect(category.type).toBe('income');
      expect(category.name).toBe('Bonus');
    });

    it('deve fazer trim no nome', () => {
      const category = FinanceCategory.create(buildValidProps({ name: '  Transporte  ' }));

      expect(category.name).toBe('Transporte');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() =>
        FinanceCategory.create(buildValidProps({ name: '' })),
      ).toThrow(InvalidFinanceCategoryNameError);
    });

    it('deve rejeitar nome com apenas espacos', () => {
      expect(() =>
        FinanceCategory.create(buildValidProps({ name: '   ' })),
      ).toThrow(InvalidFinanceCategoryNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        FinanceCategory.create(buildValidProps({ name: longName })),
      ).toThrow(InvalidFinanceCategoryNameError);
    });

    it('deve aceitar nome com exatamente 100 caracteres', () => {
      const name = 'a'.repeat(100);
      const category = FinanceCategory.create(buildValidProps({ name }));

      expect(category.name).toBe(name);
    });

    it('deve rejeitar tipo invalido', () => {
      expect(() =>
        FinanceCategory.create(buildValidProps({ type: 'invalid' })),
      ).toThrow(InvalidFinanceCategoryTypeError);
    });

    it('deve definir isPredefined como false para categorias customizadas', () => {
      const category = FinanceCategory.create(buildValidProps());

      expect(category.isPredefined).toBe(false);
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const category = FinanceCategory.create(buildValidProps());
      const after = new Date();

      expect(category.id).toBe('');
      expect(category.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(category.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(category.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('edicao', () => {
    it('deve atualizar o nome', () => {
      const category = FinanceCategory.create(buildValidProps());
      category.updateName('Transporte');

      expect(category.name).toBe('Transporte');
    });

    it('deve fazer trim no nome ao atualizar', () => {
      const category = FinanceCategory.create(buildValidProps());
      category.updateName('  Transporte  ');

      expect(category.name).toBe('Transporte');
    });

    it('deve rejeitar nome vazio na atualizacao', () => {
      const category = FinanceCategory.create(buildValidProps());

      expect(() => category.updateName('')).toThrow(InvalidFinanceCategoryNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres na atualizacao', () => {
      const category = FinanceCategory.create(buildValidProps());

      expect(() => category.updateName('a'.repeat(101))).toThrow(
        InvalidFinanceCategoryNameError,
      );
    });

    it('deve atualizar updatedAt ao atualizar o nome', () => {
      const category = FinanceCategory.create(buildValidProps());
      const originalUpdatedAt = category.updatedAt;

      category.updateName('Transporte');

      expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar o icone', () => {
      const category = FinanceCategory.create(buildValidProps());
      category.updateIcon('car');

      expect(category.icon).toBe('car');
    });

    it('deve atualizar updatedAt ao atualizar o icone', () => {
      const category = FinanceCategory.create(buildValidProps());
      const originalUpdatedAt = category.updatedAt;

      category.updateIcon('car');

      expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a cor', () => {
      const category = FinanceCategory.create(buildValidProps());
      category.updateColor('#00FF00');

      expect(category.color).toBe('#00FF00');
    });

    it('deve atualizar updatedAt ao atualizar a cor', () => {
      const category = FinanceCategory.create(buildValidProps());
      const originalUpdatedAt = category.updatedAt;

      category.updateColor('#00FF00');

      expect(category.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('categorias predefinidas - imutabilidade', () => {
    it('deve impedir atualizacao de nome em categoria predefinida', () => {
      const predefined = FinanceCategory.getPredefinedExpense();
      const category = predefined[0];

      expect(() => category.updateName('Novo Nome')).toThrow(
        PredefinedCategoryImmutableError,
      );
    });

    it('deve impedir atualizacao de icone em categoria predefinida', () => {
      const predefined = FinanceCategory.getPredefinedExpense();
      const category = predefined[0];

      expect(() => category.updateIcon('new-icon')).toThrow(
        PredefinedCategoryImmutableError,
      );
    });

    it('deve impedir atualizacao de cor em categoria predefinida', () => {
      const predefined = FinanceCategory.getPredefinedExpense();
      const category = predefined[0];

      expect(() => category.updateColor('#000000')).toThrow(
        PredefinedCategoryImmutableError,
      );
    });

    it('deve impedir exclusao de categoria predefinida via ensureNotPredefined', () => {
      const predefined = FinanceCategory.getPredefinedExpense();
      const category = predefined[0];

      expect(() => category.ensureNotPredefined()).toThrow(
        PredefinedCategoryImmutableError,
      );
    });

    it('deve permitir ensureNotPredefined em categoria customizada', () => {
      const category = FinanceCategory.create(buildValidProps());

      expect(() => category.ensureNotPredefined()).not.toThrow();
    });
  });

  describe('getPredefinedExpense', () => {
    it('deve retornar categorias de despesa predefinidas', () => {
      const categories = FinanceCategory.getPredefinedExpense();

      expect(categories.length).toBe(9);

      const names = categories.map((c) => c.name);
      expect(names).toEqual([
        'Alimentação',
        'Transporte',
        'Moradia',
        'Saúde',
        'Educação',
        'Lazer',
        'Vestuário',
        'Assinaturas',
        'Outros',
      ]);
    });

    it('deve retornar categorias com tipo expense', () => {
      const categories = FinanceCategory.getPredefinedExpense();

      categories.forEach((c) => {
        expect(c.type).toBe('expense');
      });
    });

    it('deve retornar categorias com isPredefined true', () => {
      const categories = FinanceCategory.getPredefinedExpense();

      categories.forEach((c) => {
        expect(c.isPredefined).toBe(true);
      });
    });

    it('deve retornar categorias com userId vazio', () => {
      const categories = FinanceCategory.getPredefinedExpense();

      categories.forEach((c) => {
        expect(c.userId).toBe('');
      });
    });

    it('deve retornar instancias de FinanceCategory', () => {
      const categories = FinanceCategory.getPredefinedExpense();

      categories.forEach((c) => {
        expect(c).toBeInstanceOf(FinanceCategory);
      });
    });
  });

  describe('getPredefinedIncome', () => {
    it('deve retornar categorias de receita predefinidas', () => {
      const categories = FinanceCategory.getPredefinedIncome();

      expect(categories.length).toBe(4);

      const names = categories.map((c) => c.name);
      expect(names).toEqual([
        'Salário',
        'Freelance',
        'Investimentos',
        'Outros',
      ]);
    });

    it('deve retornar categorias com tipo income', () => {
      const categories = FinanceCategory.getPredefinedIncome();

      categories.forEach((c) => {
        expect(c.type).toBe('income');
      });
    });

    it('deve retornar categorias com isPredefined true', () => {
      const categories = FinanceCategory.getPredefinedIncome();

      categories.forEach((c) => {
        expect(c.isPredefined).toBe(true);
      });
    });

    it('deve retornar categorias com userId vazio', () => {
      const categories = FinanceCategory.getPredefinedIncome();

      categories.forEach((c) => {
        expect(c.userId).toBe('');
      });
    });

    it('deve retornar instancias de FinanceCategory', () => {
      const categories = FinanceCategory.getPredefinedIncome();

      categories.forEach((c) => {
        expect(c).toBeInstanceOf(FinanceCategory);
      });
    });
  });

  describe('restore', () => {
    it('deve restaurar uma categoria a partir dos dados do banco', () => {
      const now = new Date();
      const category = FinanceCategory.restore({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Alimentacao',
        icon: 'utensils',
        color: '#FF5733',
        type: 'expense',
        isPredefined: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(category.id).toBe('cat-1');
      expect(category.userId).toBe('user-1');
      expect(category.name).toBe('Alimentacao');
      expect(category.icon).toBe('utensils');
      expect(category.color).toBe('#FF5733');
      expect(category.type).toBe('expense');
      expect(category.isPredefined).toBe(false);
      expect(category.createdAt).toBe(now);
      expect(category.updatedAt).toBe(now);
    });

    it('deve restaurar uma categoria predefinida', () => {
      const now = new Date();
      const category = FinanceCategory.restore({
        id: 'cat-predefined-1',
        userId: '',
        name: 'Alimentacao',
        icon: 'utensils',
        color: '#FF5733',
        type: 'expense',
        isPredefined: true,
        createdAt: now,
        updatedAt: now,
      });

      expect(category.isPredefined).toBe(true);
      expect(category.userId).toBe('');
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      // Nome vazio nao deve lancar erro no restore
      const category = FinanceCategory.restore({
        id: 'cat-2',
        userId: 'user-1',
        name: '',
        icon: 'x',
        color: '#000',
        type: 'expense',
        isPredefined: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(category.name).toBe('');
    });
  });
});
