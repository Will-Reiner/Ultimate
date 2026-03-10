import { CategoryLimit } from '../value-objects/CategoryLimit';
import { InvalidCategoryLimitError } from '../errors/FinanceErrors';

const buildValidProps = () => ({
  categoryId: 'cat-uuid-123',
  limit: 500,
});

describe('CategoryLimit', () => {
  describe('criacao', () => {
    it('deve criar CategoryLimit com props validas', () => {
      const props = buildValidProps();
      const cl = CategoryLimit.create(props);

      expect(cl.categoryId).toBe(props.categoryId);
      expect(cl.limit).toBe(props.limit);
    });

    it('deve aceitar limite com valor decimal', () => {
      const cl = CategoryLimit.create({ categoryId: 'cat-1', limit: 99.99 });
      expect(cl.limit).toBe(99.99);
    });

    it('deve rejeitar limite igual a zero', () => {
      expect(() =>
        CategoryLimit.create({ categoryId: 'cat-1', limit: 0 }),
      ).toThrow(InvalidCategoryLimitError);
    });

    it('deve rejeitar limite negativo', () => {
      expect(() =>
        CategoryLimit.create({ categoryId: 'cat-1', limit: -100 }),
      ).toThrow(InvalidCategoryLimitError);
    });
  });

  describe('restore', () => {
    it('deve restaurar CategoryLimit sem validacao', () => {
      const cl = CategoryLimit.restore({ categoryId: 'cat-1', limit: 1000 });

      expect(cl.categoryId).toBe('cat-1');
      expect(cl.limit).toBe(1000);
    });
  });

  describe('toJSON', () => {
    it('deve retornar representacao JSON correta', () => {
      const props = buildValidProps();
      const cl = CategoryLimit.create(props);

      expect(cl.toJSON()).toEqual({
        categoryId: props.categoryId,
        limit: props.limit,
      });
    });
  });
});
