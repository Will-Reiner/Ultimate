import { JournalTag } from '../entities/JournalTag';
import {
  InvalidJournalTagNameError,
  PredefinedTagImmutableError,
} from '../errors/JournalErrors';

describe('JournalTag', () => {
  describe('tags pré-definidas', () => {
    it('deve criar tag pré-definida com isPredefined=true e userId=null', () => {
      const tag = JournalTag.createPredefined({ id: 'tag-1', name: 'Gratidão' });
      expect(tag.id).toBe('tag-1');
      expect(tag.name).toBe('Gratidão');
      expect(tag.isPredefined).toBe(true);
      expect(tag.userId).toBeNull();
    });

    it('não deve permitir deletar tag pré-definida', () => {
      const tag = JournalTag.createPredefined({ id: 'tag-1', name: 'Gratidão' });
      expect(() => tag.validateCanDelete()).toThrow(PredefinedTagImmutableError);
    });

    it('não deve permitir editar tag pré-definida', () => {
      const tag = JournalTag.createPredefined({ id: 'tag-1', name: 'Gratidão' });
      expect(() => tag.validateCanEdit()).toThrow(PredefinedTagImmutableError);
    });

    it('deve conter as 6 tags pré-definidas do sistema', () => {
      expect(JournalTag.PREDEFINED_TAGS).toEqual([
        'Pensamentos',
        'Ideias',
        'Emoções',
        'Gratidão',
        'Desabafo',
        'Reflexão',
      ]);
      expect(JournalTag.PREDEFINED_TAGS).toHaveLength(6);
    });
  });

  describe('tags do usuário', () => {
    it('deve criar tag do usuário com isPredefined=false e userId preenchido', () => {
      const tag = JournalTag.createUserTag({ name: 'Trabalho', userId: 'user-1' });
      expect(tag.name).toBe('Trabalho');
      expect(tag.isPredefined).toBe(false);
      expect(tag.userId).toBe('user-1');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => JournalTag.createUserTag({ name: '', userId: 'user-1' })).toThrow(
        InvalidJournalTagNameError,
      );
      expect(() => JournalTag.createUserTag({ name: '   ', userId: 'user-1' })).toThrow(
        InvalidJournalTagNameError,
      );
    });

    it('deve permitir deletar tag do usuário', () => {
      const tag = JournalTag.createUserTag({ name: 'Trabalho', userId: 'user-1' });
      expect(() => tag.validateCanDelete()).not.toThrow();
    });

    it('deve permitir editar tag do usuário', () => {
      const tag = JournalTag.createUserTag({ name: 'Trabalho', userId: 'user-1' });
      expect(() => tag.validateCanEdit()).not.toThrow();
    });

    it('deve fazer trim no nome', () => {
      const tag = JournalTag.createUserTag({ name: '  Trabalho  ', userId: 'user-1' });
      expect(tag.name).toBe('Trabalho');
    });
  });

  describe('restore', () => {
    it('deve restaurar tag a partir dos dados do banco', () => {
      const tag = JournalTag.restore({
        id: 'tag-1',
        name: 'Gratidão',
        isPredefined: true,
        userId: null,
      });
      expect(tag.id).toBe('tag-1');
      expect(tag.name).toBe('Gratidão');
      expect(tag.isPredefined).toBe(true);
      expect(tag.userId).toBeNull();
    });
  });
});
