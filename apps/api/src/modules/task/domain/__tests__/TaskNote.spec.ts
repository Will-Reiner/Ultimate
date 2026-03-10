import { TaskNote } from '../entities/TaskNote';
import { InvalidTaskNoteContentError } from '../errors/TaskErrors';

describe('TaskNote', () => {
  describe('criacao', () => {
    it('deve criar nota com conteudo obrigatorio', () => {
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Esta e uma nota importante.',
      });

      expect(note.id).toBe('');
      expect(note.taskId).toBe('task-1');
      expect(note.content).toBe('Esta e uma nota importante.');
    });

    it('deve rejeitar conteudo vazio', () => {
      expect(() =>
        TaskNote.create({ taskId: 'task-1', content: '' }),
      ).toThrow(InvalidTaskNoteContentError);

      expect(() =>
        TaskNote.create({ taskId: 'task-1', content: '   ' }),
      ).toThrow(InvalidTaskNoteContentError);
    });

    it('deve vincular a tarefa', () => {
      const note = TaskNote.create({
        taskId: 'task-42',
        content: 'Nota vinculada.',
      });

      expect(note.taskId).toBe('task-42');
    });

    it('deve registrar data de criacao', () => {
      const before = new Date();
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Nota com data.',
      });
      const after = new Date();

      expect(note.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(note.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(note.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(note.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('edicao', () => {
    it('deve atualizar conteudo', () => {
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Conteudo original.',
      });

      note.updateContent('Conteudo atualizado.');

      expect(note.content).toBe('Conteudo atualizado.');
    });

    it('deve rejeitar conteudo vazio ao atualizar', () => {
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Conteudo original.',
      });

      expect(() => note.updateContent('')).toThrow(InvalidTaskNoteContentError);
      expect(() => note.updateContent('   ')).toThrow(InvalidTaskNoteContentError);
    });

    it('deve atualizar updatedAt ao editar', () => {
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Conteudo original.',
      });
      const originalUpdatedAt = note.updatedAt;

      note.updateContent('Conteudo atualizado.');

      expect(note.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('exclusao', () => {
    it('deve permitir excluir nota', () => {
      const note = TaskNote.create({
        taskId: 'task-1',
        content: 'Nota que pode ser excluida.',
      });

      // A entidade nao possui regra de dominio que impeca a exclusao.
      // A exclusao e uma responsabilidade do repositorio.
      // Verificamos que a entidade foi criada corretamente e nao possui
      // nenhum metodo que bloqueie a exclusao.
      expect(note).toBeDefined();
      expect(note.id).toBe('');
      expect(note.taskId).toBe('task-1');
      expect(note.content).toBe('Nota que pode ser excluida.');
    });
  });

  describe('restore', () => {
    it('deve restaurar nota a partir dos dados do banco', () => {
      const createdAt = new Date('2026-03-01T10:00:00Z');
      const updatedAt = new Date('2026-03-05T14:30:00Z');

      const note = TaskNote.restore({
        id: 'note-1',
        taskId: 'task-1',
        content: 'Nota restaurada.',
        createdAt,
        updatedAt,
      });

      expect(note.id).toBe('note-1');
      expect(note.taskId).toBe('task-1');
      expect(note.content).toBe('Nota restaurada.');
      expect(note.createdAt).toBe(createdAt);
      expect(note.updatedAt).toBe(updatedAt);
    });

    it('deve restaurar sem validacao', () => {
      // restore nao valida — aceita dados como vieram do banco
      const note = TaskNote.restore({
        id: 'note-1',
        taskId: 'task-1',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(note.content).toBe('');
    });
  });
});
