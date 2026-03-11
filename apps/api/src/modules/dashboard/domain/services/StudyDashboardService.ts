import { StudyItemInput, StudySessionInput } from '../inputs/StudyInput';
import { StudyOverview } from '../value-objects/StudyOverview';

export class StudyDashboardService {
  static computeOverview(
    items: StudyItemInput[],
    sessions: StudySessionInput[],
    periodStart: Date,
    periodEnd: Date,
  ): StudyOverview {
    const inProgress = items.filter((i) => i.status === 'in_progress').length;
    const backlogCount = items.filter((i) => i.status === 'backlog').length;

    const completedInPeriod = items.filter(
      (i) =>
        i.status === 'completed' &&
        i.completedAt !== null &&
        i.completedAt >= periodStart &&
        i.completedAt <= periodEnd,
    ).length;

    const sessionsInPeriod = sessions.filter(
      (s) => s.scheduledAt >= periodStart && s.scheduledAt <= periodEnd,
    );

    const nonSkippedInPeriod = sessionsInPeriod.filter(
      (s) => s.status !== 'skipped',
    );

    const completedSessionsInPeriod = sessionsInPeriod.filter(
      (s) => s.status === 'completed',
    );

    const sessionCompletionRate =
      nonSkippedInPeriod.length === 0
        ? 0
        : (completedSessionsInPeriod.length / nonSkippedInPeriod.length) * 100;

    const totalStudyMinutes = completedSessionsInPeriod.reduce(
      (sum, s) => sum + s.durationMinutes,
      0,
    );

    const completedItemsWithRating = items.filter(
      (i) => i.status === 'completed' && i.rating !== null,
    );

    const averageRating =
      completedItemsWithRating.length === 0
        ? null
        : completedItemsWithRating.reduce((sum, i) => sum + i.rating!, 0) /
          completedItemsWithRating.length;

    return StudyOverview.create({
      inProgress,
      backlogCount,
      completedInPeriod,
      sessionCompletionRate,
      totalStudyMinutes,
      averageRating,
    });
  }
}
