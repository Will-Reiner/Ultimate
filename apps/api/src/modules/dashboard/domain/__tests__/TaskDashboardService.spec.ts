import { TaskDashboardService } from '../services/TaskDashboardService';
import { TaskInput, ProjectInput } from '../inputs/TaskInput';
import { TaskDistribution } from '../value-objects/TaskDistribution';
import { ProjectProgress } from '../value-objects/ProjectProgress';

function buildTask(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    id: 't1',
    title: 'Task',
    statusType: 'todo',
    priorityLevel: 'medium',
    deadline: null,
    assigneeId: null,
    projectId: null,
    completedAt: null,
    ...overrides,
  };
}

function buildProject(overrides: Partial<ProjectInput> = {}): ProjectInput {
  return {
    id: 'p1',
    name: 'Project',
    status: 'active',
    deadline: null,
    totalTasks: 10,
    doneTasks: 5,
    ...overrides,
  };
}

describe('TaskDistribution', () => {
  it('deve criar com dados válidos e expor getters', () => {
    const dist = TaskDistribution.create({
      byPriority: { low: 2, high: 3 },
      overdueCount: 1,
      withoutDeadlineCount: 4,
      withoutAssigneeCount: 2,
    });

    expect(dist.byPriority).toEqual({ low: 2, high: 3 });
    expect(dist.overdueCount).toBe(1);
    expect(dist.withoutDeadlineCount).toBe(4);
    expect(dist.withoutAssigneeCount).toBe(2);
  });

  it('deve serializar com toJSON', () => {
    const dist = TaskDistribution.create({
      byPriority: { medium: 5 },
      overdueCount: 0,
      withoutDeadlineCount: 1,
      withoutAssigneeCount: 3,
    });

    expect(dist.toJSON()).toEqual({
      byPriority: { medium: 5 },
      overdueCount: 0,
      withoutDeadlineCount: 1,
      withoutAssigneeCount: 3,
    });
  });
});

describe('ProjectProgress', () => {
  it('deve criar com itens válidos e expor getter', () => {
    const items = [
      { projectId: 'p1', name: 'Proj A', percentage: 50, deadline: null },
      { projectId: 'p2', name: 'Proj B', percentage: 80, deadline: new Date(2026, 5, 1) },
    ];

    const progress = ProjectProgress.create(items);

    expect(progress.items).toEqual(items);
    expect(progress.items.length).toBe(2);
  });

  it('deve serializar com toJSON', () => {
    const deadline = new Date(2026, 5, 1);
    const items = [
      { projectId: 'p1', name: 'Proj A', percentage: 75, deadline },
    ];

    const progress = ProjectProgress.create(items);

    expect(progress.toJSON()).toEqual(items);
  });

  it('deve criar com lista vazia', () => {
    const progress = ProjectProgress.create([]);

    expect(progress.items).toEqual([]);
  });
});

