import { Tag } from '../entities/Tag';
import { InvalidTagNameError, InvalidTagColorError } from '../errors/TagErrors';

describe('Tag', () => {
  const validProps = { userId: 'user-1', name: 'Fitness', color: '#ff5500' };

  describe('create', () => {
    it('deve criar tag com dados válidos', () => {
      const tag = Tag.create(validProps);
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('Fitness');
      expect(tag.color).toBe('#ff5500');
      expect(tag.id).toBeNull();
    });

    it('deve fazer trim no nome', () => {
      const tag = Tag.create({ ...validProps, name: '  Fitness  ' });
      expect(tag.name).toBe('Fitness');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => Tag.create({ ...validProps, name: '' })).toThrow(InvalidTagNameError);
    });

    it('deve rejeitar nome apenas com espaços', () => {
      expect(() => Tag.create({ ...validProps, name: '   ' })).toThrow(InvalidTagNameError);
    });

    it('deve rejeitar nome com mais de 30 caracteres', () => {
      expect(() => Tag.create({ ...validProps, name: 'a'.repeat(31) })).toThrow(InvalidTagNameError);
    });

    it('deve aceitar nome com exatamente 30 caracteres', () => {
      const tag = Tag.create({ ...validProps, name: 'a'.repeat(30) });
      expect(tag.name).toBe('a'.repeat(30));
    });

    it('deve rejeitar cor vazia', () => {
      expect(() => Tag.create({ ...validProps, color: '' })).toThrow(InvalidTagColorError);
    });

    it('deve rejeitar cor com formato inválido', () => {
      expect(() => Tag.create({ ...validProps, color: 'red' })).toThrow(InvalidTagColorError);
      expect(() => Tag.create({ ...validProps, color: '#fff' })).toThrow(InvalidTagColorError);
      expect(() => Tag.create({ ...validProps, color: '#GGGGGG' })).toThrow(InvalidTagColorError);
    });

    it('deve aceitar cor hex válida (case-insensitive)', () => {
      expect(Tag.create({ ...validProps, color: '#aaBBcc' }).color).toBe('#aaBBcc');
    });
  });

  describe('restore', () => {
    it('deve restaurar tag com id', () => {
      const tag = Tag.restore({ id: 'tag-1', userId: 'user-1', name: 'Fitness', color: '#ff5500' });
      expect(tag.id).toBe('tag-1');
      expect(tag.name).toBe('Fitness');
    });
  });
});
