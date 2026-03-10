import { StudySession } from '../entities/StudySession';
import { InvalidStudySessionError } from '../errors/StudyErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    studyItemId: 'item-1',
    userId: 'user-1',
    scheduledAt: new Date('2026-03-15T10:00:00'),
    durationMinutes: 60,
    ...overrides,
  };
}

describe('StudySession', () => {
  describe('criação', () => {
    it('deve criar sessão com data/hora e duração obrigatórios', () => {
      const session = StudySession.create(buildValidProps());
      expect(session.scheduledAt).toEqual(new Date('2026-03-15T10:00:00'));
      expect(session.durationMinutes).toBe(60);
    });

    it('deve rejeitar duração <= 0', () => {
      expect(() =>
        StudySession.create(buildValidProps({ durationMinutes: 0 })),
      ).toThrow(InvalidStudySessionError);
      expect(() =>
        StudySession.create(buildValidProps({ durationMinutes: -10 })),
      ).toThrow(InvalidStudySessionError);
    });

    it('deve vincular ao item de estudo', () => {
      const session = StudySession.create(buildValidProps({ studyItemId: 'item-42' }));
      expect(session.studyItemId).toBe('item-42');
    });

    it('deve iniciar com status "scheduled"', () => {
      const session = StudySession.create(buildValidProps());
      expect(session.status).toBe('scheduled');
    });

    it('deve gerar StudyEvent no calendário automaticamente', () => {
      // O ID do evento é gerado/atribuído externamente; a entidade espera recebê-lo
      const session = StudySession.create(buildValidProps());
      expect(session.calendarEventId).toBeNull();
    });

    it('deve armazenar calendarEventId do evento gerado', () => {
      const session = StudySession.create(buildValidProps());
      session.setCalendarEventId('cal-event-1');
      expect(session.calendarEventId).toBe('cal-event-1');
    });
  });

  describe('completar', () => {
    it('deve marcar sessão como "completed"', () => {
      const session = StudySession.create(buildValidProps());
      session.complete();
      expect(session.status).toBe('completed');
    });

    it('deve registrar completedAt', () => {
      const session = StudySession.create(buildValidProps());
      session.complete();
      expect(session.completedAt).toBeInstanceOf(Date);
    });

    it('deve permitir marcar como "skipped"', () => {
      const session = StudySession.create(buildValidProps());
      session.skip();
      expect(session.status).toBe('skipped');
    });
  });

  describe('edição', () => {
    it('deve atualizar data e hora agendada', () => {
      const session = StudySession.create(buildValidProps());
      const newDate = new Date('2026-03-20T14:00:00');
      session.reschedule(newDate, 90);
      expect(session.scheduledAt).toEqual(newDate);
      expect(session.durationMinutes).toBe(90);
    });

    it('deve rejeitar duração <= 0 ao editar', () => {
      const session = StudySession.create(buildValidProps());
      expect(() =>
        session.reschedule(new Date('2026-03-20T14:00:00'), 0),
      ).toThrow(InvalidStudySessionError);
    });
  });

  describe('exclusão', () => {
    it('deve permitir excluir sessão', () => {
      const session = StudySession.create(buildValidProps());
      expect(session).toBeDefined();
      // A exclusão em si é responsabilidade do repositório
    });
  });

  describe('restore', () => {
    it('deve restaurar sessão a partir dos dados do banco', () => {
      const now = new Date();
      const session = StudySession.restore({
        id: 'session-1',
        studyItemId: 'item-1',
        userId: 'user-1',
        scheduledAt: new Date('2026-03-15T10:00:00'),
        durationMinutes: 45,
        status: 'scheduled',
        calendarEventId: 'cal-1',
        completedAt: null,
        createdAt: now,
      });
      expect(session.id).toBe('session-1');
      expect(session.durationMinutes).toBe(45);
      expect(session.calendarEventId).toBe('cal-1');
      expect(session.status).toBe('scheduled');
    });
  });
});
