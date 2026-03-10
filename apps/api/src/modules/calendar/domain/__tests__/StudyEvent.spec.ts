import { StudyEvent } from '../entities/StudyEvent';
import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

describe('StudyEvent', () => {
  const baseProps = {
    userId: 'user-1',
    studyItemId: 'study-item-1',
    title: 'Estudar TypeScript Avancado',
    startAt: new Date('2026-03-10T09:00:00'),
    endAt: new Date('2026-03-10T11:00:00'),
  };

  describe('criacao', () => {
    it('deve criar evento vinculado a um item de estudo', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.userId).toBe('user-1');
      expect(event.studyItemId).toBe('study-item-1');
    });

    it('deve herdar titulo do item de estudo', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.title).toBe('Estudar TypeScript Avancado');
    });

    it('deve ter horario de inicio e fim', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.startAt).toEqual(new Date('2026-03-10T09:00:00'));
      expect(event.endAt).toEqual(new Date('2026-03-10T11:00:00'));
    });

    it('deve iniciar com syncWithGoogle = true', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.syncWithGoogle).toBe(true);
    });

    it('deve iniciar com googleEventId = null', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.googleEventId).toBeNull();
    });

    it('deve iniciar com reminders vazio por padrao', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.reminders).toEqual([]);
    });

    it('deve aceitar reminders na criacao', () => {
      const reminder = EventReminder.create({ minutesBefore: 15 });
      const event = StudyEvent.create({ ...baseProps, reminders: [reminder] });

      expect(event.reminders).toHaveLength(1);
      expect(event.reminders[0].minutesBefore).toBe(15);
    });

    it('deve definir createdAt e updatedAt na criacao', () => {
      const before = new Date();
      const event = StudyEvent.create(baseProps);
      const after = new Date();

      expect(event.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(event.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve ter id vazio na criacao', () => {
      const event = StudyEvent.create(baseProps);

      expect(event.id).toBe('');
    });
  });

  describe('validacao', () => {
    it('deve rejeitar titulo vazio', () => {
      expect(() =>
        StudyEvent.create({ ...baseProps, title: '' }),
      ).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar titulo so com espacos', () => {
      expect(() =>
        StudyEvent.create({ ...baseProps, title: '   ' }),
      ).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar endAt antes de startAt', () => {
      expect(() =>
        StudyEvent.create({
          ...baseProps,
          startAt: new Date('2026-03-10T11:00:00'),
          endAt: new Date('2026-03-10T09:00:00'),
        }),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve rejeitar endAt igual a startAt', () => {
      const same = new Date('2026-03-10T09:00:00');
      expect(() =>
        StudyEvent.create({
          ...baseProps,
          startAt: same,
          endAt: same,
        }),
      ).toThrow(InvalidEventTimeRangeError);
    });
  });

  describe('restore', () => {
    it('deve restaurar evento com todos os campos', () => {
      const reminder = EventReminder.create({ minutesBefore: 30 });
      const event = StudyEvent.restore({
        id: 'event-1',
        userId: 'user-1',
        studyItemId: 'study-item-1',
        title: 'Estudar TypeScript Avancado',
        startAt: new Date('2026-03-10T09:00:00'),
        endAt: new Date('2026-03-10T11:00:00'),
        reminders: [reminder],
        googleEventId: 'google-123',
        syncWithGoogle: false,
        createdAt: new Date('2026-03-01T00:00:00'),
        updatedAt: new Date('2026-03-05T00:00:00'),
      });

      expect(event.id).toBe('event-1');
      expect(event.userId).toBe('user-1');
      expect(event.studyItemId).toBe('study-item-1');
      expect(event.title).toBe('Estudar TypeScript Avancado');
      expect(event.googleEventId).toBe('google-123');
      expect(event.syncWithGoogle).toBe(false);
      expect(event.reminders).toHaveLength(1);
      expect(event.createdAt).toEqual(new Date('2026-03-01T00:00:00'));
      expect(event.updatedAt).toEqual(new Date('2026-03-05T00:00:00'));
    });
  });

  describe('sincronizacao bidirecional com app', () => {
    it('deve atualizar quando editado pelo calendario', () => {
      const event = StudyEvent.create(baseProps);
      const oldUpdatedAt = event.updatedAt;

      event.updateTitle('Novo Titulo');
      expect(event.title).toBe('Novo Titulo');
      expect(event.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('mutations', () => {
    it('updateTitle deve validar titulo', () => {
      const event = StudyEvent.create(baseProps);

      expect(() => event.updateTitle('')).toThrow(InvalidEventTitleError);
    });

    it('updateTitle deve fazer trim no titulo', () => {
      const event = StudyEvent.create(baseProps);
      event.updateTitle('  Novo Titulo  ');

      expect(event.title).toBe('Novo Titulo');
    });

    it('updateTime deve atualizar horarios', () => {
      const event = StudyEvent.create(baseProps);
      const newStart = new Date('2026-03-10T14:00:00');
      const newEnd = new Date('2026-03-10T16:00:00');

      event.updateTime(newStart, newEnd);

      expect(event.startAt).toEqual(newStart);
      expect(event.endAt).toEqual(newEnd);
    });

    it('updateTime deve validar time range', () => {
      const event = StudyEvent.create(baseProps);

      expect(() =>
        event.updateTime(
          new Date('2026-03-10T16:00:00'),
          new Date('2026-03-10T14:00:00'),
        ),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('updateTime deve atualizar updatedAt', () => {
      const event = StudyEvent.create(baseProps);
      const oldUpdatedAt = event.updatedAt;

      event.updateTime(
        new Date('2026-03-10T14:00:00'),
        new Date('2026-03-10T16:00:00'),
      );

      expect(event.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });
});
