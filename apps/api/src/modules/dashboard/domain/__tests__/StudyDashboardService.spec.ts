import { StudyDashboardService } from '../services/StudyDashboardService';
import { StudyItemInput, StudySessionInput } from '../inputs/StudyInput';
import { StudyOverview } from '../value-objects/StudyOverview';

function buildItem(overrides: Partial<StudyItemInput> = {}): StudyItemInput {
  return {
    id: 'i1',
    title: 'Item',
    status: 'in_progress',
    progressPercentage: 50,
    rating: null,
    completedAt: null,
    ...overrides,
  };
}

function buildSession(
  overrides: Partial<StudySessionInput> = {},
): StudySessionInput {
  return {
    id: 's1',
    studyItemId: 'i1',
    status: 'completed',
    durationMinutes: 60,
    scheduledAt: new Date(2026, 0, 15),
    completedAt: new Date(2026, 0, 15),
    ...overrides,
  };
}

describe('StudyOverview', () => {
  it('deve criar com dados válidos e expor getters', () => {
    const overview = StudyOverview.create({
      inProgress: 3,
      backlogCount: 5,
      completedInPeriod: 2,
      sessionCompletionRate: 75,
      totalStudyMinutes: 120,
      averageRating: 4.5,
    });

    expect(overview.inProgress).toBe(3);
    expect(overview.backlogCount).toBe(5);
    expect(overview.completedInPeriod).toBe(2);
    expect(overview.sessionCompletionRate).toBe(75);
    expect(overview.totalStudyMinutes).toBe(120);
    expect(overview.averageRating).toBe(4.5);
  });

  it('deve aceitar averageRating null', () => {
    const overview = StudyOverview.create({
      inProgress: 0,
      backlogCount: 0,
      completedInPeriod: 0,
      sessionCompletionRate: 0,
      totalStudyMinutes: 0,
      averageRating: null,
    });

    expect(overview.averageRating).toBeNull();
  });

  it('deve serializar com toJSON', () => {
    const data = {
      inProgress: 2,
      backlogCount: 4,
      completedInPeriod: 1,
      sessionCompletionRate: 80,
      totalStudyMinutes: 90,
      averageRating: 3.5,
    };

    const overview = StudyOverview.create(data);

    expect(overview.toJSON()).toEqual(data);
  });
});

