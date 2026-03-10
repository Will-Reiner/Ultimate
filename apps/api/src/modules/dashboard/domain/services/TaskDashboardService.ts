import { TaskInput, ProjectInput } from '../inputs/TaskInput';
import { TaskDistribution } from '../value-objects/TaskDistribution';
import { ProjectProgress } from '../value-objects/ProjectProgress';

export class TaskDashboardService {
  static getOverdueTasks(tasks: TaskInput[], refDate: Date): TaskInput[] {
    return tasks
      .filter(
        (t) =>
          t.deadline !== null &&
          t.deadline < refDate &&
          t.statusType !== 'done',
      )
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());
  }

  static getUpcomingTasks(
    tasks: TaskInput[],
    days: number,
    refDate: Date,
  ): TaskInput[] {
    const endDate = new Date(refDate);
    endDate.setDate(endDate.getDate() + days);

    return tasks
      .filter(
        (t) =>
          t.deadline !== null &&
          t.deadline >= refDate &&
          t.deadline <= endDate &&
          t.statusType !== 'done',
      )
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime());
  }

  static getDistribution(
    tasks: TaskInput[],
    refDate: Date,
  ): TaskDistribution {
    const byPriority: Record<string, number> = {};
    let overdueCount = 0;
    let withoutDeadlineCount = 0;
    let withoutAssigneeCount = 0;

    for (const task of tasks) {
      byPriority[task.priorityLevel] =
        (byPriority[task.priorityLevel] || 0) + 1;

      if (
        task.deadline !== null &&
        task.deadline < refDate &&
        task.statusType !== 'done'
      ) {
        overdueCount++;
      }

      if (task.deadline === null) {
        withoutDeadlineCount++;
      }

      if (task.assigneeId === null) {
        withoutAssigneeCount++;
      }
    }

    return TaskDistribution.create({
      byPriority,
      overdueCount,
      withoutDeadlineCount,
      withoutAssigneeCount,
    });
  }

  static getTasksWithoutDeadline(tasks: TaskInput[]): TaskInput[] {
    return tasks.filter((t) => t.deadline === null);
  }

  static getUnassignedTasks(tasks: TaskInput[]): TaskInput[] {
    return tasks.filter((t) => t.assigneeId === null);
  }

  static computeProjectProgress(projects: ProjectInput[]): ProjectProgress {
    const items = projects
      .filter((p) => p.status !== 'archived')
      .map((p) => ({
        projectId: p.id,
        name: p.name,
        percentage: p.totalTasks === 0 ? 0 : (p.doneTasks / p.totalTasks) * 100,
        deadline: p.deadline,
      }));

    return ProjectProgress.create(items);
  }

  static getProjectsByDeadline(projects: ProjectInput[]): ProjectInput[] {
    return projects
      .filter((p) => p.status !== 'archived')
      .sort((a, b) => {
        if (a.deadline === null && b.deadline === null) return 0;
        if (a.deadline === null) return 1;
        if (b.deadline === null) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      });
  }
}
