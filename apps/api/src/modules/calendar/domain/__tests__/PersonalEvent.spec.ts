import { PersonalEvent } from '../entities/PersonalEvent';
import { Recurrence } from '../value-objects/Recurrence';
import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    title: 'Consulta dentista',
    startAt: new Date('2026-03-10T14:00:00Z'),
    endAt: new Date('2026-03-10T15:00:00Z'),
    ...overrides,
  };
}

describe('PersonalEvent', () => {
  describe('criação', () => {
    it('deve criar evento com título, início e fim obrigatórios', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.userId).toBe('user-1');
      expect(e.title).toBe('Consulta dentista');
      expect(e.startAt).toEqual(new Date('2026-03-10T14:00:00Z'));
      expect(e.endAt).toEqual(new Date('2026-03-10T15:00:00Z'));
    });

    it('deve rejeitar título vazio', () => {
      expect(() => PersonalEvent.create(buildValidProps({ title: '' }))).toThrow(InvalidEventTitleError);
      expect(() => PersonalEvent.create(buildValidProps({ title: '   ' }))).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar endAt antes de startAt', () => {
      expect(() =>
        PersonalEvent.create(
          buildValidProps({
            startAt: new Date('2026-03-10T15:00:00Z'),
            endAt: new Date('2026-03-10T14:00:00Z'),
          }),
        ),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve permitir criar como all-day', () => {
      const e = PersonalEvent.create(buildValidProps({ isAllDay: true }));
      expect(e.isAllDay).toBe(true);
    });

    it('deve permitir criar com recorrência', () => {
      const recurrence = Recurrence.create({
        type: 'daily',
        interval: 1,
        endType: 'never',
      });
      const e = PersonalEvent.create(buildValidProps({ recurrence }));
      expect(e.recurrence).toBeDefined();
      expect(e.recurrence!.type).toBe('daily');
    });

    it('deve permitir criar com múltiplos lembretes', () => {
      const reminders = [
        EventReminder.create({ minutesBefore: 30 }),
        EventReminder.create({ minutesBefore: 10 }),
      ];
      const e = PersonalEvent.create(buildValidProps({ reminders }));
      expect(e.reminders).toHaveLength(2);
    });

    it('deve permitir criar sem local', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.location).toBeNull();
    });

    it('deve iniciar com syncWithGoogle = true', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.syncWithGoogle).toBe(true);
    });

    it('deve iniciar com googleEventId = null', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.googleEventId).toBeNull();
    });
  });

  describe('edição', () => {
    it('deve atualizar título, descrição e local', () => {
      const e = PersonalEvent.create(buildValidProps());
      const before = e.updatedAt;

      e.updateTitle('Novo título');
      expect(e.title).toBe('Novo título');
      expect(e.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());

      e.updateDescription('Uma descrição');
      expect(e.description).toBe('Uma descrição');

      e.updateLocation('Av. Paulista, 1000');
      expect(e.location).toBe('Av. Paulista, 1000');
    });

    it('deve atualizar horários', () => {
      const e = PersonalEvent.create(buildValidProps());
      const newStart = new Date('2026-04-01T10:00:00Z');
      const newEnd = new Date('2026-04-01T11:00:00Z');

      e.updateTime(newStart, newEnd);
      expect(e.startAt).toEqual(newStart);
      expect(e.endAt).toEqual(newEnd);
    });

    it('deve atualizar recorrência', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.recurrence).toBeNull();

      const recurrence = Recurrence.create({
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5],
        endType: 'never',
      });
      e.updateRecurrence(recurrence);
      expect(e.recurrence).toBeDefined();
      expect(e.recurrence!.type).toBe('weekly');

      e.updateRecurrence(null);
      expect(e.recurrence).toBeNull();
    });

    it('deve atualizar lembretes', () => {
      const e = PersonalEvent.create(buildValidProps());
      expect(e.reminders).toHaveLength(0);

      e.addReminder(15);
      expect(e.reminders).toHaveLength(1);
      expect(e.reminders[0].minutesBefore).toBe(15);

      e.addReminder(60);
      expect(e.reminders).toHaveLength(2);
      // should be sorted descending by minutesBefore
      expect(e.reminders[0].minutesBefore).toBe(60);
      expect(e.reminders[1].minutesBefore).toBe(15);

      e.removeReminder(0);
      expect(e.reminders).toHaveLength(1);
      expect(e.reminders[0].minutesBefore).toBe(15);
    });
  });
});
