import { Task } from '../entities/Task';
import { Priority } from '../value-objects/Priority';
import { TaskStatus } from '../value-objects/TaskStatus';
import { TaskFilter } from '../services/TaskFilter';

function buildDefaultStatuses() {
    return TaskStatus.createDefaults();
}

function buildTask(overrides: Record<string, unknown> = {}): Task {
    const defaults = buildDefaultStatuses();
    const now = new Date();
    return Task.restore({
        id: overrides.id as string ?? 'task-1',
        userId: overrides.userId as string ?? 'user-1',
        projectId: overrides.projectId !== undefined ? overrides.projectId as string | null : null,
        parentTaskId: overrides.parentTaskId !== undefined ? overrides.parentTaskId as string | null : null,
        title: overrides.title as string ?? 'Tarefa',
        description: overrides.description as string | null ?? null,
        status: overrides.status as TaskStatus ?? defaults.find((s) => s.type === 'todo')!,
        priority: overrides.priority as Priority ?? Priority.restore('none'),
        deadline: overrides.deadline !== undefined ? overrides.deadline as Date | null : null,
        assigneeId: overrides.assigneeId !== undefined ? overrides.assigneeId as string | null : null,
        estimatedMinutes: overrides.estimatedMinutes as number | null ?? null,
        tags: overrides.tags as string[] ?? [],
        completedAt: overrides.completedAt !== undefined ? overrides.completedAt as Date | null : null,
        order: overrides.order as number ?? 0,
        createdAt: now,
        updatedAt: now,
    });
}

function doneStatus(): TaskStatus {
    return buildDefaultStatuses().find((s) => s.type === 'done')!;
}

function inProgressStatus(): TaskStatus {
    return buildDefaultStatuses().find((s) => s.type === 'in_progress')!;
}

function todoStatus(): TaskStatus {
    return buildDefaultStatuses().find((s) => s.type === 'todo')!;
}

