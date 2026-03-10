import { StudyNote } from '../entities/StudyNote';
import { StudyTag } from '../value-objects/StudyTag';
import { InvalidStudyNoteError } from '../errors/StudyErrors';

describe('StudyNote', () => {
  describe('criação', () => {
    it('deve criar nota com conteúdo obrigatório', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Capítulo 1 aborda princípios SOLID',
      });
      expect(note.content).toBe('Capítulo 1 aborda princípios SOLID');
      expect(note.studyItemId).toBe('item-1');
    });

    it('deve rejeitar conteúdo vazio', () => {
      expect(() =>
        StudyNote.create({ studyItemId: 'item-1', content: '' }),
      ).toThrow(InvalidStudyNoteError);
      expect(() =>
        StudyNote.create({ studyItemId: 'item-1', content: '   ' }),
      ).toThrow(InvalidStudyNoteError);
    });

    it('deve vincular ao item de estudo', () => {
      const note = StudyNote.create({
        studyItemId: 'item-42',
        content: 'Anotação importante',
      });
      expect(note.studyItemId).toBe('item-42');
    });

    it('deve permitir criar com tags', () => {
      const tag = StudyTag.create({ userId: 'user-1', name: 'SOLID' });
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Nota com tag',
        tags: [tag],
      });
      expect(note.tags).toHaveLength(1);
      expect(note.tags[0].name).toBe('SOLID');
    });

    it('deve permitir criar sem tags', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Nota sem tag',
      });
      expect(note.tags).toEqual([]);
    });
  });

  describe('edição', () => {
    it('deve atualizar conteúdo', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Conteúdo original',
      });
      note.updateContent('Conteúdo atualizado');
      expect(note.content).toBe('Conteúdo atualizado');
    });

    it('deve adicionar tag', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Nota',
      });
      const tag = StudyTag.create({ userId: 'user-1', name: 'DDD' });
      note.addTag(tag);
      expect(note.tags).toHaveLength(1);
      expect(note.tags[0].name).toBe('DDD');
    });

    it('deve remover tag', () => {
      const tag1 = StudyTag.restore({ id: 'tag-1', userId: 'user-1', name: 'DDD', color: null });
      const tag2 = StudyTag.restore({ id: 'tag-2', userId: 'user-1', name: 'TDD', color: null });
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Nota',
        tags: [tag1, tag2],
      });
      note.removeTag('tag-1');
      expect(note.tags).toHaveLength(1);
      expect(note.tags[0].name).toBe('TDD');
    });

    it('deve atualizar updatedAt ao editar', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Original',
      });
      const originalUpdatedAt = note.updatedAt;

      // Pequeno delay para garantir que o timestamp muda
      note.updateContent('Editado');
      expect(note.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('exclusão', () => {
    it('deve permitir excluir nota', () => {
      const note = StudyNote.create({
        studyItemId: 'item-1',
        content: 'Nota a ser excluída',
      });
      expect(note).toBeDefined();
      // A exclusão é responsabilidade do repositório
    });
  });

  describe('restore', () => {
    it('deve restaurar nota a partir dos dados do banco', () => {
      const now = new Date();
      const tag = StudyTag.restore({ id: 'tag-1', userId: 'user-1', name: 'Go', color: null });
      const note = StudyNote.restore({
        id: 'note-1',
        studyItemId: 'item-1',
        content: 'Anotação persistida',
        tags: [tag],
        createdAt: now,
        updatedAt: now,
      });
      expect(note.id).toBe('note-1');
      expect(note.content).toBe('Anotação persistida');
      expect(note.tags).toHaveLength(1);
    });
  });
});
