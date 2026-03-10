import { TaskReminder } from '../entities/TaskReminder';
import { InvalidTaskReminderError } from '../errors/TaskErrors';

describe('TaskReminder', () => {
  const futureDate = (): Date => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  };

  const pastDate = (): Date => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return d;
  };

  describe('criacao', () => {
    it('deve criar lembrete com data/hora futura', () => {
      const remindAt = futureDate();
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt,
      });

      expect(reminder.taskId).toBe('task-1');
      expect(reminder.remindAt).toEqual(remindAt);
      expect(reminder.id).toBe('');
      expect(reminder.createdAt).toBeInstanceOf(Date);
    });

    it('deve rejeitar data/hora no passado', () => {
      expect(() =>
        TaskReminder.create({
          taskId: 'task-1',
          remindAt: pastDate(),
        }),
      ).toThrow(InvalidTaskReminderError);
    });

    it('deve vincular a tarefa', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-abc-123',
        remindAt: futureDate(),
      });

      expect(reminder.taskId).toBe('task-abc-123');
    });

    it('deve criar com syncsToCalendar = true por padrao', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
      });

      expect(reminder.syncsToCalendar).toBe(true);
    });
  });

  describe('sincronizacao com calendario', () => {
    it('deve iniciar com calendarEventId null quando syncsToCalendar = true', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
        syncsToCalendar: true,
      });

      expect(reminder.syncsToCalendar).toBe(true);
      expect(reminder.calendarEventId).toBeNull();
    });

    it('deve iniciar com calendarEventId null quando syncsToCalendar = false', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
        syncsToCalendar: false,
      });

      expect(reminder.syncsToCalendar).toBe(false);
      expect(reminder.calendarEventId).toBeNull();
    });

    it('deve permitir definir calendarEventId via setCalendarEventId', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
        syncsToCalendar: true,
      });

      reminder.setCalendarEventId('cal-event-123');
      expect(reminder.calendarEventId).toBe('cal-event-123');
    });

    it('deve limpar calendarEventId via clearCalendarEventId', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
        syncsToCalendar: true,
      });

      reminder.setCalendarEventId('cal-event-123');
      expect(reminder.calendarEventId).toBe('cal-event-123');

      reminder.clearCalendarEventId();
      expect(reminder.calendarEventId).toBeNull();
    });
  });

  describe('updateRemindAt', () => {
    it('deve atualizar remindAt com data futura', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
      });

      const newDate = new Date();
      newDate.setHours(newDate.getHours() + 2);

      reminder.updateRemindAt(newDate);
      expect(reminder.remindAt).toEqual(newDate);
    });

    it('deve rejeitar atualizacao com data no passado', () => {
      const reminder = TaskReminder.create({
        taskId: 'task-1',
        remindAt: futureDate(),
      });

      expect(() => reminder.updateRemindAt(pastDate())).toThrow(
        InvalidTaskReminderError,
      );
    });
  });

  describe('exclusao', () => {
    it('deve limpar referencia do calendario ao chamar clearCalendarEventId', () => {
      const restored = TaskReminder.restore({
        id: 'rem-1',
        taskId: 'task-1',
        remindAt: futureDate(),
        syncsToCalendar: true,
        calendarEventId: 'cal-event-456',
        createdAt: new Date(),
      });

      expect(restored.calendarEventId).toBe('cal-event-456');

      restored.clearCalendarEventId();
      expect(restored.calendarEventId).toBeNull();
    });
  });

  describe('restore', () => {
    it('deve restaurar lembrete sem validacao', () => {
      const past = pastDate();
      const createdAt = new Date('2025-01-01');

      const restored = TaskReminder.restore({
        id: 'rem-1',
        taskId: 'task-1',
        remindAt: past,
        syncsToCalendar: false,
        calendarEventId: 'cal-xyz',
        createdAt,
      });

      expect(restored.id).toBe('rem-1');
      expect(restored.taskId).toBe('task-1');
      expect(restored.remindAt).toEqual(past);
      expect(restored.syncsToCalendar).toBe(false);
      expect(restored.calendarEventId).toBe('cal-xyz');
      expect(restored.createdAt).toEqual(createdAt);
    });

    it('deve restaurar com calendarEventId null', () => {
      const restored = TaskReminder.restore({
        id: 'rem-2',
        taskId: 'task-2',
        remindAt: futureDate(),
        syncsToCalendar: true,
        calendarEventId: null,
        createdAt: new Date(),
      });

      expect(restored.calendarEventId).toBeNull();
    });
  });
});
