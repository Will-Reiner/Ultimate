import { CreditCard } from '../entities/CreditCard';
import {
  InvalidCreditCardNameError,
  InvalidCreditCardLimitError,
  InvalidClosingDayError,
  InvalidDueDayError,
  CreditCardArchivedError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Nubank',
    limit: 5000,
    closingDay: 20,
    dueDay: 27,
    ...overrides,
  };
}

describe('CreditCard', () => {
  describe('criacao', () => {
    it('deve criar um cartao com campos obrigatorios', () => {
      const card = CreditCard.create(buildValidProps());

      expect(card.id).toBe('');
      expect(card.userId).toBe('user-1');
      expect(card.name).toBe('Nubank');
      expect(card.limit).toBe(5000);
      expect(card.closingDay).toBe(20);
      expect(card.dueDay).toBe(27);
      expect(card.color).toBeNull();
      expect(card.icon).toBeNull();
      expect(card.isArchived).toBe(false);
      expect(card.createdAt).toBeInstanceOf(Date);
      expect(card.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar cartao com color e icon opcionais', () => {
      const card = CreditCard.create(
        buildValidProps({ color: '#8B5CF6', icon: 'credit-card' }),
      );

      expect(card.color).toBe('#8B5CF6');
      expect(card.icon).toBe('credit-card');
    });

    it('deve fazer trim no nome', () => {
      const card = CreditCard.create(buildValidProps({ name: '  Inter  ' }));

      expect(card.name).toBe('Inter');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ name: '' })),
      ).toThrow(InvalidCreditCardNameError);
    });

    it('deve rejeitar nome com apenas espacos', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ name: '   ' })),
      ).toThrow(InvalidCreditCardNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        CreditCard.create(buildValidProps({ name: longName })),
      ).toThrow(InvalidCreditCardNameError);
    });

    it('deve aceitar nome com exatamente 100 caracteres', () => {
      const name = 'a'.repeat(100);
      const card = CreditCard.create(buildValidProps({ name }));

      expect(card.name).toBe(name);
    });

    it('deve rejeitar limite zero', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ limit: 0 })),
      ).toThrow(InvalidCreditCardLimitError);
    });

    it('deve rejeitar limite negativo', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ limit: -100 })),
      ).toThrow(InvalidCreditCardLimitError);
    });

    it('deve aceitar limite positivo', () => {
      const card = CreditCard.create(buildValidProps({ limit: 1000 }));

      expect(card.limit).toBe(1000);
    });

    it('deve rejeitar closingDay menor que 1', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ closingDay: 0 })),
      ).toThrow(InvalidClosingDayError);
    });

    it('deve rejeitar closingDay maior que 31', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ closingDay: 32 })),
      ).toThrow(InvalidClosingDayError);
    });

    it('deve aceitar closingDay igual a 1', () => {
      const card = CreditCard.create(buildValidProps({ closingDay: 1 }));

      expect(card.closingDay).toBe(1);
    });

    it('deve aceitar closingDay igual a 31', () => {
      const card = CreditCard.create(buildValidProps({ closingDay: 31 }));

      expect(card.closingDay).toBe(31);
    });

    it('deve rejeitar dueDay menor que 1', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ dueDay: 0 })),
      ).toThrow(InvalidDueDayError);
    });

    it('deve rejeitar dueDay maior que 31', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ dueDay: 32 })),
      ).toThrow(InvalidDueDayError);
    });

    it('deve aceitar dueDay igual a 1', () => {
      const card = CreditCard.create(buildValidProps({ dueDay: 1 }));

      expect(card.dueDay).toBe(1);
    });

    it('deve aceitar dueDay igual a 31', () => {
      const card = CreditCard.create(buildValidProps({ dueDay: 31 }));

      expect(card.dueDay).toBe(31);
    });

    it('deve definir isArchived como false', () => {
      const card = CreditCard.create(buildValidProps());

      expect(card.isArchived).toBe(false);
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const card = CreditCard.create(buildValidProps());
      const after = new Date();

      expect(card.id).toBe('');
      expect(card.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(card.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(card.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve definir color como null quando nao informado', () => {
      const card = CreditCard.create(buildValidProps());

      expect(card.color).toBeNull();
    });

    it('deve definir icon como null quando nao informado', () => {
      const card = CreditCard.create(buildValidProps());

      expect(card.icon).toBeNull();
    });

    it('deve rejeitar closingDay fracionario', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ closingDay: 15.5 })),
      ).toThrow(InvalidClosingDayError);
    });

    it('deve rejeitar dueDay fracionario', () => {
      expect(() =>
        CreditCard.create(buildValidProps({ dueDay: 10.3 })),
      ).toThrow(InvalidDueDayError);
    });
  });

  describe('edicao', () => {
    it('deve atualizar o nome', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateName('Inter');

      expect(card.name).toBe('Inter');
    });

    it('deve fazer trim no nome ao atualizar', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateName('  Inter  ');

      expect(card.name).toBe('Inter');
    });

    it('deve rejeitar nome vazio na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateName('')).toThrow(InvalidCreditCardNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateName('a'.repeat(101))).toThrow(
        InvalidCreditCardNameError,
      );
    });

    it('deve atualizar updatedAt ao atualizar o nome', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateName('Inter');

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve impedir atualizacao de nome em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateName('Novo Nome')).toThrow(CreditCardArchivedError);
    });

    it('deve atualizar o limite', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateLimit(10000);

      expect(card.limit).toBe(10000);
    });

    it('deve rejeitar limite zero na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateLimit(0)).toThrow(InvalidCreditCardLimitError);
    });

    it('deve rejeitar limite negativo na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateLimit(-500)).toThrow(InvalidCreditCardLimitError);
    });

    it('deve atualizar updatedAt ao atualizar o limite', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateLimit(10000);

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve impedir atualizacao de limite em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateLimit(10000)).toThrow(CreditCardArchivedError);
    });

    it('deve atualizar o dia de fechamento', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateClosingDay(15);

      expect(card.closingDay).toBe(15);
    });

    it('deve rejeitar closingDay invalido na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateClosingDay(0)).toThrow(InvalidClosingDayError);
      expect(() => card.updateClosingDay(32)).toThrow(InvalidClosingDayError);
    });

    it('deve atualizar updatedAt ao atualizar o dia de fechamento', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateClosingDay(15);

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve impedir atualizacao de closingDay em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateClosingDay(15)).toThrow(CreditCardArchivedError);
    });

    it('deve atualizar o dia de vencimento', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateDueDay(10);

      expect(card.dueDay).toBe(10);
    });

    it('deve rejeitar dueDay invalido na atualizacao', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.updateDueDay(0)).toThrow(InvalidDueDayError);
      expect(() => card.updateDueDay(32)).toThrow(InvalidDueDayError);
    });

    it('deve atualizar updatedAt ao atualizar o dia de vencimento', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateDueDay(10);

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve impedir atualizacao de dueDay em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateDueDay(10)).toThrow(CreditCardArchivedError);
    });

    it('deve atualizar a cor', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateColor('#00FF00');

      expect(card.color).toBe('#00FF00');
    });

    it('deve atualizar updatedAt ao atualizar a cor', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateColor('#00FF00');

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a cor para null', () => {
      const card = CreditCard.create(buildValidProps({ color: '#8B5CF6' }));
      card.updateColor(null);

      expect(card.color).toBeNull();
    });

    it('deve impedir atualizacao de cor em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateColor('#FF0000')).toThrow(CreditCardArchivedError);
    });

    it('deve atualizar o icone', () => {
      const card = CreditCard.create(buildValidProps());
      card.updateIcon('wallet');

      expect(card.icon).toBe('wallet');
    });

    it('deve atualizar updatedAt ao atualizar o icone', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.updateIcon('wallet');

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar o icone para null', () => {
      const card = CreditCard.create(buildValidProps({ icon: 'credit-card' }));
      card.updateIcon(null);

      expect(card.icon).toBeNull();
    });

    it('deve impedir atualizacao de icone em cartao arquivado', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.updateIcon('wallet')).toThrow(CreditCardArchivedError);
    });
  });

  describe('limite disponivel', () => {
    it('deve calcular limite disponivel corretamente', () => {
      const card = CreditCard.create(buildValidProps({ limit: 5000 }));

      expect(card.calculateAvailableLimit(2000)).toBe(3000);
    });

    it('deve retornar limite total quando nao ha fatura aberta', () => {
      const card = CreditCard.create(buildValidProps({ limit: 5000 }));

      expect(card.calculateAvailableLimit(0)).toBe(5000);
    });

    it('deve retornar zero quando fatura aberta igual ao limite', () => {
      const card = CreditCard.create(buildValidProps({ limit: 5000 }));

      expect(card.calculateAvailableLimit(5000)).toBe(0);
    });

    it('deve retornar valor negativo quando fatura aberta excede o limite', () => {
      const card = CreditCard.create(buildValidProps({ limit: 5000 }));

      expect(card.calculateAvailableLimit(6000)).toBe(-1000);
    });
  });

  describe('ciclo de vida', () => {
    it('deve arquivar o cartao', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(card.isArchived).toBe(true);
    });

    it('deve atualizar updatedAt ao arquivar', () => {
      const card = CreditCard.create(buildValidProps());
      const originalUpdatedAt = card.updatedAt;

      card.archive();

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve reativar o cartao', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();
      card.reactivate();

      expect(card.isArchived).toBe(false);
    });

    it('deve atualizar updatedAt ao reativar', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();
      const afterArchive = card.updatedAt;

      card.reactivate();

      expect(card.updatedAt.getTime()).toBeGreaterThanOrEqual(
        afterArchive.getTime(),
      );
    });

    it('deve lancar erro ao operar em cartao arquivado via ensureActive', () => {
      const card = CreditCard.create(buildValidProps());
      card.archive();

      expect(() => card.ensureActive()).toThrow(CreditCardArchivedError);
    });

    it('nao deve lancar erro ao chamar ensureActive em cartao ativo', () => {
      const card = CreditCard.create(buildValidProps());

      expect(() => card.ensureActive()).not.toThrow();
    });
  });

  describe('restore', () => {
    it('deve restaurar um cartao a partir dos dados do banco', () => {
      const now = new Date();
      const card = CreditCard.restore({
        id: 'cc-1',
        userId: 'user-1',
        name: 'Nubank',
        limit: 5000,
        closingDay: 20,
        dueDay: 27,
        color: '#8B5CF6',
        icon: 'credit-card',
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(card.id).toBe('cc-1');
      expect(card.userId).toBe('user-1');
      expect(card.name).toBe('Nubank');
      expect(card.limit).toBe(5000);
      expect(card.closingDay).toBe(20);
      expect(card.dueDay).toBe(27);
      expect(card.color).toBe('#8B5CF6');
      expect(card.icon).toBe('credit-card');
      expect(card.isArchived).toBe(false);
      expect(card.createdAt).toBe(now);
      expect(card.updatedAt).toBe(now);
    });

    it('deve restaurar cartao arquivado', () => {
      const now = new Date();
      const card = CreditCard.restore({
        id: 'cc-2',
        userId: 'user-1',
        name: 'Cartao Antigo',
        limit: 3000,
        closingDay: 10,
        dueDay: 15,
        color: null,
        icon: null,
        isArchived: true,
        createdAt: now,
        updatedAt: now,
      });

      expect(card.isArchived).toBe(true);
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      // Nome vazio e limite zero nao devem lancar erro no restore
      const card = CreditCard.restore({
        id: 'cc-3',
        userId: 'user-1',
        name: '',
        limit: 0,
        closingDay: 0,
        dueDay: 0,
        color: null,
        icon: null,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(card.name).toBe('');
      expect(card.limit).toBe(0);
      expect(card.closingDay).toBe(0);
      expect(card.dueDay).toBe(0);
    });
  });
});
