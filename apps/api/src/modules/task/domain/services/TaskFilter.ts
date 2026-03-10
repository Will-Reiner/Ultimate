import { Task } from '../entities/Task';
import { PriorityLevel } from '../value-objects/Priority';
import { TaskStatusType } from '../value-objects/TaskStatus';

export type FilterFn = (tasks: Task[]) => Task[];

export class TaskFilter {
    static byPriority(tasks: Task[], level: PriorityLevel): Task[] {
        return tasks.filter((t) => t.priority.level === level);
    }

    static sortByPriority(tasks: Task[]): Task[] {
        return [...tasks].sort((a, b) => b.priority.weight - a.priority.weight);
    }

    static byTag(tasks: Task[], tagId: string): Task[] {
        return tasks.filter((t) => t.tags.includes(tagId));
    }

    static byTags(tasks: Task[], tagIds: string[]): Task[] {
        return tasks.filter((t) => tagIds.every((id) => t.tags.includes(id)));
    }

    static byStatusId(tasks: Task[], statusId: string): Task[] {
        return tasks.filter((t) => t.status.id === statusId);
    }

    static byStatusType(tasks: Task[], type: TaskStatusType): Task[] {
        return tasks.filter((t) => t.status.type === type);
    }

    static overdue(tasks: Task[]): Task[] {
        return tasks.filter((t) => t.isOverdue());
    }

    static upcoming(tasks: Task[], days: number = 3): Task[] {
        return tasks.filter((t) => t.isUpcoming(days));
    }

    static withoutDeadline(tasks: Task[]): Task[] {
        return tasks.filter((t) => t.deadline === null);
    }

    static byProject(tasks: Task[], projectId: string): Task[] {
        return tasks.filter((t) => t.projectId === projectId);
    }

    static withoutProject(tasks: Task[]): Task[] {
        return tasks.filter((t) => t.projectId === null);
    }

    static unassigned(tasks: Task[]): Task[] {
        return tasks.filter((t) => t.assigneeId === null);
    }

    static combine(tasks: Task[], filters: FilterFn[]): Task[] {
        return filters.reduce((result, fn) => fn(result), tasks);
    }
}
