import { TaskEvent } from '../entities/TaskEvent';
import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    taskId: 'task-1',
    projectId: 'project-1',
    title: 'Finalizar relatório',
    startAt: new Date('2026-03-10T14:00:00Z'),
    endAt: new Date('2026-03-10T15:00:00Z'),
    ...overrides,
  };
}

describe('TaskEvent', () => {
  describe('criação', () => {
    it('deve criar evento vinculado a uma tarefa', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(e.userId).toBe('user-1');
      expect(e.taskId).toBe('task-1');
      expect(e.startAt).toEqual(new Date('2026-03-10T14:00:00Z'));
      expect(e.endAt).toEqual(new Date('2026-03-10T15:00:00Z'));
    });

    it('deve herdar título da tarefa', () => {
      const e = TaskEvent.create(buildValidProps({ title: 'Minha tarefa' }));
      expect(e.title).toBe('Minha tarefa');
    });

    it('deve herdar projectId da tarefa', () => {
      const e = TaskEvent.create(buildValidProps({ projectId: 'proj-99' }));
      expect(e.projectId).toBe('proj-99');
    });

    it('deve permitir projectId null', () => {
      const e = TaskEvent.create(buildValidProps({ projectId: null }));
      expect(e.projectId).toBeNull();
    });

    it('deve ter referência ao taskId de origem', () => {
      const e = TaskEvent.create(buildValidProps({ taskId: 'task-42' }));
      expect(e.taskId).toBe('task-42');
    });

    it('deve iniciar com syncWithGoogle = true', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(e.syncWithGoogle).toBe(true);
    });

    it('deve iniciar com googleTaskId = null', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(e.googleTaskId).toBeNull();
    });

    it('deve iniciar com completedAt = null', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(e.completedAt).toBeNull();
    });

    it('deve permitir endAt null (ponto no tempo)', () => {
      const e = TaskEvent.create(buildValidProps({ endAt: null }));
      expect(e.endAt).toBeNull();
    });

    it('deve rejeitar título vazio', () => {
      expect(() => TaskEvent.create(buildValidProps({ title: '' }))).toThrow(InvalidEventTitleError);
      expect(() => TaskEvent.create(buildValidProps({ title: '   ' }))).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar título com mais de 200 caracteres', () => {
      expect(() => TaskEvent.create(buildValidProps({ title: 'a'.repeat(201) }))).toThrow(
        InvalidEventTitleError,
      );
    });

    it('deve rejeitar endAt antes de startAt', () => {
      expect(() =>
        TaskEvent.create(
          buildValidProps({
            startAt: new Date('2026-03-10T15:00:00Z'),
            endAt: new Date('2026-03-10T14:00:00Z'),
          }),
        ),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve fazer trim no título', () => {
      const e = TaskEvent.create(buildValidProps({ title: '  Tarefa  ' }));
      expect(e.title).toBe('Tarefa');
    });

    it('deve permitir criar com lembretes', () => {
      const reminders = [
        EventReminder.create({ minutesBefore: 10 }),
        EventReminder.create({ minutesBefore: 60 }),
      ];
      const e = TaskEvent.create(buildValidProps({ reminders }));
      expect(e.reminders).toHaveLength(2);
    });

    it('deve iniciar com lembretes vazio por padrão', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(e.reminders).toEqual([]);
    });
  });

  describe('sincronização bidirecional com app', () => {
    it('deve atualizar título quando tarefa é renomeada', () => {
      const e = TaskEvent.create(buildValidProps());
      e.updateTitle('Título atualizado');
      expect(e.title).toBe('Título atualizado');
    });

    it('deve rejeitar título vazio ao atualizar', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(() => e.updateTitle('')).toThrow(InvalidEventTitleError);
    });

    it('deve atualizar horário quando editado pelo calendário', () => {
      const e = TaskEvent.create(buildValidProps());
      const newStart = new Date('2026-03-11T10:00:00Z');
      const newEnd = new Date('2026-03-11T11:00:00Z');
      e.updateTime(newStart, newEnd);
      expect(e.startAt).toEqual(newStart);
      expect(e.endAt).toEqual(newEnd);
    });

    it('deve permitir atualizar horário com endAt null', () => {
      const e = TaskEvent.create(buildValidProps());
      const newStart = new Date('2026-03-11T10:00:00Z');
      e.updateTime(newStart, null);
      expect(e.startAt).toEqual(newStart);
      expect(e.endAt).toBeNull();
    });

    it('deve rejeitar atualização de horário com endAt antes de startAt', () => {
      const e = TaskEvent.create(buildValidProps());
      expect(() =>
        e.updateTime(new Date('2026-03-11T15:00:00Z'), new Date('2026-03-11T14:00:00Z')),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve marcar evento como concluído quando tarefa é concluída', () => {
      const e = TaskEvent.create(buildValidProps());
      e.complete();
      expect(e.completedAt).toBeInstanceOf(Date);
    });

    it('deve permitir desmarcar conclusão', () => {
      const e = TaskEvent.create(buildValidProps());
      e.complete();
      expect(e.completedAt).not.toBeNull();
      e.uncomplete();
      expect(e.completedAt).toBeNull();
    });

    it('deve atualizar updatedAt ao editar', () => {
      const e = TaskEvent.create(buildValidProps());
      const before = e.updatedAt;
      e.updateTitle('Novo');
      expect(e.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('restore', () => {
    it('deve restaurar evento de tarefa do banco', () => {
      const now = new Date();
      const e = TaskEvent.restore({
        id: 'task-event-1',
        userId: 'user-1',
        taskId: 'task-1',
        projectId: 'project-1',
        title: 'Restaurado',
        startAt: now,
        endAt: new Date(now.getTime() + 3600000),
        reminders: [],
        completedAt: null,
        googleTaskId: null,
        syncWithGoogle: true,
        createdAt: now,
        updatedAt: now,
      });
      expect(e.id).toBe('task-event-1');
      expect(e.taskId).toBe('task-1');
      expect(e.title).toBe('Restaurado');
      expect(e.completedAt).toBeNull();
    });

    it('deve restaurar evento com completedAt preenchido', () => {
      const now = new Date();
      const completedAt = new Date('2026-03-09T12:00:00Z');
      const e = TaskEvent.restore({
        id: 'task-event-2',
        userId: 'user-1',
        taskId: 'task-2',
        projectId: null,
        title: 'Concluído',
        startAt: now,
        endAt: null,
        reminders: [],
        completedAt,
        googleTaskId: 'google-123',
        syncWithGoogle: false,
        createdAt: now,
        updatedAt: now,
      });
      expect(e.completedAt).toEqual(completedAt);
      expect(e.googleTaskId).toBe('google-123');
      expect(e.syncWithGoogle).toBe(false);
      expect(e.endAt).toBeNull();
      expect(e.projectId).toBeNull();
    });
  });
});
