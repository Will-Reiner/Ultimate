import { FinanceTag } from '../entities/FinanceTag';
import { InvalidFinanceTagNameError } from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Viagem',
    ...overrides,
  };
}

describe('FinanceTag', () => {
  describe('criacao', () => {
    it('deve criar uma tag com campos obrigatorios', () => {
      const tag = FinanceTag.create(buildValidProps());

      expect(tag.id).toBe('');
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('Viagem');
      expect(tag.color).toBeNull();
      expect(tag.createdAt).toBeInstanceOf(Date);
      expect(tag.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar uma tag com cor opcional', () => {
      const tag = FinanceTag.create(buildValidProps({ color: '#FF5733' }));

      expect(tag.color).toBe('#FF5733');
    });

    it('deve aceitar color null explicitamente', () => {
      const tag = FinanceTag.create(buildValidProps({ color: null }));

      expect(tag.color).toBeNull();
    });

    it('deve fazer trim no nome', () => {
      const tag = FinanceTag.create(buildValidProps({ name: '  Viagem  ' }));

      expect(tag.name).toBe('Viagem');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => FinanceTag.create(buildValidProps({ name: '' }))).toThrow(
        InvalidFinanceTagNameError,
      );
    });

    it('deve rejeitar nome com apenas espacos', () => {
      expect(() => FinanceTag.create(buildValidProps({ name: '   ' }))).toThrow(
        InvalidFinanceTagNameError,
      );
    });

    it('deve rejeitar nome com mais de 50 caracteres', () => {
      const longName = 'a'.repeat(51);
      expect(() =>
        FinanceTag.create(buildValidProps({ name: longName })),
      ).toThrow(InvalidFinanceTagNameError);
    });

    it('deve aceitar nome com exatamente 50 caracteres', () => {
      const name = 'a'.repeat(50);
      const tag = FinanceTag.create(buildValidProps({ name }));

      expect(tag.name).toBe(name);
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const tag = FinanceTag.create(buildValidProps());
      const after = new Date();

      expect(tag.id).toBe('');
      expect(tag.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tag.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(tag.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('edicao', () => {
    it('deve atualizar o nome', () => {
      const tag = FinanceTag.create(buildValidProps());
      tag.updateName('Emergencia');

      expect(tag.name).toBe('Emergencia');
    });

    it('deve fazer trim no nome ao atualizar', () => {
      const tag = FinanceTag.create(buildValidProps());
      tag.updateName('  Emergencia  ');

      expect(tag.name).toBe('Emergencia');
    });

    it('deve rejeitar nome vazio na atualizacao', () => {
      const tag = FinanceTag.create(buildValidProps());

      expect(() => tag.updateName('')).toThrow(InvalidFinanceTagNameError);
    });

    it('deve rejeitar nome com mais de 50 caracteres na atualizacao', () => {
      const tag = FinanceTag.create(buildValidProps());

      expect(() => tag.updateName('a'.repeat(51))).toThrow(
        InvalidFinanceTagNameError,
      );
    });

    it('deve atualizar updatedAt ao atualizar o nome', () => {
      const tag = FinanceTag.create(buildValidProps());
      const originalUpdatedAt = tag.updatedAt;

      tag.updateName('Emergencia');

      expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a cor', () => {
      const tag = FinanceTag.create(buildValidProps());
      tag.updateColor('#00FF00');

      expect(tag.color).toBe('#00FF00');
    });

    it('deve permitir setar cor para null', () => {
      const tag = FinanceTag.create(buildValidProps({ color: '#FF0000' }));
      tag.updateColor(null);

      expect(tag.color).toBeNull();
    });

    it('deve atualizar updatedAt ao atualizar a cor', () => {
      const tag = FinanceTag.create(buildValidProps());
      const originalUpdatedAt = tag.updatedAt;

      tag.updateColor('#00FF00');

      expect(tag.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('restore', () => {
    it('deve restaurar uma tag a partir dos dados do banco', () => {
      const now = new Date();
      const tag = FinanceTag.restore({
        id: 'tag-1',
        userId: 'user-1',
        name: 'Viagem',
        color: '#FF5733',
        createdAt: now,
        updatedAt: now,
      });

      expect(tag.id).toBe('tag-1');
      expect(tag.userId).toBe('user-1');
      expect(tag.name).toBe('Viagem');
      expect(tag.color).toBe('#FF5733');
      expect(tag.createdAt).toBe(now);
      expect(tag.updatedAt).toBe(now);
    });

    it('deve restaurar uma tag sem cor', () => {
      const now = new Date();
      const tag = FinanceTag.restore({
        id: 'tag-2',
        userId: 'user-1',
        name: 'Presente',
        color: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(tag.color).toBeNull();
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      // Nome vazio nao deve lancar erro no restore
      const tag = FinanceTag.restore({
        id: 'tag-3',
        userId: 'user-1',
        name: '',
        color: null,
        createdAt: now,
        updatedAt: now,
      });

      expect(tag.name).toBe('');
    });
  });
});
