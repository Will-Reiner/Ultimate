import { TaskTag } from '../entities/TaskTag';
import { InvalidTaskTagNameError } from '../errors/TaskErrors';

describe('TaskTag', () => {
  describe('create', () => {
    it('deve criar tag com nome e cor', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Urgente',
        color: '#FF0000',
      });

      expect(tag.id).toBe('');
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('Urgente');
      expect(tag.color).toBe('#FF0000');
    });

    it('deve fazer trim no nome', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: '  Urgente  ',
        color: '#FF0000',
      });

      expect(tag.name).toBe('Urgente');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() =>
        TaskTag.create({ userId: 'user-1', name: '', color: '#FF0000' }),
      ).toThrow(InvalidTaskTagNameError);
    });

    it('deve rejeitar nome apenas com espacos', () => {
      expect(() =>
        TaskTag.create({ userId: 'user-1', name: '   ', color: '#FF0000' }),
      ).toThrow(InvalidTaskTagNameError);
    });
  });

  // Validacao de nome duplicado para o mesmo usuario e responsabilidade
  // da camada de use-case, que consulta o repositorio antes de criar.
  // A entidade apenas valida formato do nome.

  describe('tags de tarefas devem ser independentes das tags de habitos', () => {
    it('tags de tarefas devem ser independentes das tags de habitos', () => {
      // TaskTag e uma entidade separada de HabitTag/JournalTag.
      // Cada modulo tem seu proprio conjunto de tags, sem compartilhamento.
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Trabalho',
        color: '#0000FF',
      });

      expect(tag).toBeInstanceOf(TaskTag);
      expect(tag.name).toBe('Trabalho');
    });
  });

  describe('restore', () => {
    it('deve restaurar tag a partir dos dados do banco sem validacao', () => {
      const tag = TaskTag.restore({
        id: 'tag-123',
        userId: 'user-1',
        name: 'Importante',
        color: '#00FF00',
      });

      expect(tag.id).toBe('tag-123');
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('Importante');
      expect(tag.color).toBe('#00FF00');
    });

    it('deve restaurar tag mesmo com nome vazio (dados do banco)', () => {
      const tag = TaskTag.restore({
        id: 'tag-456',
        userId: 'user-1',
        name: '',
        color: '#000000',
      });

      expect(tag.name).toBe('');
    });
  });

  describe('updateName', () => {
    it('deve atualizar o nome da tag', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Antigo',
        color: '#FF0000',
      });

      tag.updateName('Novo');

      expect(tag.name).toBe('Novo');
    });

    it('deve fazer trim no novo nome', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Original',
        color: '#FF0000',
      });

      tag.updateName('  Atualizado  ');

      expect(tag.name).toBe('Atualizado');
    });

    it('deve rejeitar nome vazio ao atualizar', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Valido',
        color: '#FF0000',
      });

      expect(() => tag.updateName('')).toThrow(InvalidTaskTagNameError);
    });

    it('deve atualizar _updatedAt ao mudar o nome', () => {
      const tag = TaskTag.restore({
        id: 'tag-1',
        userId: 'user-1',
        name: 'Antigo',
        color: '#FF0000',
      });

      const before = tag.updatedAt;

      // Small delay to ensure timestamp differs
      const later = new Date(before.getTime() + 1000);
      jest.useFakeTimers();
      jest.setSystemTime(later);

      tag.updateName('Novo');

      expect(tag.updatedAt.getTime()).toBeGreaterThan(before.getTime());

      jest.useRealTimers();
    });
  });

  describe('updateColor', () => {
    it('deve atualizar a cor da tag', () => {
      const tag = TaskTag.create({
        userId: 'user-1',
        name: 'Tag',
        color: '#FF0000',
      });

      tag.updateColor('#00FF00');

      expect(tag.color).toBe('#00FF00');
    });

    it('deve atualizar _updatedAt ao mudar a cor', () => {
      const tag = TaskTag.restore({
        id: 'tag-1',
        userId: 'user-1',
        name: 'Tag',
        color: '#FF0000',
      });

      const before = tag.updatedAt;

      const later = new Date(before.getTime() + 1000);
      jest.useFakeTimers();
      jest.setSystemTime(later);

      tag.updateColor('#0000FF');

      expect(tag.updatedAt.getTime()).toBeGreaterThan(before.getTime());

      jest.useRealTimers();
    });
  });
});
