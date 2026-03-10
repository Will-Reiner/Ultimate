import { Project } from '../entities/Project';
import { TaskStatus } from '../value-objects/TaskStatus';
import {
    InvalidProjectNameError,
    DuplicateTaskStatusNameError,
    ImmutableDefaultStatusError,
} from '../errors/TaskErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
    return {
        userId: 'user-1',
        name: 'Meu Projeto',
        ...overrides,
    };
}

describe('Project', () => {
    describe('criacao', () => {
        it('deve criar projeto com nome obrigatorio', () => {
            const project = Project.create(buildValidProps());
            expect(project.name).toBe('Meu Projeto');
            expect(project.userId).toBe('user-1');
            expect(project.id).toBe('');
        });

        it('deve rejeitar nome vazio', () => {
            expect(() => Project.create(buildValidProps({ name: '' }))).toThrow(InvalidProjectNameError);
            expect(() => Project.create(buildValidProps({ name: '   ' }))).toThrow(InvalidProjectNameError);
        });

        it('deve rejeitar nome com mais de 100 caracteres', () => {
            const longName = 'a'.repeat(101);
            expect(() => Project.create(buildValidProps({ name: longName }))).toThrow(InvalidProjectNameError);
        });

        it('deve fazer trim no nome', () => {
            const project = Project.create(buildValidProps({ name: '  Projeto Trimmed  ' }));
            expect(project.name).toBe('Projeto Trimmed');
        });

        it('deve permitir criar sem descricao, objetivo e deadline', () => {
            const project = Project.create(buildValidProps());
            expect(project.description).toBeNull();
            expect(project.objective).toBeNull();
            expect(project.deadline).toBeNull();
        });

        it('deve iniciar com status "active"', () => {
            const project = Project.create(buildValidProps());
            expect(project.status).toBe('active');
        });

        it('deve ter cor e icone padrao se nao informados', () => {
            const project = Project.create(buildValidProps());
            expect(project.color).toBeDefined();
            expect(project.color).not.toBe('');
            expect(project.icon).toBeDefined();
            expect(project.icon).not.toBe('');
        });

        it('deve iniciar com status globais fixos (to_do, in_progress, done)', () => {
            const project = Project.create(buildValidProps());
            const statuses = project.customStatuses;
            expect(statuses).toHaveLength(3);
            expect(statuses.some((s) => s.type === 'todo' && s.isDefault)).toBe(true);
            expect(statuses.some((s) => s.type === 'in_progress' && s.isDefault)).toBe(true);
            expect(statuses.some((s) => s.type === 'done' && s.isDefault)).toBe(true);
        });
    });

    describe('edicao', () => {
        it('deve atualizar nome, descricao e objetivo', () => {
            const project = Project.create(buildValidProps());
            project.updateName('Novo Nome');
            project.updateDescription('Descricao nova');
            project.updateObjective('Objetivo novo');
            expect(project.name).toBe('Novo Nome');
            expect(project.description).toBe('Descricao nova');
            expect(project.objective).toBe('Objetivo novo');
        });

        it('deve atualizar cor e icone', () => {
            const project = Project.create(buildValidProps());
            project.updateColor('#FF0000');
            project.updateIcon('🎯');
            expect(project.color).toBe('#FF0000');
            expect(project.icon).toBe('🎯');
        });

        it('deve atualizar deadline', () => {
            const project = Project.create(buildValidProps());
            const dl = new Date('2026-12-31');
            project.updateDeadline(dl);
            expect(project.deadline).toEqual(dl);
        });

        it('deve remover deadline (setar null)', () => {
            const project = Project.create(buildValidProps());
            project.updateDeadline(new Date('2026-12-31'));
            project.updateDeadline(null);
            expect(project.deadline).toBeNull();
        });

        it('deve atualizar updatedAt ao editar', () => {
            const project = Project.create(buildValidProps());
            const before = project.updatedAt;
            project.updateName('Editado');
            expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
    });

    describe('status customizados', () => {
        it('deve adicionar status customizado vinculado a um type global', () => {
            const project = Project.create(buildValidProps());
            project.addCustomStatus({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            const statuses = project.customStatuses;
            expect(statuses).toHaveLength(4);
            expect(statuses.some((s) => s.name === 'Em Review' && s.type === 'in_progress')).toBe(true);
        });

        it('deve rejeitar status com nome vazio', () => {
            const project = Project.create(buildValidProps());
            expect(() => project.addCustomStatus({ name: '', type: 'in_progress', color: '#FF0000' })).toThrow();
        });

        it('deve rejeitar status com nome duplicado no mesmo projeto', () => {
            const project = Project.create(buildValidProps());
            project.addCustomStatus({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            expect(() => project.addCustomStatus({ name: 'Em Review', type: 'done', color: '#00FF00' })).toThrow(DuplicateTaskStatusNameError);
        });

        it('deve remover status customizado', () => {
            const project = Project.create(buildValidProps());
            project.addCustomStatus({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            const customStatus = project.customStatuses.find((s) => s.name === 'Em Review')!;
            project.removeCustomStatus(customStatus.id);
            expect(project.customStatuses).toHaveLength(3);
            expect(project.customStatuses.some((s) => s.name === 'Em Review')).toBe(false);
        });

        it('nao deve permitir remover status globais fixos', () => {
            const project = Project.create(buildValidProps());
            const defaultStatus = project.customStatuses.find((s) => s.isDefault)!;
            expect(() => project.removeCustomStatus(defaultStatus.id)).toThrow(ImmutableDefaultStatusError);
        });

        it('deve retornar o status default do mesmo type ao remover status customizado', () => {
            const project = Project.create(buildValidProps());
            project.addCustomStatus({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            const customStatus = project.customStatuses.find((s) => s.name === 'Em Review')!;
            const fallback = project.getFallbackStatusForRemoval(customStatus.id);
            expect(fallback).not.toBeNull();
            expect(fallback!.type).toBe('in_progress');
            expect(fallback!.isDefault).toBe(true);
        });
    });

    describe('progresso', () => {
        it('deve calcular progresso como % de tarefas com type "done"', () => {
            const project = Project.create(buildValidProps());
            const progress = project.calculateProgress(10, 3);
            expect(progress).toBe(30);
        });

        it('deve retornar 0% quando nao ha tarefas', () => {
            const project = Project.create(buildValidProps());
            const progress = project.calculateProgress(0, 0);
            expect(progress).toBe(0);
        });

        it('deve retornar 100% quando todas as tarefas estao concluidas', () => {
            const project = Project.create(buildValidProps());
            const progress = project.calculateProgress(5, 5);
            expect(progress).toBe(100);
        });
    });

    describe('ciclo de vida', () => {
        it('deve concluir projeto', () => {
            const project = Project.create(buildValidProps());
            project.complete();
            expect(project.status).toBe('completed');
        });

        it('deve arquivar projeto', () => {
            const project = Project.create(buildValidProps());
            project.archive();
            expect(project.status).toBe('archived');
        });

        it('deve reativar projeto arquivado', () => {
            const project = Project.create(buildValidProps());
            project.archive();
            project.reactivate();
            expect(project.status).toBe('active');
        });

        it('deve reativar projeto concluido', () => {
            const project = Project.create(buildValidProps());
            project.complete();
            project.reactivate();
            expect(project.status).toBe('active');
        });

        it('deve manter todas as tarefas ao arquivar', () => {
            const project = Project.create(buildValidProps());
            project.addCustomStatus({ name: 'Em Review', type: 'in_progress', color: '#FF9900' });
            project.archive();
            expect(project.customStatuses).toHaveLength(4);
        });

        it('deve atualizar updatedAt ao mudar status', () => {
            const project = Project.create(buildValidProps());
            const before = project.updatedAt;
            project.archive();
            expect(project.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
    });

    describe('restore', () => {
        it('deve restaurar projeto a partir dos dados do banco', () => {
            const now = new Date();
            const statuses = TaskStatus.createDefaults();
            const project = Project.restore({
                id: 'proj-1',
                userId: 'user-1',
                name: 'Projeto restaurado',
                description: 'Descricao',
                objective: 'Objetivo',
                color: '#FF0000',
                icon: '🚀',
                status: 'active',
                deadline: now,
                customStatuses: statuses,
                createdAt: now,
                updatedAt: now,
            });
            expect(project.id).toBe('proj-1');
            expect(project.name).toBe('Projeto restaurado');
            expect(project.description).toBe('Descricao');
            expect(project.objective).toBe('Objetivo');
            expect(project.color).toBe('#FF0000');
            expect(project.icon).toBe('🚀');
            expect(project.status).toBe('active');
            expect(project.deadline).toEqual(now);
            expect(project.customStatuses).toHaveLength(3);
        });

        it('deve retornar copia defensiva de customStatuses', () => {
            const statuses = TaskStatus.createDefaults();
            const project = Project.create(buildValidProps());
            const s = project.customStatuses;
            s.push(TaskStatus.create({ name: 'Extra', type: 'done', color: '#000000' }));
            expect(project.customStatuses).toHaveLength(3);
        });
    });
});