describe('Filtros Inteligentes', () => {
    describe('filtro por prioridade', () => {
        it('deve retornar tarefas com prioridade especifica', () => {
            const tasks = [
                buildTask({ id: 't1', priority: Priority.restore('high') }),
                buildTask({ id: 't2', priority: Priority.restore('low') }),
                buildTask({ id: 't3', priority: Priority.restore('high') }),
            ];
            const result = TaskFilter.byPriority(tasks, 'high');
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });

        it('deve ordenar por prioridade (urgent primeiro)', () => {
            const tasks = [
                buildTask({ id: 't1', priority: Priority.restore('low') }),
                buildTask({ id: 't2', priority: Priority.restore('urgent') }),
                buildTask({ id: 't3', priority: Priority.restore('high') }),
                buildTask({ id: 't4', priority: Priority.restore('none') }),
                buildTask({ id: 't5', priority: Priority.restore('medium') }),
            ];
            const result = TaskFilter.sortByPriority(tasks);
            expect(result.map((t) => t.id)).toEqual(['t2', 't3', 't5', 't1', 't4']);
        });
    });

    describe('filtro por tag', () => {
        it('deve retornar tarefas que contenham a tag', () => {
            const tasks = [
                buildTask({ id: 't1', tags: ['frontend', 'bug'] }),
                buildTask({ id: 't2', tags: ['backend'] }),
                buildTask({ id: 't3', tags: ['frontend', 'feature'] }),
            ];
            const result = TaskFilter.byTag(tasks, 'frontend');
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });

        it('deve suportar filtro por multiplas tags (AND)', () => {
            const tasks = [
                buildTask({ id: 't1', tags: ['frontend', 'bug'] }),
                buildTask({ id: 't2', tags: ['frontend'] }),
                buildTask({ id: 't3', tags: ['frontend', 'bug', 'urgent'] }),
            ];
            const result = TaskFilter.byTags(tasks, ['frontend', 'bug']);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });
    });

    describe('filtro por status', () => {
        it('deve retornar tarefas com status especifico', () => {
            const done = doneStatus();
            const todo = todoStatus();
            const tasks = [
                buildTask({ id: 't1', status: done }),
                buildTask({ id: 't2', status: todo }),
                buildTask({ id: 't3', status: done }),
            ];
            const result = TaskFilter.byStatusId(tasks, done.id);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });

        it('deve filtrar por type do status (todas "in_progress")', () => {
            const ip = inProgressStatus();
            const todo = todoStatus();
            const tasks = [
                buildTask({ id: 't1', status: ip }),
                buildTask({ id: 't2', status: todo }),
                buildTask({ id: 't3', status: ip }),
            ];
            const result = TaskFilter.byStatusType(tasks, 'in_progress');
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });
    });

    describe('filtro por deadline', () => {
        it('deve retornar tarefas atrasadas', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tasks = [
                buildTask({ id: 't1', deadline: yesterday }),
                buildTask({ id: 't2', deadline: tomorrow }),
                buildTask({ id: 't3', deadline: null }),
            ];
            const result = TaskFilter.overdue(tasks);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('t1');
        });

        it('deve retornar tarefas com deadline nos proximos N dias', () => {
            const inTwoDays = new Date();
            inTwoDays.setDate(inTwoDays.getDate() + 2);
            const inTenDays = new Date();
            inTenDays.setDate(inTenDays.getDate() + 10);
            const tasks = [
                buildTask({ id: 't1', deadline: inTwoDays }),
                buildTask({ id: 't2', deadline: inTenDays }),
                buildTask({ id: 't3', deadline: null }),
            ];
            const result = TaskFilter.upcoming(tasks, 3);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('t1');
        });

        it('deve retornar tarefas sem deadline', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tasks = [
                buildTask({ id: 't1', deadline: tomorrow }),
                buildTask({ id: 't2', deadline: null }),
                buildTask({ id: 't3', deadline: null }),
            ];
            const result = TaskFilter.withoutDeadline(tasks);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t2', 't3']);
        });
    });

    describe('filtro por projeto', () => {
        it('deve retornar tarefas de um projeto especifico', () => {
            const tasks = [
                buildTask({ id: 't1', projectId: 'proj-1' }),
                buildTask({ id: 't2', projectId: 'proj-2' }),
                buildTask({ id: 't3', projectId: 'proj-1' }),
            ];
            const result = TaskFilter.byProject(tasks, 'proj-1');
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
        });

        it('deve retornar tarefas soltas (sem projeto)', () => {
            const tasks = [
                buildTask({ id: 't1', projectId: 'proj-1' }),
                buildTask({ id: 't2', projectId: null }),
                buildTask({ id: 't3', projectId: null }),
            ];
            const result = TaskFilter.withoutProject(tasks);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t2', 't3']);
        });
    });

    describe('filtro combinado', () => {
        it('deve combinar multiplos filtros (ex: atrasadas + alta prioridade)', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tasks = [
                buildTask({ id: 't1', deadline: yesterday, priority: Priority.restore('high') }),
                buildTask({ id: 't2', deadline: yesterday, priority: Priority.restore('low') }),
                buildTask({ id: 't3', deadline: tomorrow, priority: Priority.restore('high') }),
            ];
            const result = TaskFilter.combine(tasks, [
                (t) => TaskFilter.overdue(t),
                (t) => TaskFilter.byPriority(t, 'high'),
            ]);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('t1');
        });

        it('deve retornar tarefas sem assignee', () => {
            const tasks = [
                buildTask({ id: 't1', assigneeId: 'user-1' }),
                buildTask({ id: 't2', assigneeId: null }),
                buildTask({ id: 't3', assigneeId: null }),
            ];
            const result = TaskFilter.unassigned(tasks);
            expect(result).toHaveLength(2);
            expect(result.map((t) => t.id)).toEqual(['t2', 't3']);
        });
    });
});
