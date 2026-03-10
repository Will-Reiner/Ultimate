import { Priority } from '../value-objects/Priority';
import { TaskStatus } from '../value-objects/TaskStatus';
import {
    InvalidTaskTitleError,
    InvalidSubtaskError,
    InvalidTaskStatusAssignmentError,
} from '../errors/TaskErrors';

export interface CreateTaskProps {
    userId: string;
    title: string;
    description?: string | null;
    projectId?: string | null;
    deadline?: Date | null;
    assigneeId?: string | null;
    estimatedMinutes?: number | null;
    tags?: string[];
    order?: number;
}

export interface RestoreTaskProps {
    id: string;
    userId: string;
    projectId: string | null;
    parentTaskId: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    deadline: Date | null;
    assigneeId: string | null;
    estimatedMinutes: number | null;
    tags: string[];
    completedAt: Date | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export class Task {
    private _title: string;
    private _description: string | null;
    private _projectId: string | null;
    private _status: TaskStatus;
    private _priority: Priority;
    private _deadline: Date | null;
    private _assigneeId: string | null;
    private _estimatedMinutes: number | null;
    private _tags: string[];
    private _completedAt: Date | null;
    private _order: number;
    private _updatedAt: Date;

    private constructor(
        private readonly _id: string,
        private readonly _userId: string,
        private readonly _parentTaskId: string | null,
        title: string,
        description: string | null,
        projectId: string | null,
        status: TaskStatus,
        priority: Priority,
        deadline: Date | null,
        assigneeId: string | null,
        estimatedMinutes: number | null,
        tags: string[],
        completedAt: Date | null,
        order: number,
        private readonly _createdAt: Date,
        updatedAt: Date,
    ) {
        this._title = title;
        this._description = description;
        this._projectId = projectId;
        this._status = status;
        this._priority = priority;
        this._deadline = deadline;
        this._assigneeId = assigneeId;
        this._estimatedMinutes = estimatedMinutes;
        this._tags = tags;
        this._completedAt = completedAt;
        this._order = order;
        this._updatedAt = updatedAt;
    }

    static create(props: CreateTaskProps): Task {
        const title = Task.validateTitle(props.title);
        const defaults = TaskStatus.createDefaults();
        const todoStatus = defaults.find((s) => s.type === 'todo')!;
        const now = new Date();

        return new Task(
            '',
            props.userId,
            null,
            title,
            props.description ?? null,
            props.projectId ?? null,
            todoStatus,
            Priority.create('none'),
            props.deadline ?? null,
            props.assigneeId ?? null,
            props.estimatedMinutes ?? null,
            props.tags ? [...props.tags] : [],
            null,
            props.order ?? 0,
            now,
            now,
        );
    }

    static createSubtask(parent: Task, props: CreateTaskProps): Task {
        if (parent.parentTaskId !== null) {
            throw new InvalidSubtaskError('nao e possivel criar subtarefa de subtarefa (maximo 1 nivel).');
        }
        const title = Task.validateTitle(props.title);
        const defaults = TaskStatus.createDefaults();
        const todoStatus = defaults.find((s) => s.type === 'todo')!;
        const now = new Date();

        return new Task(
            '',
            props.userId,
            parent.id,
            title,
            props.description ?? null,
            parent.projectId,
            todoStatus,
            Priority.create('none'),
            props.deadline ?? null,
            props.assigneeId ?? null,
            props.estimatedMinutes ?? null,
            props.tags ? [...props.tags] : [],
            null,
            props.order ?? 0,
            now,
            now,
        );
    }

    static restore(props: RestoreTaskProps): Task {
        return new Task(
            props.id,
            props.userId,
            props.parentTaskId,
            props.title,
            props.description,
            props.projectId,
            props.status,
            props.priority,
            props.deadline,
            props.assigneeId,
            props.estimatedMinutes,
            [...props.tags],
            props.completedAt,
            props.order,
            props.createdAt,
            props.updatedAt,
        );
    }

    private static validateTitle(title: string): string {
        const trimmed = title.trim();
        if (trimmed.length === 0) {
            throw new InvalidTaskTitleError('titulo nao pode ser vazio.');
        }
        if (trimmed.length > 200) {
            throw new InvalidTaskTitleError('titulo nao pode ter mais de 200 caracteres.');
        }
        return trimmed;
    }

    updateTitle(title: string): void {
        this._title = Task.validateTitle(title);
        this._updatedAt = new Date();
    }

    updateDescription(description: string | null): void {
        this._description = description;
        this._updatedAt = new Date();
    }

    updatePriority(priority: Priority): void {
        this._priority = priority;
        this._updatedAt = new Date();
    }

    updateStatus(status: TaskStatus, availableStatuses: TaskStatus[]): void {
        const found = availableStatuses.some((s) => s.id === status.id);
        if (!found) {
            throw new InvalidTaskStatusAssignmentError(
                `status "${status.name}" nao esta disponivel para esta tarefa.`,
            );
        }
        this._status = status;
        if (status.isDone()) {
            this._completedAt = new Date();
        } else {
            this._completedAt = null;
        }
        this._updatedAt = new Date();
    }

    updateDeadline(deadline: Date | null): void {
        this._deadline = deadline;
        this._updatedAt = new Date();
    }

    updateAssignee(assigneeId: string | null): void {
        this._assigneeId = assigneeId;
        this._updatedAt = new Date();
    }

    updateEstimatedMinutes(minutes: number | null): void {
        this._estimatedMinutes = minutes;
        this._updatedAt = new Date();
    }

    moveToProject(projectId: string | null): void {
        this._projectId = projectId;
        this._updatedAt = new Date();
    }

    addTag(tagId: string): void {
        if (!this._tags.includes(tagId)) {
            this._tags.push(tagId);
            this._updatedAt = new Date();
        }
    }

    removeTag(tagId: string): void {
        this._tags = this._tags.filter((t) => t !== tagId);
        this._updatedAt = new Date();
    }

    updateOrder(order: number): void {
        this._order = order;
        this._updatedAt = new Date();
    }

    complete(doneStatus: TaskStatus, availableStatuses: TaskStatus[]): void {
        this.updateStatus(doneStatus, availableStatuses);
    }

    reopen(todoStatus: TaskStatus, availableStatuses: TaskStatus[]): void {
        this.updateStatus(todoStatus, availableStatuses);
    }

    isOverdue(): boolean {
        if (!this._deadline) return false;
        if (this._status.isDone()) return false;
        const now = new Date();
        return this._deadline.getTime() < now.getTime();
    }

    isUpcoming(days: number = 3): boolean {
        if (!this._deadline) return false;
        if (this._status.isDone()) return false;
        const now = new Date();
        const limit = new Date();
        limit.setDate(limit.getDate() + days);
        return this._deadline.getTime() >= now.getTime() && this._deadline.getTime() <= limit.getTime();
    }

    get id(): string { return this._id; }
    get userId(): string { return this._userId; }
    get projectId(): string | null { return this._projectId; }
    get parentTaskId(): string | null { return this._parentTaskId; }
    get title(): string { return this._title; }
    get description(): string | null { return this._description; }
    get status(): TaskStatus { return this._status; }
    get priority(): Priority { return this._priority; }
    get deadline(): Date | null { return this._deadline; }
    get assigneeId(): string | null { return this._assigneeId; }
    get estimatedMinutes(): number | null { return this._estimatedMinutes; }
    get tags(): string[] { return [...this._tags]; }
    get completedAt(): Date | null { return this._completedAt; }
    get order(): number { return this._order; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
}
