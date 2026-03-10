import { EventReminder } from '../value-objects/EventReminder';
import { InvalidReminderMinutesError } from '../errors/CalendarErrors';

describe('EventReminder', () => {
  it('deve criar lembrete com minutesBefore válido', () => {
    const reminder = EventReminder.create({ minutesBefore: 30 });
    expect(reminder.minutesBefore).toBe(30);
    expect(reminder.type).toBe('push');
  });

  it('deve rejeitar minutesBefore negativo', () => {
    expect(() => EventReminder.create({ minutesBefore: -1 })).toThrow(
      InvalidReminderMinutesError,
    );
  });

  it('deve aceitar 0 (lembrete no momento do evento)', () => {
    const reminder = EventReminder.create({ minutesBefore: 0 });
    expect(reminder.minutesBefore).toBe(0);
  });

  it('deve aceitar valores grandes (ex: 1440 = 1 dia antes)', () => {
    const reminder = EventReminder.create({ minutesBefore: 1440 });
    expect(reminder.minutesBefore).toBe(1440);
  });
});
