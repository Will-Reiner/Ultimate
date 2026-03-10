import { Account, AccountType } from '../entities/Account';
import {
  InvalidAccountNameError,
  InvalidAccountTypeError,
  InvalidAccountAmountError,
  AccountArchivedError,
} from '../errors/FinanceErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    name: 'Conta Corrente',
    type: 'checking' as AccountType,
    ...overrides,
  };
}

describe('Account', () => {
  describe('criacao', () => {
    it('deve criar uma conta com campos obrigatorios', () => {
      const account = Account.create(buildValidProps());

      expect(account.id).toBe('');
      expect(account.userId).toBe('user-1');
      expect(account.name).toBe('Conta Corrente');
      expect(account.type).toBe('checking');
      expect(account.balance).toBe(0);
      expect(account.color).toBeNull();
      expect(account.icon).toBeNull();
      expect(account.isArchived).toBe(false);
      expect(account.createdAt).toBeInstanceOf(Date);
      expect(account.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar conta com color e icon opcionais', () => {
      const account = Account.create(
        buildValidProps({ color: '#FF5733', icon: 'bank' }),
      );

      expect(account.color).toBe('#FF5733');
      expect(account.icon).toBe('bank');
    });

    it('deve aceitar todos os tipos validos', () => {
      const types: AccountType[] = ['checking', 'savings', 'cash', 'investment', 'other'];

      types.forEach((type) => {
        const account = Account.create(buildValidProps({ type }));
        expect(account.type).toBe(type);
      });
    });

    it('deve fazer trim no nome', () => {
      const account = Account.create(buildValidProps({ name: '  Poupanca  ' }));

      expect(account.name).toBe('Poupanca');
    });

    it('deve rejeitar nome vazio', () => {
      expect(() =>
        Account.create(buildValidProps({ name: '' })),
      ).toThrow(InvalidAccountNameError);
    });

    it('deve rejeitar nome com apenas espacos', () => {
      expect(() =>
        Account.create(buildValidProps({ name: '   ' })),
      ).toThrow(InvalidAccountNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres', () => {
      const longName = 'a'.repeat(101);
      expect(() =>
        Account.create(buildValidProps({ name: longName })),
      ).toThrow(InvalidAccountNameError);
    });

    it('deve aceitar nome com exatamente 100 caracteres', () => {
      const name = 'a'.repeat(100);
      const account = Account.create(buildValidProps({ name }));

      expect(account.name).toBe(name);
    });

    it('deve rejeitar tipo invalido', () => {
      expect(() =>
        Account.create(buildValidProps({ type: 'invalid' })),
      ).toThrow(InvalidAccountTypeError);
    });

    it('deve definir balance como 0', () => {
      const account = Account.create(buildValidProps());

      expect(account.balance).toBe(0);
    });

    it('deve definir isArchived como false', () => {
      const account = Account.create(buildValidProps());

      expect(account.isArchived).toBe(false);
    });

    it('deve definir id vazio e timestamps como new Date()', () => {
      const before = new Date();
      const account = Account.create(buildValidProps());
      const after = new Date();

      expect(account.id).toBe('');
      expect(account.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(account.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(account.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve definir color como null quando nao informado', () => {
      const account = Account.create(buildValidProps());

      expect(account.color).toBeNull();
    });

    it('deve definir icon como null quando nao informado', () => {
      const account = Account.create(buildValidProps());

      expect(account.icon).toBeNull();
    });
  });

  describe('edicao', () => {
    it('deve atualizar o nome', () => {
      const account = Account.create(buildValidProps());
      account.updateName('Poupanca');

      expect(account.name).toBe('Poupanca');
    });

    it('deve fazer trim no nome ao atualizar', () => {
      const account = Account.create(buildValidProps());
      account.updateName('  Poupanca  ');

      expect(account.name).toBe('Poupanca');
    });

    it('deve rejeitar nome vazio na atualizacao', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.updateName('')).toThrow(InvalidAccountNameError);
    });

    it('deve rejeitar nome com mais de 100 caracteres na atualizacao', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.updateName('a'.repeat(101))).toThrow(
        InvalidAccountNameError,
      );
    });

    it('deve atualizar updatedAt ao atualizar o nome', () => {
      const account = Account.create(buildValidProps());
      const originalUpdatedAt = account.updatedAt;

      account.updateName('Poupanca');

      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve impedir atualizacao de nome em conta arquivada', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(() => account.updateName('Novo Nome')).toThrow(AccountArchivedError);
    });

    it('deve atualizar a cor', () => {
      const account = Account.create(buildValidProps());
      account.updateColor('#00FF00');

      expect(account.color).toBe('#00FF00');
    });

    it('deve atualizar updatedAt ao atualizar a cor', () => {
      const account = Account.create(buildValidProps());
      const originalUpdatedAt = account.updatedAt;

      account.updateColor('#00FF00');

      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar a cor para null', () => {
      const account = Account.create(buildValidProps({ color: '#FF5733' }));
      account.updateColor(null);

      expect(account.color).toBeNull();
    });

    it('deve atualizar o icone', () => {
      const account = Account.create(buildValidProps());
      account.updateIcon('wallet');

      expect(account.icon).toBe('wallet');
    });

    it('deve atualizar updatedAt ao atualizar o icone', () => {
      const account = Account.create(buildValidProps());
      const originalUpdatedAt = account.updatedAt;

      account.updateIcon('wallet');

      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve atualizar o icone para null', () => {
      const account = Account.create(buildValidProps({ icon: 'bank' }));
      account.updateIcon(null);

      expect(account.icon).toBeNull();
    });
  });

  describe('operacoes de saldo', () => {
    it('deve creditar valor positivo', () => {
      const account = Account.create(buildValidProps());
      account.credit(100);

      expect(account.balance).toBe(100);
    });

    it('deve creditar multiplas vezes acumulando saldo', () => {
      const account = Account.create(buildValidProps());
      account.credit(100);
      account.credit(50.5);

      expect(account.balance).toBe(150.5);
    });

    it('deve rejeitar credito com valor zero', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.credit(0)).toThrow(InvalidAccountAmountError);
    });

    it('deve rejeitar credito com valor negativo', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.credit(-10)).toThrow(InvalidAccountAmountError);
    });

    it('deve impedir credito em conta arquivada', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(() => account.credit(100)).toThrow(AccountArchivedError);
    });

    it('deve debitar valor positivo', () => {
      const account = Account.create(buildValidProps());
      account.credit(200);
      account.debit(50);

      expect(account.balance).toBe(150);
    });

    it('deve permitir saldo negativo ao debitar', () => {
      const account = Account.create(buildValidProps());
      account.debit(100);

      expect(account.balance).toBe(-100);
    });

    it('deve rejeitar debito com valor zero', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.debit(0)).toThrow(InvalidAccountAmountError);
    });

    it('deve rejeitar debito com valor negativo', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.debit(-10)).toThrow(InvalidAccountAmountError);
    });

    it('deve impedir debito em conta arquivada', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(() => account.debit(100)).toThrow(AccountArchivedError);
    });

    it('deve ajustar saldo diretamente', () => {
      const account = Account.create(buildValidProps());
      account.adjustBalance(500);

      expect(account.balance).toBe(500);
    });

    it('deve ajustar saldo para valor negativo', () => {
      const account = Account.create(buildValidProps());
      account.adjustBalance(-200);

      expect(account.balance).toBe(-200);
    });

    it('deve ajustar saldo para zero', () => {
      const account = Account.create(buildValidProps());
      account.credit(100);
      account.adjustBalance(0);

      expect(account.balance).toBe(0);
    });

    it('deve impedir ajuste de saldo em conta arquivada', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(() => account.adjustBalance(500)).toThrow(AccountArchivedError);
    });
  });

  describe('ciclo de vida', () => {
    it('deve arquivar a conta', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(account.isArchived).toBe(true);
    });

    it('deve atualizar updatedAt ao arquivar', () => {
      const account = Account.create(buildValidProps());
      const originalUpdatedAt = account.updatedAt;

      account.archive();

      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('deve reativar a conta', () => {
      const account = Account.create(buildValidProps());
      account.archive();
      account.reactivate();

      expect(account.isArchived).toBe(false);
    });

    it('deve atualizar updatedAt ao reativar', () => {
      const account = Account.create(buildValidProps());
      account.archive();
      const afterArchive = account.updatedAt;

      account.reactivate();

      expect(account.updatedAt.getTime()).toBeGreaterThanOrEqual(
        afterArchive.getTime(),
      );
    });

    it('deve lancar erro ao operar em conta arquivada via ensureActive', () => {
      const account = Account.create(buildValidProps());
      account.archive();

      expect(() => account.ensureActive()).toThrow(AccountArchivedError);
    });

    it('nao deve lancar erro ao chamar ensureActive em conta ativa', () => {
      const account = Account.create(buildValidProps());

      expect(() => account.ensureActive()).not.toThrow();
    });
  });

  describe('restore', () => {
    it('deve restaurar uma conta a partir dos dados do banco', () => {
      const now = new Date();
      const account = Account.restore({
        id: 'acc-1',
        userId: 'user-1',
        name: 'Conta Corrente',
        type: 'checking',
        balance: 1500.50,
        color: '#FF5733',
        icon: 'bank',
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(account.id).toBe('acc-1');
      expect(account.userId).toBe('user-1');
      expect(account.name).toBe('Conta Corrente');
      expect(account.type).toBe('checking');
      expect(account.balance).toBe(1500.50);
      expect(account.color).toBe('#FF5733');
      expect(account.icon).toBe('bank');
      expect(account.isArchived).toBe(false);
      expect(account.createdAt).toBe(now);
      expect(account.updatedAt).toBe(now);
    });

    it('deve restaurar conta arquivada', () => {
      const now = new Date();
      const account = Account.restore({
        id: 'acc-2',
        userId: 'user-1',
        name: 'Conta Antiga',
        type: 'savings',
        balance: 0,
        color: null,
        icon: null,
        isArchived: true,
        createdAt: now,
        updatedAt: now,
      });

      expect(account.isArchived).toBe(true);
    });

    it('deve restaurar sem executar validacao', () => {
      const now = new Date();
      // Nome vazio nao deve lancar erro no restore
      const account = Account.restore({
        id: 'acc-3',
        userId: 'user-1',
        name: '',
        type: 'checking',
        balance: -500,
        color: null,
        icon: null,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(account.name).toBe('');
      expect(account.balance).toBe(-500);
    });
  });
});