describe('StudyDashboardService', () => {
  const periodStart = new Date(2026, 0, 1); // 2026-01-01
  const periodEnd = new Date(2026, 0, 31); // 2026-01-31

  describe('computeOverview', () => {
    it('deve contar itens em progresso corretamente', () => {
      const items = [
        buildItem({ id: 'i1', status: 'in_progress' }),
        buildItem({ id: 'i2', status: 'in_progress' }),
        buildItem({ id: 'i3', status: 'backlog' }),
        buildItem({ id: 'i4', status: 'completed', completedAt: new Date(2026, 0, 10) }),
        buildItem({ id: 'i5', status: 'dropped' }),
      ];

      const overview = StudyDashboardService.computeOverview(
        items, [], periodStart, periodEnd,
      );

      expect(overview.inProgress).toBe(2);
    });

    it('deve contar itens no backlog corretamente', () => {
      const items = [
        buildItem({ id: 'i1', status: 'backlog' }),
        buildItem({ id: 'i2', status: 'backlog' }),
        buildItem({ id: 'i3', status: 'backlog' }),
        buildItem({ id: 'i4', status: 'in_progress' }),
      ];

      const overview = StudyDashboardService.computeOverview(
        items, [], periodStart, periodEnd,
      );

      expect(overview.backlogCount).toBe(3);
    });

    it('deve contar completados apenas dentro do período', () => {
      const items = [
        buildItem({ id: 'i1', status: 'completed', completedAt: new Date(2026, 0, 10) }), // dentro
        buildItem({ id: 'i2', status: 'completed', completedAt: new Date(2026, 0, 31) }), // dentro (borda)
        buildItem({ id: 'i3', status: 'completed', completedAt: new Date(2026, 0, 1) }),  // dentro (borda)
        buildItem({ id: 'i4', status: 'completed', completedAt: new Date(2025, 11, 31) }), // fora (antes)
        buildItem({ id: 'i5', status: 'completed', completedAt: new Date(2026, 1, 1) }),  // fora (depois)
        buildItem({ id: 'i6', status: 'in_progress' }), // não completado
      ];

      const overview = StudyDashboardService.computeOverview(
        items, [], periodStart, periodEnd,
      );

      expect(overview.completedInPeriod).toBe(3);
    });

    it('deve retornar sessionCompletionRate 0 quando não há sessões no período', () => {
      const overview = StudyDashboardService.computeOverview(
        [], [], periodStart, periodEnd,
      );

      expect(overview.sessionCompletionRate).toBe(0);
    });

    it('deve calcular sessionCompletionRate corretamente', () => {
      const sessions = [
        buildSession({ id: 's1', status: 'completed', scheduledAt: new Date(2026, 0, 10) }),
        buildSession({ id: 's2', status: 'completed', scheduledAt: new Date(2026, 0, 15) }),
        buildSession({ id: 's3', status: 'scheduled', scheduledAt: new Date(2026, 0, 20) }),
        buildSession({ id: 's4', status: 'skipped', scheduledAt: new Date(2026, 0, 25) }), // ignorado
      ];

      // 2 completed / 3 non-skipped = 66.67%
      const overview = StudyDashboardService.computeOverview(
        [], sessions, periodStart, periodEnd,
      );

      expect(overview.sessionCompletionRate).toBeCloseTo(66.67, 1);
    });

    it('deve ignorar sessões fora do período para sessionCompletionRate', () => {
      const sessions = [
        buildSession({ id: 's1', status: 'completed', scheduledAt: new Date(2026, 0, 10) }), // dentro
        buildSession({ id: 's2', status: 'scheduled', scheduledAt: new Date(2026, 0, 20) }), // dentro
        buildSession({ id: 's3', status: 'completed', scheduledAt: new Date(2025, 11, 15) }), // fora
      ];

      // dentro do período: 1 completed / 2 non-skipped = 50%
      const overview = StudyDashboardService.computeOverview(
        [], sessions, periodStart, periodEnd,
      );

      expect(overview.sessionCompletionRate).toBe(50);
    });

    it('deve somar totalStudyMinutes apenas de sessões completadas no período', () => {
      const sessions = [
        buildSession({ id: 's1', status: 'completed', durationMinutes: 60, scheduledAt: new Date(2026, 0, 10) }),
        buildSession({ id: 's2', status: 'completed', durationMinutes: 45, scheduledAt: new Date(2026, 0, 15) }),
        buildSession({ id: 's3', status: 'scheduled', durationMinutes: 30, scheduledAt: new Date(2026, 0, 20) }), // não completada
        buildSession({ id: 's4', status: 'completed', durationMinutes: 90, scheduledAt: new Date(2025, 11, 15) }), // fora do período
        buildSession({ id: 's5', status: 'skipped', durationMinutes: 20, scheduledAt: new Date(2026, 0, 25) }), // skipped
      ];

      const overview = StudyDashboardService.computeOverview(
        [], sessions, periodStart, periodEnd,
      );

      expect(overview.totalStudyMinutes).toBe(105); // 60 + 45
    });

    it('deve retornar averageRating null quando não há ratings', () => {
      const items = [
        buildItem({ id: 'i1', status: 'completed', rating: null, completedAt: new Date(2026, 0, 10) }),
        buildItem({ id: 'i2', status: 'in_progress', rating: null }),
      ];

      const overview = StudyDashboardService.computeOverview(
        items, [], periodStart, periodEnd,
      );

      expect(overview.averageRating).toBeNull();
    });

    it('deve calcular averageRating de itens completados com rating não nulo (all time)', () => {
      const items = [
        buildItem({ id: 'i1', status: 'completed', rating: 4, completedAt: new Date(2026, 0, 10) }),
        buildItem({ id: 'i2', status: 'completed', rating: 5, completedAt: new Date(2025, 5, 10) }), // fora do período, mas conta
        buildItem({ id: 'i3', status: 'completed', rating: null, completedAt: new Date(2026, 0, 15) }), // sem rating
        buildItem({ id: 'i4', status: 'in_progress', rating: 3 }), // não completado
      ];

      const overview = StudyDashboardService.computeOverview(
        items, [], periodStart, periodEnd,
      );

      expect(overview.averageRating).toBe(4.5); // (4 + 5) / 2
    });

    it('deve retornar overview zerado para listas vazias', () => {
      const overview = StudyDashboardService.computeOverview(
        [], [], periodStart, periodEnd,
      );

      expect(overview.inProgress).toBe(0);
      expect(overview.backlogCount).toBe(0);
      expect(overview.completedInPeriod).toBe(0);
      expect(overview.sessionCompletionRate).toBe(0);
      expect(overview.totalStudyMinutes).toBe(0);
      expect(overview.averageRating).toBeNull();
    });

    it('deve considerar sessões na borda do período', () => {
      const sessions = [
        buildSession({ id: 's1', status: 'completed', durationMinutes: 30, scheduledAt: new Date(2026, 0, 1) }),  // borda início
        buildSession({ id: 's2', status: 'completed', durationMinutes: 45, scheduledAt: new Date(2026, 0, 31) }), // borda fim
      ];

      const overview = StudyDashboardService.computeOverview(
        [], sessions, periodStart, periodEnd,
      );

      expect(overview.totalStudyMinutes).toBe(75);
      expect(overview.sessionCompletionRate).toBe(100);
    });
  });
});
