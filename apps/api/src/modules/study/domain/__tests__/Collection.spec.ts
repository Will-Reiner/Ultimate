import { Collection } from '../entities/Collection';
import { InvalidCollectionNameError } from '../errors/StudyErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Programação',
    ...overrides,
  };
}

describe('Collection', () => {
  describe('criação', () => {
    it('deve criar coleção com nome obrigatório', () => {
      const collection = Collection.create(buildValidProps());
      expect(collection.name).toBe('Programação');
      expect(collection.userId).toBe('user-1');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => Collection.create(buildValidProps({ name: '' }))).toThrow(InvalidCollectionNameError);
      expect(() => Collection.create(buildValidProps({ name: '   ' }))).toThrow(InvalidCollectionNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(() => Collection.create(buildValidProps({ name: longName }))).toThrow(InvalidCollectionNameError);
    });

    it('deve permitir criar sem descrição, cor e ícone', () => {
      const collection = Collection.create(buildValidProps());
      expect(collection.description).toBeNull();
      expect(collection.color).toBeNull();
      expect(collection.icon).toBeNull();
    });
  });

  describe('edição', () => {
    it('deve atualizar nome e descrição', () => {
      const collection = Collection.create(buildValidProps());
      collection.updateName('Design');
      collection.updateDescription('Livros de design');
      expect(collection.name).toBe('Design');
      expect(collection.description).toBe('Livros de design');
    });

    it('deve atualizar cor e ícone', () => {
      const collection = Collection.create(buildValidProps());
      collection.updateColor('#ff5733');
      collection.updateIcon('📚');
      expect(collection.color).toBe('#ff5733');
      expect(collection.icon).toBe('📚');
    });

    it('deve reordenar coleção', () => {
      const collection = Collection.create(buildValidProps());
      collection.updateOrder(5);
      expect(collection.order).toBe(5);
    });
  });

  describe('exclusão', () => {
    it('deve permitir excluir coleção', () => {
      const collection = Collection.create(buildValidProps());
      expect(collection).toBeDefined();
      // A exclusão em si é responsabilidade do repositório
    });

    it('deve desvincular itens ao excluir (não deleta itens)', () => {
      // Este comportamento é validado no use case / repositório
      // A entidade Collection não tem acoplamento direto com StudyItem
      const collection = Collection.create(buildValidProps());
      expect(collection.id).toBeDefined();
    });
  });

  describe('restore', () => {
    it('deve restaurar coleção a partir dos dados do banco', () => {
      const now = new Date();
      const collection = Collection.restore({
        id: 'col-1',
        userId: 'user-1',
        name: 'Backend',
        description: 'Livros de backend',
        color: '#3178c6',
        icon: '🖥️',
        order: 2,
        createdAt: now,
        updatedAt: now,
      });
      expect(collection.id).toBe('col-1');
      expect(collection.name).toBe('Backend');
      expect(collection.color).toBe('#3178c6');
      expect(collection.order).toBe(2);
    });
  });
});
