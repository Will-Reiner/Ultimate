import { Task } from '../entities/Task';
import { Priority } from '../value-objects/Priority';
import { TaskStatus } from '../value-objects/TaskStatus';
import {
    InvalidTaskTitleError,
    InvalidSubtaskError,
    InvalidTaskStatusAssignmentError,
} from '../errors/TaskErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
    return {
        userId: 'user-1',
        title: 'Implementar feature X',
        ...overrides,
    };
}

function buildDefaultStatuses() {
    return TaskStatus.createDefaults();
}

function findStatusByType(statuses: ReturnType<typeof buildDefaultStatuses>, type: string) {
    return statuses.find((s) => s.type === type)!;
}

describe('Task', () => {
    describe('criacao', () => {
        it('deve criar tarefa com titulo obrigatorio', () => {
            const task = Task.create(buildValidProps());
            expect(task.title).toBe('Implementar feature X');
            expect(task.userId).toBe('user-1');
            expect(task.id).toBe('');
        });

        it('deve rejeitar titulo vazio', () => {
            expect(() => Task.create(buildValidProps({ title: '' }))).toThrow(InvalidTaskTitleError);
            expect(() => Task.create(buildValidProps({ title: '   ' }))).toThrow(InvalidTaskTitleError);
        });

        it('deve rejeitar titulo com mais de 200 caracteres', () => {
            const longTitle = 'a'.repeat(201);
            expect(() => Task.create(buildValidProps({ title: longTitle }))).toThrow(InvalidTaskTitleError);
        });

        it('deve fazer trim no titulo', () => {
            const task = Task.create(buildValidProps({ title: '  Minha Tarefa  ' }));
            expect(task.title).toBe('Minha Tarefa');
        });

        it('deve iniciar com status "to_do"', () => {
            const task = Task.create(buildValidProps());
            expect(task.status.type).toBe('todo');
            expect(task.status.name).toBe('To Do');
        });

        it('deve iniciar com prioridade "none"', () => {
            const task = Task.create(buildValidProps());
            expect(task.priority.level).toBe('none');
        });

        it('deve permitir criar sem projeto (tarefa solta)', () => {
            const task = Task.create(buildValidProps());
            expect(task.projectId).toBeNull();
        });

        it('deve permitir criar vinculada a um projeto', () => {
            const task = Task.create(buildValidProps({ projectId: 'proj-1' }));
            expect(task.projectId).toBe('proj-1');
        });

        it('deve permitir criar sem deadline, assignee e estimativa', () => {
            const task = Task.create(buildValidProps());
            expect(task.deadline).toBeNull();
            expect(task.assigneeId).toBeNull();
            expect(task.estimatedMinutes).toBeNull();
        });

        it('deve permitir criar com tags', () => {
            const task = Task.create(buildValidProps({ tags: ['tag-1', 'tag-2'] }));
            expect(task.tags).toEqual(['tag-1', 'tag-2']);
        });
    });

    describe('subtarefa', () => {
        it('deve criar subtarefa vinculada a uma tarefa pai', () => {
            const parent = Task.restore({
                id: 'parent-1',
                userId: 'user-1',
                projectId: 'proj-1',
                parentTaskId: null,
                title: 'Tarefa pai',
                description: null,
                status: TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true }),
                priority: Priority.restore('none'),
                deadline: null,
                assigneeId: null,
                estimatedMinutes: null,
                tags: [],
                completedAt: null,
                order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const sub = Task.createSubtask(parent, { userId: 'user-1', title: 'Subtarefa 1' });
            expect(sub.parentTaskId).toBe('parent-1');
        });

        it('deve herdar o projectId da tarefa pai', () => {
            const parent = Task.restore({
                id: 'parent-1',
                userId: 'user-1',
                projectId: 'proj-1',
                parentTaskId: null,
                title: 'Tarefa pai',
                description: null,
                status: TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true }),
                priority: Priority.restore('none'),
                deadline: null,
                assigneeId: null,
                estimatedMinutes: null,
                tags: [],
                completedAt: null,
                order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const sub = Task.createSubtask(parent, { userId: 'user-1', title: 'Subtarefa 1' });
            expect(sub.projectId).toBe('proj-1');
        });

        it('nao deve permitir subtarefa de subtarefa (max 1 nivel)', () => {
            const sub = Task.restore({
                id: 'sub-1',
                userId: 'user-1',
                projectId: 'proj-1',
                parentTaskId: 'parent-1',
                title: 'Subtarefa',
                description: null,
                status: TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true }),
                priority: Priority.restore('none'),
                deadline: null,
                assigneeId: null,
                estimatedMinutes: null,
                tags: [],
                completedAt: null,
                order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            expect(() => Task.createSubtask(sub, { userId: 'user-1', title: 'Sub-sub' })).toThrow(InvalidSubtaskError);
        });

        it('subtarefa deve ter todos os atributos de uma tarefa', () => {
            const parent = Task.restore({
                id: 'parent-1',
                userId: 'user-1',
                projectId: null,
                parentTaskId: null,
                title: 'Tarefa pai',
                description: null,
                status: TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true }),
                priority: Priority.restore('none'),
                deadline: null,
                assigneeId: null,
                estimatedMinutes: null,
                tags: [],
                completedAt: null,
                order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const sub = Task.createSubtask(parent, { userId: 'user-1', title: 'Subtarefa completa' });
            expect(sub.title).toBe('Subtarefa completa');
            expect(sub.status.type).toBe('todo');
            expect(sub.priority.level).toBe('none');
            expect(sub.deadline).toBeNull();
            expect(sub.tags).toEqual([]);
        });

        it('deve rejeitar criar subtarefa se pai ja e subtarefa', () => {
            const sub = Task.restore({
                id: 'sub-1',
                userId: 'user-1',
                projectId: null,
                parentTaskId: 'parent-1',
                title: 'Ja e subtarefa',
                description: null,
                status: TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true }),
                priority: Priority.restore('none'),
                deadline: null,
                assigneeId: null,
                estimatedMinutes: null,
                tags: [],
                completedAt: null,
                order: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            expect(() => Task.createSubtask(sub, { userId: 'user-1', title: 'Neta' })).toThrow(InvalidSubtaskError);
        });
    });

    describe('edicao', () => {
        it('deve atualizar titulo e descricao', () => {
            const task = Task.create(buildValidProps());
            task.updateTitle('Novo titulo');
            task.updateDescription('Descricao detalhada');
            expect(task.title).toBe('Novo titulo');
            expect(task.description).toBe('Descricao detalhada');
        });

        it('deve atualizar prioridade', () => {
            const task = Task.create(buildValidProps());
            task.updatePriority(Priority.create('high'));
            expect(task.priority.level).toBe('high');
        });

        it('deve atualizar status', () => {
            const defaults = buildDefaultStatuses();
            const inProgress = findStatusByType(defaults, 'in_progress');
            const task = Task.create(buildValidProps());
            task.updateStatus(inProgress, defaults);
            expect(task.status.type).toBe('in_progress');
        });

        it('deve atualizar deadline', () => {
            const task = Task.create(buildValidProps());
            const dl = new Date('2026-12-31');
            task.updateDeadline(dl);
            expect(task.deadline).toEqual(dl);
        });

        it('deve atualizar assignee', () => {
            const task = Task.create(buildValidProps());
            task.updateAssignee('user-2');
            expect(task.assigneeId).toBe('user-2');
        });

        it('deve atualizar estimativa de tempo', () => {
            const task = Task.create(buildValidProps());
            task.updateEstimatedMinutes(120);
            expect(task.estimatedMinutes).toBe(120);
        });

        it('deve mover tarefa para outro projeto', () => {
            const task = Task.create(buildValidProps({ projectId: 'proj-1' }));
            task.moveToProject('proj-2');
            expect(task.projectId).toBe('proj-2');
        });

        it('deve desvincular tarefa de projeto (tornar solta)', () => {
            const task = Task.create(buildValidProps({ projectId: 'proj-1' }));
            task.moveToProject(null);
            expect(task.projectId).toBeNull();
        });

        it('deve adicionar tag', () => {
            const task = Task.create(buildValidProps());
            task.addTag('tag-1');
            expect(task.tags).toContain('tag-1');
        });

        it('deve remover tag', () => {
            const task = Task.create(buildValidProps({ tags: ['tag-1', 'tag-2'] }));
            task.removeTag('tag-1');
            expect(task.tags).toEqual(['tag-2']);
        });

        it('deve reordenar tarefa (alterar order)', () => {
            const task = Task.create(buildValidProps());
            task.updateOrder(5);
            expect(task.order).toBe(5);
        });

        it('deve remover deadline (setar null)', () => {
            const task = Task.create(buildValidProps());
            task.updateDeadline(new Date('2026-12-31'));
            task.updateDeadline(null);
            expect(task.deadline).toBeNull();
        });

        it('deve atualizar updatedAt ao editar', () => {
            const task = Task.create(buildValidProps());
            const before = task.updatedAt;
            task.updateTitle('Atualizado');
            expect(task.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
    });

    describe('status', () => {
        it('deve aceitar status globais fixos', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const task = Task.create(buildValidProps());
            task.updateStatus(done, defaults);
            expect(task.status.type).toBe('done');
        });

        it('deve aceitar status customizados do projeto', () => {
            const defaults = buildDefaultStatuses();
            const custom = TaskStatus.create({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            const task = Task.create(buildValidProps({ projectId: 'proj-1' }));
            const availableStatuses = [...defaults, custom];
            task.updateStatus(custom, availableStatuses);
            expect(task.status.name).toBe('Em Review');
        });

        it('deve rejeitar status customizado de outro projeto', () => {
            const defaults = buildDefaultStatuses();
            const customFromOther = TaskStatus.create({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            const task = Task.create(buildValidProps({ projectId: 'proj-1' }));
            expect(() => task.updateStatus(customFromOther, defaults)).toThrow(InvalidTaskStatusAssignmentError);
        });

        it('deve registrar completedAt ao mudar para status type "done"', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const task = Task.create(buildValidProps());
            task.updateStatus(done, defaults);
            expect(task.completedAt).not.toBeNull();
        });

        it('deve limpar completedAt ao sair de status type "done"', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const todo = findStatusByType(defaults, 'todo');
            const task = Task.create(buildValidProps());
            task.updateStatus(done, defaults);
            expect(task.completedAt).not.toBeNull();
            task.updateStatus(todo, defaults);
            expect(task.completedAt).toBeNull();
        });

        it('tarefa solta deve aceitar apenas status globais', () => {
            const defaults = buildDefaultStatuses();
            const custom = TaskStatus.create({ name: 'Custom', type: 'in_progress', color: '#FF0000' });
            const task = Task.create(buildValidProps());
            expect(() => task.updateStatus(custom, defaults)).toThrow(InvalidTaskStatusAssignmentError);
        });
    });

    describe('completar', () => {
        it('deve marcar como concluida (status type "done")', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const task = Task.create(buildValidProps());
            task.complete(done, defaults);
            expect(task.status.type).toBe('done');
        });

        it('deve registrar data de conclusao', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const task = Task.create(buildValidProps());
            task.complete(done, defaults);
            expect(task.completedAt).toBeInstanceOf(Date);
        });

        it('deve permitir reabrir tarefa concluida', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const todo = findStatusByType(defaults, 'todo');
            const task = Task.create(buildValidProps());
            task.complete(done, defaults);
            task.reopen(todo, defaults);
            expect(task.status.type).toBe('todo');
        });

        it('ao reabrir, deve limpar data de conclusao', () => {
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const todo = findStatusByType(defaults, 'todo');
            const task = Task.create(buildValidProps());
            task.complete(done, defaults);
            task.reopen(todo, defaults);
            expect(task.completedAt).toBeNull();
        });
    });

    describe('deadline', () => {
        it('deve identificar tarefa como atrasada (deadline < hoje e status != done)', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const task = Task.create(buildValidProps());
            task.updateDeadline(yesterday);
            expect(task.isOverdue()).toBe(true);
        });

        it('deve identificar tarefa como proxima (deadline nos proximos 3 dias)', () => {
            const inTwoDays = new Date();
            inTwoDays.setDate(inTwoDays.getDate() + 2);
            const task = Task.create(buildValidProps());
            task.updateDeadline(inTwoDays);
            expect(task.isUpcoming()).toBe(true);
        });

        it('nao deve marcar como atrasada se ja concluida', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const defaults = buildDefaultStatuses();
            const done = findStatusByType(defaults, 'done');
            const task = Task.create(buildValidProps());
            task.updateDeadline(yesterday);
            task.complete(done, defaults);
            expect(task.isOverdue()).toBe(false);
        });

        it('nao deve ser proxima se deadline e hoje', () => {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const task = Task.create(buildValidProps());
            task.updateDeadline(today);
            expect(task.isUpcoming()).toBe(true);
        });

        it('nao deve ser proxima se nao tem deadline', () => {
            const task = Task.create(buildValidProps());
            expect(task.isUpcoming()).toBe(false);
        });
    });

    describe('restore', () => {
        it('deve restaurar tarefa a partir dos dados do banco', () => {
            const now = new Date();
            const status = TaskStatus.restore({ id: 's1', name: 'To Do', type: 'todo', color: '#888', isDefault: true });
            const priority = Priority.restore('medium');
            const task = Task.restore({
                id: 'task-1',
                userId: 'user-1',
                projectId: 'proj-1',
                parentTaskId: null,
                title: 'Tarefa restaurada',
                description: 'Descricao',
                status,
                priority,
                deadline: now,
                assigneeId: 'user-2',
                estimatedMinutes: 60,
                tags: ['tag-1'],
                completedAt: null,
                order: 3,
                createdAt: now,
                updatedAt: now,
            });
            expect(task.id).toBe('task-1');
            expect(task.title).toBe('Tarefa restaurada');
            expect(task.description).toBe('Descricao');
            expect(task.priority.level).toBe('medium');
            expect(task.projectId).toBe('proj-1');
            expect(task.assigneeId).toBe('user-2');
            expect(task.estimatedMinutes).toBe(60);
            expect(task.tags).toEqual(['tag-1']);
            expect(task.order).toBe(3);
        });

        it('deve retornar copia defensiva de tags', () => {
            const task = Task.create(buildValidProps({ tags: ['tag-1', 'tag-2'] }));
            const tags = task.tags;
            tags.push('tag-3');
            expect(task.tags).toEqual(['tag-1', 'tag-2']);
        });
    });
});