describe('TaskDashboardService', () => {
  const refDate = new Date(2026, 2, 10); // 2026-03-10

  describe('getOverdueTasks', () => {
    it('deve retornar tarefas com deadline no passado e não concluídas', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 5), statusType: 'todo' }),
        buildTask({ id: 't2', deadline: new Date(2026, 2, 8), statusType: 'in_progress' }),
        buildTask({ id: 't3', deadline: new Date(2026, 2, 5), statusType: 'done' }),
        buildTask({ id: 't4', deadline: new Date(2026, 2, 15), statusType: 'todo' }),
        buildTask({ id: 't5', deadline: null, statusType: 'todo' }),
      ];

      const result = TaskDashboardService.getOverdueTasks(tasks, refDate);

      expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
    });

    it('deve ordenar por deadline ascendente', () => {
      const tasks = [
        buildTask({ id: 't2', deadline: new Date(2026, 2, 8), statusType: 'todo' }),
        buildTask({ id: 't1', deadline: new Date(2026, 2, 3), statusType: 'todo' }),
      ];

      const result = TaskDashboardService.getOverdueTasks(tasks, refDate);

      expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
    });

    it('deve retornar array vazio quando não há tarefas atrasadas', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 15), statusType: 'todo' }),
        buildTask({ id: 't2', deadline: new Date(2026, 2, 5), statusType: 'done' }),
      ];

      const result = TaskDashboardService.getOverdueTasks(tasks, refDate);

      expect(result).toEqual([]);
    });

    it('deve retornar array vazio quando lista está vazia', () => {
      const result = TaskDashboardService.getOverdueTasks([], refDate);

      expect(result).toEqual([]);
    });
  });

  describe('getUpcomingTasks', () => {
    it('deve retornar tarefas com deadline nos próximos N dias', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 10), statusType: 'todo' }), // hoje
        buildTask({ id: 't2', deadline: new Date(2026, 2, 12), statusType: 'in_progress' }),
        buildTask({ id: 't3', deadline: new Date(2026, 2, 17), statusType: 'todo' }), // dia 17, dentro de 7 dias
        buildTask({ id: 't4', deadline: new Date(2026, 2, 18), statusType: 'todo' }), // fora dos 7 dias
        buildTask({ id: 't5', deadline: new Date(2026, 2, 12), statusType: 'done' }), // done
        buildTask({ id: 't6', deadline: null, statusType: 'todo' }), // sem deadline
      ];

      const result = TaskDashboardService.getUpcomingTasks(tasks, 7, refDate);

      expect(result.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
    });

    it('deve ordenar por deadline ascendente', () => {
      const tasks = [
        buildTask({ id: 't2', deadline: new Date(2026, 2, 14), statusType: 'todo' }),
        buildTask({ id: 't1', deadline: new Date(2026, 2, 11), statusType: 'todo' }),
      ];

      const result = TaskDashboardService.getUpcomingTasks(tasks, 7, refDate);

      expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
    });

    it('deve retornar array vazio quando não há tarefas próximas', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 25), statusType: 'todo' }),
      ];

      const result = TaskDashboardService.getUpcomingTasks(tasks, 7, refDate);

      expect(result).toEqual([]);
    });

    it('deve excluir tarefas com deadline no passado', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 5), statusType: 'todo' }),
      ];

      const result = TaskDashboardService.getUpcomingTasks(tasks, 7, refDate);

      expect(result).toEqual([]);
    });
  });

  describe('getDistribution', () => {
    it('deve contar tarefas por prioridade', () => {
      const tasks = [
        buildTask({ id: 't1', priorityLevel: 'high' }),
        buildTask({ id: 't2', priorityLevel: 'high' }),
        buildTask({ id: 't3', priorityLevel: 'low' }),
        buildTask({ id: 't4', priorityLevel: 'none' }),
      ];

      const dist = TaskDashboardService.getDistribution(tasks, refDate);

      expect(dist.byPriority).toEqual({ high: 2, low: 1, none: 1 });
    });

    it('deve contar tarefas atrasadas', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 5), statusType: 'todo' }),
        buildTask({ id: 't2', deadline: new Date(2026, 2, 8), statusType: 'in_progress' }),
        buildTask({ id: 't3', deadline: new Date(2026, 2, 5), statusType: 'done' }),
        buildTask({ id: 't4', deadline: new Date(2026, 2, 15), statusType: 'todo' }),
      ];

      const dist = TaskDashboardService.getDistribution(tasks, refDate);

      expect(dist.overdueCount).toBe(2);
    });

    it('deve contar tarefas sem deadline', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: null }),
        buildTask({ id: 't2', deadline: null }),
        buildTask({ id: 't3', deadline: new Date(2026, 2, 15) }),
      ];

      const dist = TaskDashboardService.getDistribution(tasks, refDate);

      expect(dist.withoutDeadlineCount).toBe(2);
    });

    it('deve contar tarefas sem responsável', () => {
      const tasks = [
        buildTask({ id: 't1', assigneeId: null }),
        buildTask({ id: 't2', assigneeId: 'u1' }),
        buildTask({ id: 't3', assigneeId: null }),
      ];

      const dist = TaskDashboardService.getDistribution(tasks, refDate);

      expect(dist.withoutAssigneeCount).toBe(2);
    });

    it('deve retornar distribuição vazia para lista vazia', () => {
      const dist = TaskDashboardService.getDistribution([], refDate);

      expect(dist.byPriority).toEqual({});
      expect(dist.overdueCount).toBe(0);
      expect(dist.withoutDeadlineCount).toBe(0);
      expect(dist.withoutAssigneeCount).toBe(0);
    });
  });

  describe('getTasksWithoutDeadline', () => {
    it('deve retornar tarefas sem deadline', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: null }),
        buildTask({ id: 't2', deadline: new Date(2026, 2, 15) }),
        buildTask({ id: 't3', deadline: null }),
      ];

      const result = TaskDashboardService.getTasksWithoutDeadline(tasks);

      expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
    });

    it('deve retornar array vazio quando todas têm deadline', () => {
      const tasks = [
        buildTask({ id: 't1', deadline: new Date(2026, 2, 15) }),
      ];

      const result = TaskDashboardService.getTasksWithoutDeadline(tasks);

      expect(result).toEqual([]);
    });
  });

  describe('getUnassignedTasks', () => {
    it('deve retornar tarefas sem responsável', () => {
      const tasks = [
        buildTask({ id: 't1', assigneeId: null }),
        buildTask({ id: 't2', assigneeId: 'u1' }),
        buildTask({ id: 't3', assigneeId: null }),
      ];

      const result = TaskDashboardService.getUnassignedTasks(tasks);

      expect(result.map((t) => t.id)).toEqual(['t1', 't3']);
    });

    it('deve retornar array vazio quando todas têm responsável', () => {
      const tasks = [
        buildTask({ id: 't1', assigneeId: 'u1' }),
      ];

      const result = TaskDashboardService.getUnassignedTasks(tasks);

      expect(result).toEqual([]);
    });
  });

  describe('computeProjectProgress', () => {
    it('deve calcular porcentagem de progresso para cada projeto', () => {
      const projects = [
        buildProject({ id: 'p1', name: 'Proj A', totalTasks: 10, doneTasks: 5 }),
        buildProject({ id: 'p2', name: 'Proj B', totalTasks: 4, doneTasks: 3 }),
      ];

      const progress = TaskDashboardService.computeProjectProgress(projects);
      const items = progress.items;

      expect(items.length).toBe(2);
      expect(items[0].percentage).toBe(50);
      expect(items[1].percentage).toBe(75);
    });

    it('deve ignorar projetos arquivados', () => {
      const projects = [
        buildProject({ id: 'p1', name: 'Ativo', status: 'active' }),
        buildProject({ id: 'p2', name: 'Arquivado', status: 'archived' }),
        buildProject({ id: 'p3', name: 'Completo', status: 'completed' }),
      ];

      const progress = TaskDashboardService.computeProjectProgress(projects);

      expect(progress.items.length).toBe(2);
      expect(progress.items.map((i) => i.projectId)).toEqual(['p1', 'p3']);
    });

    it('deve retornar 0% quando totalTasks é 0', () => {
      const projects = [
        buildProject({ id: 'p1', totalTasks: 0, doneTasks: 0 }),
      ];

      const progress = TaskDashboardService.computeProjectProgress(projects);

      expect(progress.items[0].percentage).toBe(0);
    });

    it('deve incluir deadline do projeto', () => {
      const deadline = new Date(2026, 5, 1);
      const projects = [
        buildProject({ id: 'p1', deadline }),
      ];

      const progress = TaskDashboardService.computeProjectProgress(projects);

      expect(progress.items[0].deadline).toEqual(deadline);
    });

    it('deve retornar progresso vazio para lista vazia', () => {
      const progress = TaskDashboardService.computeProjectProgress([]);

      expect(progress.items).toEqual([]);
    });
  });

  describe('getProjectsByDeadline', () => {
    it('deve ordenar projetos por deadline ascendente', () => {
      const projects = [
        buildProject({ id: 'p2', deadline: new Date(2026, 5, 1) }),
        buildProject({ id: 'p1', deadline: new Date(2026, 3, 1) }),
        buildProject({ id: 'p3', deadline: new Date(2026, 7, 1) }),
      ];

      const result = TaskDashboardService.getProjectsByDeadline(projects);

      expect(result.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    });

    it('deve colocar projetos sem deadline no final', () => {
      const projects = [
        buildProject({ id: 'p1', deadline: null }),
        buildProject({ id: 'p2', deadline: new Date(2026, 3, 1) }),
        buildProject({ id: 'p3', deadline: null }),
      ];

      const result = TaskDashboardService.getProjectsByDeadline(projects);

      expect(result.map((p) => p.id)).toEqual(['p2', 'p1', 'p3']);
    });

    it('deve ignorar projetos arquivados', () => {
      const projects = [
        buildProject({ id: 'p1', status: 'active', deadline: new Date(2026, 3, 1) }),
        buildProject({ id: 'p2', status: 'archived', deadline: new Date(2026, 2, 1) }),
        buildProject({ id: 'p3', status: 'completed', deadline: new Date(2026, 5, 1) }),
      ];

      const result = TaskDashboardService.getProjectsByDeadline(projects);

      expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
    });

    it('deve retornar array vazio para lista vazia', () => {
      const result = TaskDashboardService.getProjectsByDeadline([]);

      expect(result).toEqual([]);
    });
  });
});
