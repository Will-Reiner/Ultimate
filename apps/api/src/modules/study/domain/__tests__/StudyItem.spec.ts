import { StudyItem, StudyItemType } from '../entities/StudyItem';
import { Progress } from '../value-objects/Progress';
import {
  InvalidStudyItemTitleError,
  InvalidStudyItemTypeError,
  InvalidProgressError,
  InvalidRatingError,
  InvalidStudyStatusTransitionError,
} from '../errors/StudyErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    title: 'Clean Architecture',
    type: 'book' as StudyItemType,
    ...overrides,
  };
}

describe('StudyItem', () => {
  describe('criação', () => {
    it('deve criar item com título e tipo obrigatórios', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.title).toBe('Clean Architecture');
      expect(item.type).toBe('book');
    });

    it('deve rejeitar título vazio', () => {
      expect(() => StudyItem.create(buildValidProps({ title: '' }))).toThrow(InvalidStudyItemTitleError);
      expect(() => StudyItem.create(buildValidProps({ title: '   ' }))).toThrow(InvalidStudyItemTitleError);
    });

    it('deve rejeitar título com mais de 200 caracteres', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => StudyItem.create(buildValidProps({ title: longTitle }))).toThrow(InvalidStudyItemTitleError);
    });

    it('deve fazer trim no título', () => {
      const item = StudyItem.create(buildValidProps({ title: '  Clean Code  ' }));
      expect(item.title).toBe('Clean Code');
    });

    it('deve aceitar tipos: book, course, article, podcast, video, other', () => {
      const types: StudyItemType[] = ['book', 'course', 'article', 'podcast', 'video', 'other'];
      for (const type of types) {
        const item = StudyItem.create(buildValidProps({ type }));
        expect(item.type).toBe(type);
      }
    });

    it('deve rejeitar tipo inválido', () => {
      expect(() => StudyItem.create(buildValidProps({ type: 'invalid' }))).toThrow(InvalidStudyItemTypeError);
    });

    it('deve iniciar com status "backlog"', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.status).toBe('backlog');
    });

    it('deve iniciar com progresso zerado', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.progress.currentValue).toBe(0);
      expect(item.progress.type).toBe('simple');
    });

    it('deve permitir criar sem coleção e URL', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.collectionId).toBeNull();
      expect(item.url).toBeNull();
    });

    it('deve iniciar com rating = null', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.rating).toBeNull();
    });

    it('deve iniciar com startedAt e completedAt = null', () => {
      const item = StudyItem.create(buildValidProps());
      expect(item.startedAt).toBeNull();
      expect(item.completedAt).toBeNull();
    });
  });

  describe('progresso - simple', () => {
    it('deve atualizar status para "in_progress" ao iniciar', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      expect(item.status).toBe('in_progress');
    });

    it('deve registrar startedAt ao mudar para "in_progress" pela primeira vez', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      expect(item.startedAt).toBeInstanceOf(Date);
    });

    it('deve atualizar status para "completed" ao concluir', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      expect(item.status).toBe('completed');
    });

    it('deve registrar completedAt ao concluir', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      expect(item.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('progresso - percentage', () => {
    it('deve criar progresso com currentValue entre 0 e 100', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'percentage', currentValue: 50 });
      item.updateProgress(progress);
      expect(item.progress.currentValue).toBe(50);
    });

    it('deve rejeitar valor fora de 0-100', () => {
      expect(() =>
        Progress.create({ type: 'percentage', currentValue: 101 }),
      ).toThrow(InvalidProgressError);
      expect(() =>
        Progress.create({ type: 'percentage', currentValue: -1 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve atualizar status para "in_progress" quando currentValue > 0', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'percentage', currentValue: 10 });
      item.updateProgress(progress);
      expect(item.status).toBe('in_progress');
    });

    it('deve atualizar status para "completed" quando currentValue = 100', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'percentage', currentValue: 100 });
      item.updateProgress(progress);
      expect(item.status).toBe('completed');
    });
  });

  describe('progresso - chapters', () => {
    it('deve criar progresso com currentValue e totalValue', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'chapters', currentValue: 3, totalValue: 10 });
      item.updateProgress(progress);
      expect(item.progress.currentValue).toBe(3);
      expect(item.progress.totalValue).toBe(10);
    });

    it('deve rejeitar totalValue <= 0', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: 0, totalValue: 0 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve rejeitar currentValue > totalValue', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: 11, totalValue: 10 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve rejeitar currentValue < 0', () => {
      expect(() =>
        Progress.create({ type: 'chapters', currentValue: -1, totalValue: 10 }),
      ).toThrow(InvalidProgressError);
    });

    it('deve calcular porcentagem como currentValue / totalValue', () => {
      const progress = Progress.create({ type: 'chapters', currentValue: 5, totalValue: 20 });
      expect(progress.getPercentage()).toBe(25);
    });

    it('deve atualizar status para "completed" quando currentValue = totalValue', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'chapters', currentValue: 10, totalValue: 10 });
      item.updateProgress(progress);
      expect(item.status).toBe('completed');
    });
  });

  describe('edição', () => {
    it('deve atualizar título e descrição', () => {
      const item = StudyItem.create(buildValidProps());
      item.updateTitle('Novo Título');
      item.updateDescription('Nova descrição');
      expect(item.title).toBe('Novo Título');
      expect(item.description).toBe('Nova descrição');
    });

    it('deve atualizar tipo', () => {
      const item = StudyItem.create(buildValidProps());
      item.updateType('course');
      expect(item.type).toBe('course');
    });

    it('deve atualizar URL', () => {
      const item = StudyItem.create(buildValidProps());
      item.updateUrl('https://example.com');
      expect(item.url).toBe('https://example.com');
    });

    it('deve atualizar progresso', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'percentage', currentValue: 30 });
      item.updateProgress(progress);
      expect(item.progress.currentValue).toBe(30);
    });

    it('deve mover para outra coleção', () => {
      const item = StudyItem.create(buildValidProps());
      item.setCollection('col-123');
      expect(item.collectionId).toBe('col-123');
    });

    it('deve remover de coleção (setar null)', () => {
      const item = StudyItem.create(buildValidProps());
      item.setCollection('col-123');
      item.setCollection(null);
      expect(item.collectionId).toBeNull();
    });

    it('deve adicionar rating ao concluir (1-5)', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      item.setRating(4);
      expect(item.rating).toBe(4);
    });

    it('deve rejeitar rating fora de 1-5', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      expect(() => item.setRating(0)).toThrow(InvalidRatingError);
      expect(() => item.setRating(6)).toThrow(InvalidRatingError);
    });

    it('deve permitir rating apenas quando status = "completed"', () => {
      const item = StudyItem.create(buildValidProps());
      expect(() => item.setRating(3)).toThrow(InvalidRatingError);

      item.start();
      expect(() => item.setRating(3)).toThrow(InvalidRatingError);
    });
  });

  describe('ciclo de vida', () => {
    it('deve marcar como "dropped" (abandonado)', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.drop();
      expect(item.status).toBe('dropped');
    });

    it('deve reabrir item dropped (volta pra in_progress)', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.drop();
      item.reopen();
      expect(item.status).toBe('in_progress');
    });

    it('deve manter progresso ao abandonar', () => {
      const item = StudyItem.create(buildValidProps());
      const progress = Progress.create({ type: 'percentage', currentValue: 50 });
      item.updateProgress(progress);
      item.drop();
      expect(item.progress.currentValue).toBe(50);
    });

    it('deve permitir recomeçar item completed', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      item.restart();
      expect(item.status).toBe('in_progress');
    });

    it('deve limpar completedAt ao recomeçar', () => {
      const item = StudyItem.create(buildValidProps());
      item.start();
      item.complete();
      expect(item.completedAt).not.toBeNull();
      item.restart();
      expect(item.completedAt).toBeNull();
    });
  });

  describe('restore', () => {
    it('deve restaurar item a partir dos dados do banco', () => {
      const now = new Date();
      const item = StudyItem.restore({
        id: 'item-1',
        userId: 'user-1',
        title: 'DDD',
        description: 'Domain-Driven Design',
        type: 'book',
        url: null,
        progress: Progress.restore({ type: 'simple', currentValue: 0 }),
        status: 'backlog',
        rating: null,
        collectionId: null,
        startedAt: null,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      expect(item.id).toBe('item-1');
      expect(item.title).toBe('DDD');
      expect(item.status).toBe('backlog');
    });
  });
});
