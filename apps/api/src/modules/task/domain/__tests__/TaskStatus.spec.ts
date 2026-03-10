import { TaskStatus, TaskStatusType } from '../value-objects/TaskStatus';
import { InvalidTaskStatusError } from '../errors/TaskErrors';

describe('TaskStatus', () => {
  const validProps = { name: 'Em Review', type: 'in_progress' as TaskStatusType, color: '#ff8800' };

  describe('create', () => {
    it('deve criar status com nome, type e cor', () => {
      const status = TaskStatus.create(validProps);
      expect(status.name).toBe('Em Review');
      expect(status.type).toBe('in_progress');
      expect(status.color).toBe('#ff8800');
      expect(status.isDefault).toBe(false);
      expect(status.id).toBeDefined();
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => TaskStatus.create({ ...validProps, name: '' }))
        .toThrow(InvalidTaskStatusError);
      expect(() => TaskStatus.create({ ...validProps, name: '   ' }))
        .toThrow(InvalidTaskStatusError);
    });

    it('deve mapear para um type global (todo, in_progress, done)', () => {
      const todo = TaskStatus.create({ name: 'Backlog', type: 'todo', color: '#cccccc' });
      expect(todo.type).toBe('todo');

      const inProgress = TaskStatus.create({ name: 'Fazendo', type: 'in_progress', color: '#0000ff' });
      expect(inProgress.type).toBe('in_progress');

      const done = TaskStatus.create({ name: 'Cancelado', type: 'done', color: '#ff0000' });
      expect(done.type).toBe('done');
    });

    it('deve rejeitar type invalido', () => {
      expect(() => TaskStatus.create({ ...validProps, type: 'invalid' as TaskStatusType }))
        .toThrow(InvalidTaskStatusError);
    });

    it('deve distinguir status global (isDefault=true) de customizado', () => {
      const custom = TaskStatus.create(validProps);
      expect(custom.isDefault).toBe(false);

      const defaults = TaskStatus.createDefaults();
      for (const d of defaults) {
        expect(d.isDefault).toBe(true);
      }
    });

    it('deve fazer trim no nome', () => {
      const status = TaskStatus.create({ ...validProps, name: '  Em Review  ' });
      expect(status.name).toBe('Em Review');
    });

    it('deve rejeitar cor vazia', () => {
      expect(() => TaskStatus.create({ ...validProps, color: '' }))
        .toThrow(InvalidTaskStatusError);
    });

    it('deve rejeitar cor com formato invalido', () => {
      expect(() => TaskStatus.create({ ...validProps, color: 'red' }))
        .toThrow(InvalidTaskStatusError);
      expect(() => TaskStatus.create({ ...validProps, color: '#fff' }))
        .toThrow(InvalidTaskStatusError);
    });
  });

  describe('restore', () => {
    it('deve restaurar status sem validacao', () => {
      const status = TaskStatus.restore({
        id: 'status-1',
        name: 'To Do',
        type: 'todo',
        color: '#888888',
        isDefault: true,
      });
      expect(status.id).toBe('status-1');
      expect(status.name).toBe('To Do');
      expect(status.type).toBe('todo');
      expect(status.color).toBe('#888888');
      expect(status.isDefault).toBe(true);
    });
  });

  describe('createDefaults', () => {
    it('deve retornar os 3 status globais fixos', () => {
      const defaults = TaskStatus.createDefaults();
      expect(defaults).toHaveLength(3);

      const todo = defaults.find((s) => s.type === 'todo');
      expect(todo).toBeDefined();
      expect(todo!.name).toBe('To Do');
      expect(todo!.isDefault).toBe(true);

      const inProgress = defaults.find((s) => s.type === 'in_progress');
      expect(inProgress).toBeDefined();
      expect(inProgress!.name).toBe('In Progress');
      expect(inProgress!.isDefault).toBe(true);

      const done = defaults.find((s) => s.type === 'done');
      expect(done).toBeDefined();
      expect(done!.name).toBe('Done');
      expect(done!.isDefault).toBe(true);
    });
  });

  describe('isDone', () => {
    it('deve retornar true quando type e done', () => {
      const status = TaskStatus.create({ name: 'Concluido', type: 'done', color: '#00ff00' });
      expect(status.isDone()).toBe(true);
    });

    it('deve retornar false quando type nao e done', () => {
      const todo = TaskStatus.create({ name: 'Pendente', type: 'todo', color: '#cccccc' });
      expect(todo.isDone()).toBe(false);

      const inProgress = TaskStatus.create({ name: 'Fazendo', type: 'in_progress', color: '#0000ff' });
      expect(inProgress.isDone()).toBe(false);
    });
  });
});
