import { TaskStatus, TaskStatusType } from '../value-objects/TaskStatus';
import {
    InvalidProjectNameError,
    DuplicateTaskStatusNameError,
    ImmutableDefaultStatusError,
} from '../errors/TaskErrors';

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface CreateProjectProps {
    userId: string;
    name: string;
    description?: string | null;
    objective?: string | null;
    color?: string;
    icon?: string;
    deadline?: Date | null;
}

export interface RestoreProjectProps {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    objective: string | null;
    color: string;
    icon: string;
    status: ProjectStatus;
    deadline: Date | null;
    customStatuses: TaskStatus[];
    createdAt: Date;
    updatedAt: Date;
}

export class Project {
    private _name: string;
    private _description: string | null;
    private _objective: string | null;
    private _color: string;
    private _icon: string;
    private _status: ProjectStatus;
    private _deadline: Date | null;
    private _customStatuses: TaskStatus[];
    private _updatedAt: Date;

    private constructor(
        private readonly _id: string,
        private readonly _userId: string,
        name: string,
        description: string | null,
        objective: string | null,
        color: string,
        icon: string,
        status: ProjectStatus,
        deadline: Date | null,
        customStatuses: TaskStatus[],
        private readonly _createdAt: Date,
        updatedAt: Date,
    ) {
        this._name = name;
        this._description = description;
        this._objective = objective;
        this._color = color;
        this._icon = icon;
        this._status = status;
        this._deadline = deadline;
        this._customStatuses = customStatuses;
        this._updatedAt = updatedAt;
    }

    static create(props: CreateProjectProps): Project {
        const name = Project.validateName(props.name);
        const defaults = TaskStatus.createDefaults();
        const now = new Date();

        return new Project(
            '',
            props.userId,
            name,
            props.description ?? null,
            props.objective ?? null,
            props.color ?? '#6366F1',
            props.icon ?? '📁',
            'active',
            props.deadline ?? null,
            defaults,
            now,
            now,
        );
    }

    static restore(props: RestoreProjectProps): Project {
        return new Project(
            props.id,
            props.userId,
            props.name,
            props.description,
            props.objective,
            props.color,
            props.icon,
            props.status,
            props.deadline,
            [...props.customStatuses],
            props.createdAt,
            props.updatedAt,
        );
    }

    private static validateName(name: string): string {
        const trimmed = name.trim();
        if (trimmed.length === 0) {
            throw new InvalidProjectNameError('nome nao pode ser vazio.');
        }
        if (trimmed.length > 100) {
            throw new InvalidProjectNameError('nome nao pode ter mais de 100 caracteres.');
        }
        return trimmed;
    }

    updateName(name: string): void {
        this._name = Project.validateName(name);
        this._updatedAt = new Date();
    }

    updateDescription(description: string | null): void {
        this._description = description;
        this._updatedAt = new Date();
    }

    updateObjective(objective: string | null): void {
        this._objective = objective;
        this._updatedAt = new Date();
    }

    updateColor(color: string): void {
        this._color = color;
        this._updatedAt = new Date();
    }

    updateIcon(icon: string): void {
        this._icon = icon;
        this._updatedAt = new Date();
    }

    updateDeadline(deadline: Date | null): void {
        this._deadline = deadline;
        this._updatedAt = new Date();
    }

    addCustomStatus(props: { name: string; type: TaskStatusType; color: string }): void {
        const existing = this._customStatuses.find(
            (s) => s.name.toLowerCase() === props.name.trim().toLowerCase(),
        );
        if (existing) {
            throw new DuplicateTaskStatusNameError(props.name);
        }
        const status = TaskStatus.create(props);
        this._customStatuses.push(status);
        this._updatedAt = new Date();
    }

    removeCustomStatus(statusId: string): void {
        const status = this._customStatuses.find((s) => s.id === statusId);
        if (status && status.isDefault) {
            throw new ImmutableDefaultStatusError();
        }
        this._customStatuses = this._customStatuses.filter((s) => s.id !== statusId);
        this._updatedAt = new Date();
    }

    getFallbackStatusForRemoval(statusId: string): TaskStatus | null {
        const status = this._customStatuses.find((s) => s.id === statusId);
        if (!status) return null;
        return this._customStatuses.find((s) => s.isDefault && s.type === status.type) ?? null;
    }

    calculateProgress(totalTasks: number, doneTasks: number): number {
        if (totalTasks === 0) return 0;
        return Math.round((doneTasks / totalTasks) * 100);
    }

    complete(): void {
        this._status = 'completed';
        this._updatedAt = new Date();
    }

    archive(): void {
        this._status = 'archived';
        this._updatedAt = new Date();
    }

    reactivate(): void {
        this._status = 'active';
        this._updatedAt = new Date();
    }

    get id(): string { return this._id; }
    get userId(): string { return this._userId; }
    get name(): string { return this._name; }
    get description(): string | null { return this._description; }
    get objective(): string | null { return this._objective; }
    get color(): string { return this._color; }
    get icon(): string { return this._icon; }
    get status(): ProjectStatus { return this._status; }
    get deadline(): Date | null { return this._deadline; }
    get customStatuses(): TaskStatus[] { return [...this._customStatuses]; }
    get createdAt(): Date { return this._createdAt; }
    get updatedAt(): Date { return this._updatedAt; }
}
