import { Meeting } from '../entities/Meeting';
import { Participant } from '../value-objects/Participant';
import { Recurrence } from '../value-objects/Recurrence';
import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
  InvalidParticipantNameError,
} from '../errors/CalendarErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    title: 'Reunião semanal',
    startAt: new Date('2026-03-10T14:00:00Z'),
    endAt: new Date('2026-03-10T15:00:00Z'),
    ...overrides,
  };
}

describe('Meeting', () => {
  describe('criação', () => {
    it('deve criar reunião com título, início e fim obrigatórios', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.userId).toBe('user-1');
      expect(m.title).toBe('Reunião semanal');
      expect(m.startAt).toEqual(new Date('2026-03-10T14:00:00Z'));
      expect(m.endAt).toEqual(new Date('2026-03-10T15:00:00Z'));
    });

    it('deve rejeitar título vazio', () => {
      expect(() => Meeting.create(buildValidProps({ title: '' }))).toThrow(InvalidEventTitleError);
      expect(() => Meeting.create(buildValidProps({ title: '   ' }))).toThrow(InvalidEventTitleError);
    });

    it('deve rejeitar título com mais de 200 caracteres', () => {
      expect(() => Meeting.create(buildValidProps({ title: 'a'.repeat(201) }))).toThrow(
        InvalidEventTitleError,
      );
    });

    it('deve rejeitar endAt antes de startAt', () => {
      expect(() =>
        Meeting.create(
          buildValidProps({
            startAt: new Date('2026-03-10T15:00:00Z'),
            endAt: new Date('2026-03-10T14:00:00Z'),
          }),
        ),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve permitir criar como all-day', () => {
      const m = Meeting.create(buildValidProps({ isAllDay: true }));
      expect(m.isAllDay).toBe(true);
    });

    it('deve iniciar com status "scheduled"', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.status).toBe('scheduled');
    });

    it('deve permitir criar sem participantes, local e agenda', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.participants).toEqual([]);
      expect(m.location).toBeNull();
      expect(m.agenda).toBeNull();
    });

    it('deve permitir criar sem recorrência', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.recurrence).toBeNull();
    });

    it('deve permitir criar com múltiplos lembretes', () => {
      const reminders = [
        EventReminder.create({ minutesBefore: 10 }),
        EventReminder.create({ minutesBefore: 60 }),
      ];
      const m = Meeting.create(buildValidProps({ reminders }));
      expect(m.reminders).toHaveLength(2);
    });

    it('deve iniciar com syncWithGoogle = true', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.syncWithGoogle).toBe(true);
    });

    it('deve iniciar com googleEventId = null', () => {
      const m = Meeting.create(buildValidProps());
      expect(m.googleEventId).toBeNull();
    });

    it('deve fazer trim no título', () => {
      const m = Meeting.create(buildValidProps({ title: '  Reunião  ' }));
      expect(m.title).toBe('Reunião');
    });
  });

  describe('edição', () => {
    it('deve atualizar título e descrição', () => {
      const m = Meeting.create(buildValidProps());
      m.updateTitle('Novo título');
      m.updateDescription('Descrição nova');
      expect(m.title).toBe('Novo título');
      expect(m.description).toBe('Descrição nova');
    });

    it('deve atualizar horários (startAt e endAt)', () => {
      const m = Meeting.create(buildValidProps());
      const newStart = new Date('2026-03-11T10:00:00Z');
      const newEnd = new Date('2026-03-11T11:00:00Z');
      m.updateTime(newStart, newEnd);
      expect(m.startAt).toEqual(newStart);
      expect(m.endAt).toEqual(newEnd);
    });

    it('deve rejeitar atualização de horário com endAt antes de startAt', () => {
      const m = Meeting.create(buildValidProps());
      expect(() =>
        m.updateTime(new Date('2026-03-11T15:00:00Z'), new Date('2026-03-11T14:00:00Z')),
      ).toThrow(InvalidEventTimeRangeError);
    });

    it('deve atualizar local e link de conferência', () => {
      const m = Meeting.create(buildValidProps());
      m.updateLocation('Sala 3');
      m.updateConferenceLink('https://meet.google.com/abc');
      expect(m.location).toBe('Sala 3');
      expect(m.conferenceLink).toBe('https://meet.google.com/abc');
    });

    it('deve atualizar agenda (pauta)', () => {
      const m = Meeting.create(buildValidProps());
      m.updateAgenda('1. Sprint review\n2. Retro');
      expect(m.agenda).toBe('1. Sprint review\n2. Retro');
    });

    it('deve adicionar/editar notas da reunião (ata)', () => {
      const m = Meeting.create(buildValidProps());
      m.updateMeetingNotes('Decisões tomadas...');
      expect(m.meetingNotes).toBe('Decisões tomadas...');
    });

    it('deve atualizar recorrência', () => {
      const m = Meeting.create(buildValidProps());
      const recurrence = Recurrence.create({ type: 'weekly', interval: 1, daysOfWeek: [1], endType: 'never' });
      m.updateRecurrence(recurrence);
      expect(m.recurrence).not.toBeNull();
      expect(m.recurrence!.type).toBe('weekly');
    });

    it('deve remover recorrência (setar null)', () => {
      const recurrence = Recurrence.create({ type: 'daily', interval: 1, endType: 'never' });
      const m = Meeting.create(buildValidProps({ recurrence }));
      m.updateRecurrence(null);
      expect(m.recurrence).toBeNull();
    });

    it('deve atualizar updatedAt ao editar', () => {
      const m = Meeting.create(buildValidProps());
      const before = m.updatedAt;
      m.updateTitle('Atualizado');
      expect(m.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('participantes', () => {
    it('deve adicionar participante com nome', () => {
      const m = Meeting.create(buildValidProps());
      m.addParticipant('João');
      expect(m.participants).toHaveLength(1);
      expect(m.participants[0].name).toBe('João');
    });

    it('deve adicionar participante com nome e email', () => {
      const m = Meeting.create(buildValidProps());
      m.addParticipant('João', 'joao@email.com');
      expect(m.participants[0].email).toBe('joao@email.com');
    });

    it('deve remover participante', () => {
      const m = Meeting.create(buildValidProps());
      m.addParticipant('João');
      m.addParticipant('Maria');
      m.removeParticipant(0);
      expect(m.participants).toHaveLength(1);
      expect(m.participants[0].name).toBe('Maria');
    });

    it('deve rejeitar participante com nome vazio', () => {
      const m = Meeting.create(buildValidProps());
      expect(() => m.addParticipant('')).toThrow(InvalidParticipantNameError);
    });

    it('deve iniciar participante com status "pending"', () => {
      const m = Meeting.create(buildValidProps());
      m.addParticipant('João');
      expect(m.participants[0].status).toBe('pending');
    });
  });

  describe('cancelamento', () => {
    it('deve cancelar reunião (status "cancelled")', () => {
      const m = Meeting.create(buildValidProps());
      m.cancel();
      expect(m.status).toBe('cancelled');
    });

    it('deve permitir reativar reunião cancelada', () => {
      const m = Meeting.create(buildValidProps());
      m.cancel();
      m.reactivate();
      expect(m.status).toBe('scheduled');
    });
  });

  describe('lembretes', () => {
    it('deve adicionar múltiplos lembretes', () => {
      const m = Meeting.create(buildValidProps());
      m.addReminder(10);
      m.addReminder(60);
      expect(m.reminders).toHaveLength(2);
    });

    it('deve remover lembrete', () => {
      const m = Meeting.create(buildValidProps());
      m.addReminder(10);
      m.addReminder(60);
      // Após sort: [60, 10]. Removendo index 0 (60), resta [10].
      m.removeReminder(0);
      expect(m.reminders).toHaveLength(1);
      expect(m.reminders[0].minutesBefore).toBe(10);
    });

    it('deve ordenar lembretes por minutesBefore (maior primeiro)', () => {
      const m = Meeting.create(buildValidProps());
      m.addReminder(10);
      m.addReminder(1440);
      m.addReminder(60);
      const minutes = m.reminders.map((r) => r.minutesBefore);
      expect(minutes).toEqual([1440, 60, 10]);
    });
  });

  describe('restore', () => {
    it('deve restaurar reunião do banco', () => {
      const now = new Date();
      const m = Meeting.restore({
        id: 'meeting-1',
        userId: 'user-1',
        title: 'Restaurada',
        description: null,
        startAt: now,
        endAt: new Date(now.getTime() + 3600000),
        isAllDay: false,
        location: null,
        conferenceLink: null,
        participants: [],
        agenda: null,
        meetingNotes: null,
        recurrence: null,
        reminders: [],
        status: 'scheduled',
        color: null,
        googleEventId: null,
        syncWithGoogle: true,
        createdAt: now,
        updatedAt: now,
      });
      expect(m.id).toBe('meeting-1');
      expect(m.title).toBe('Restaurada');
    });
  });
});
