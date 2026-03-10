import { HabitEvent } from '../entities/HabitEvent';
import {
  InvalidEventTitleError,
  InvalidTimeFormatError,
  InvalidDaysOfWeekError,
} from '../errors/CalendarErrors';

describe('HabitEvent', () => {
  const validProps = {
    userId: 'user-1',
    habitId: 'habit-1',
    title: 'Meditar',
    time: '08:00',
    daysOfWeek: [1, 2, 3, 4, 5],
  };

  describe('criação', () => {
    it('deve criar evento vinculado a um hábito', () => {
      const event = HabitEvent.create(validProps);

      expect(event.userId).toBe('user-1');
      expect(event.habitId).toBe('habit-1');
      expect(event.id).toBe('');
      expect(event.createdAt).toBeInstanceOf(Date);
      expect(event.updatedAt).toBeInstanceOf(Date);
    });

    it('deve herdar título do hábito', () => {
      const event = HabitEvent.create(validProps);
      expect(event.title).toBe('Meditar');
    });

    it('deve gerar ocorrências baseado na frequência do hábito', () => {
      const event = HabitEvent.create({
        ...validProps,
        daysOfWeek: [1, 3, 5],
      });
      expect(event.daysOfWeek).toEqual([1, 3, 5]);
    });

    it('deve respeitar dias da semana do hábito', () => {
      const event = HabitEvent.create({
        ...validProps,
        daysOfWeek: [0, 6],
      });
      expect(event.daysOfWeek).toEqual([0, 6]);
    });

    it('não deve ter campos de sincronização Google', () => {
      const event = HabitEvent.create(validProps);
      // HabitEvent is local-only, no googleEventId or syncWithGoogle
      expect((event as any)._googleEventId).toBeUndefined();
      expect((event as any)._syncWithGoogle).toBeUndefined();
    });
  });

  describe('validação', () => {
    it('deve rejeitar título vazio', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, title: '' }),
      ).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar título com apenas espaços', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, title: '   ' }),
      ).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar horário em formato inválido', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, time: '25:00' }),
      ).toThrow(InvalidTimeFormatError);
    });

    it('deve rejeitar horário com minutos inválidos', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, time: '08:60' }),
      ).toThrow(InvalidTimeFormatError);
    });

    it('deve rejeitar horário sem formato HH:mm', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, time: '8:00' }),
      ).toThrow(InvalidTimeFormatError);
    });

    it('deve rejeitar horário com texto aleatório', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, time: 'abc' }),
      ).toThrow(InvalidTimeFormatError);
    });

    it('deve rejeitar daysOfWeek vazio', () => {
      expect(() =>
        HabitEvent.create({ ...validProps, daysOfWeek: [] }),
      ).toThrow(InvalidDaysOfWeekError);
    });

    it('deve aceitar horário válido 00:00', () => {
      const event = HabitEvent.create({ ...validProps, time: '00:00' });
      expect(event.time).toBe('00:00');
    });

    it('deve aceitar horário válido 23:59', () => {
      const event = HabitEvent.create({ ...validProps, time: '23:59' });
      expect(event.time).toBe('23:59');
    });
  });

  describe('restore', () => {
    it('deve restaurar entidade a partir de dados persistidos', () => {
      const now = new Date();
      const event = HabitEvent.restore({
        id: 'event-1',
        userId: 'user-1',
        habitId: 'habit-1',
        title: 'Meditar',
        time: '08:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        createdAt: now,
        updatedAt: now,
      });

      expect(event.id).toBe('event-1');
      expect(event.userId).toBe('user-1');
      expect(event.habitId).toBe('habit-1');
      expect(event.title).toBe('Meditar');
      expect(event.time).toBe('08:00');
      expect(event.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
      expect(event.createdAt).toBe(now);
      expect(event.updatedAt).toBe(now);
    });

    it('deve retornar cópia defensiva de daysOfWeek', () => {
      const now = new Date();
      const event = HabitEvent.restore({
        id: 'event-1',
        userId: 'user-1',
        habitId: 'habit-1',
        title: 'Meditar',
        time: '08:00',
        daysOfWeek: [1, 2, 3],
        createdAt: now,
        updatedAt: now,
      });

      const days = event.daysOfWeek;
      days.push(4);
      expect(event.daysOfWeek).toEqual([1, 2, 3]);
    });
  });

  describe('sincronização bidirecional com app', () => {
    it('deve atualizar quando hábito muda de frequência', () => {
      const event = HabitEvent.create(validProps);
      const beforeUpdate = event.updatedAt;

      event.updateDaysOfWeek([0, 6]);

      expect(event.daysOfWeek).toEqual([0, 6]);
      expect(event.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('deve atualizar quando lembrete do hábito muda de horário', () => {
      const event = HabitEvent.create(validProps);
      const beforeUpdate = event.updatedAt;

      event.updateTime('19:30');

      expect(event.time).toBe('19:30');
      expect(event.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe('mutations', () => {
    it('deve atualizar título', () => {
      const event = HabitEvent.create(validProps);
      event.updateTitle('Exercício');

      expect(event.title).toBe('Exercício');
    });

    it('deve rejeitar título vazio na atualização', () => {
      const event = HabitEvent.create(validProps);
      expect(() => event.updateTitle('')).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar horário inválido na atualização', () => {
      const event = HabitEvent.create(validProps);
      expect(() => event.updateTime('99:99')).toThrow(InvalidTimeFormatError);
    });

    it('deve rejeitar daysOfWeek vazio na atualização', () => {
      const event = HabitEvent.create(validProps);
      expect(() => event.updateDaysOfWeek([])).toThrow(InvalidDaysOfWeekError);
    });

    it('deve fazer trim no título', () => {
      const event = HabitEvent.create(validProps);
      event.updateTitle('  Leitura  ');
      expect(event.title).toBe('Leitura');
    });
  });
});
