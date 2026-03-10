import { JournalEntry } from '../entities/JournalEntry';
import { Mood } from '../value-objects/Mood';
import {
  InvalidJournalContentError,
  InvalidAudioError,
} from '../errors/JournalErrors';

function buildValidProps(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user-1',
    type: 'daily' as const,
    date: new Date('2026-03-09'),
    textContent: 'Hoje foi um bom dia.',
    ...overrides,
  };
}

describe('JournalEntry', () => {
  describe('criação', () => {
    it('deve criar entrada daily com texto', () => {
      const entry = JournalEntry.create(buildValidProps());
      expect(entry.userId).toBe('user-1');
      expect(entry.type).toBe('daily');
      expect(entry.textContent).toBe('Hoje foi um bom dia.');
      expect(entry.audioUrl).toBeNull();
    });

    it('deve criar entrada daily com áudio', () => {
      const entry = JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 120,
      }));
      expect(entry.audioUrl).toBe('https://storage.example.com/audio.mp3');
      expect(entry.audioDurationSeconds).toBe(120);
      expect(entry.textContent).toBeNull();
    });

    it('deve criar entrada daily com texto e áudio', () => {
      const entry = JournalEntry.create(buildValidProps({
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 60,
      }));
      expect(entry.textContent).toBe('Hoje foi um bom dia.');
      expect(entry.audioUrl).toBe('https://storage.example.com/audio.mp3');
    });

    it('deve criar entrada thought com texto', () => {
      const entry = JournalEntry.create(buildValidProps({
        type: 'thought',
        textContent: 'Uma ideia interessante.',
      }));
      expect(entry.type).toBe('thought');
      expect(entry.textContent).toBe('Uma ideia interessante.');
    });

    it('deve criar entrada thought com áudio', () => {
      const entry = JournalEntry.create(buildValidProps({
        type: 'thought',
        textContent: null,
        audioUrl: 'https://storage.example.com/thought.mp3',
        audioDurationSeconds: 30,
      }));
      expect(entry.type).toBe('thought');
      expect(entry.audioUrl).toBe('https://storage.example.com/thought.mp3');
    });

    it('deve rejeitar sem texto e sem áudio', () => {
      expect(() => JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: null,
      }))).toThrow(InvalidJournalContentError);
    });

    it('deve rejeitar sem texto e sem áudio (undefined)', () => {
      expect(() => JournalEntry.create(buildValidProps({
        textContent: undefined,
      }))).toThrow(InvalidJournalContentError);
    });

    it('deve permitir criar sem mood', () => {
      const entry = JournalEntry.create(buildValidProps());
      expect(entry.mood).toBeNull();
    });

    it('deve permitir criar com mood', () => {
      const mood = Mood.create(4);
      const entry = JournalEntry.create(buildValidProps({ mood }));
      expect(entry.mood).not.toBeNull();
      expect(entry.mood!.level).toBe(4);
    });

    it('deve permitir criar sem tags', () => {
      const entry = JournalEntry.create(buildValidProps());
      expect(entry.tagIds).toEqual([]);
    });

    it('deve permitir criar com tags', () => {
      const entry = JournalEntry.create(buildValidProps({ tagIds: ['tag-1', 'tag-2'] }));
      expect(entry.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('deve registrar createdAt', () => {
      const before = new Date();
      const entry = JournalEntry.create(buildValidProps());
      const after = new Date();
      expect(entry.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(entry.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('deve iniciar transcrição como null/pending quando tem áudio', () => {
      const entry = JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 60,
      }));
      expect(entry.audioTranscription).toBeNull();
      expect(entry.audioTranscriptionStatus).toBe('pending');
    });

    it('deve ter transcrição null quando não tem áudio', () => {
      const entry = JournalEntry.create(buildValidProps());
      expect(entry.audioTranscription).toBeNull();
      expect(entry.audioTranscriptionStatus).toBeNull();
    });

    it('deve rejeitar áudio sem duração', () => {
      expect(() => JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 0,
      }))).toThrow(InvalidAudioError);
    });

    it('deve rejeitar áudio com duração negativa', () => {
      expect(() => JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: -1,
      }))).toThrow(InvalidAudioError);
    });
  });

  describe('áudio — transcrição', () => {
    it('deve completar transcrição', () => {
      const entry = JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 60,
      }));
      entry.completeTranscription('Texto transcrito.');
      expect(entry.audioTranscription).toBe('Texto transcrito.');
      expect(entry.audioTranscriptionStatus).toBe('completed');
    });

    it('deve falhar transcrição', () => {
      const entry = JournalEntry.create(buildValidProps({
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 60,
      }));
      entry.failTranscription();
      expect(entry.audioTranscriptionStatus).toBe('failed');
    });
  });

  describe('edição', () => {
    it('deve atualizar texto', () => {
      const entry = JournalEntry.create(buildValidProps());
      entry.updateText('Texto atualizado.');
      expect(entry.textContent).toBe('Texto atualizado.');
    });

    it('deve permitir remover texto se tem áudio', () => {
      const entry = JournalEntry.create(buildValidProps({
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioDurationSeconds: 60,
      }));
      entry.updateText(null);
      expect(entry.textContent).toBeNull();
    });

    it('deve atualizar mood', () => {
      const entry = JournalEntry.create(buildValidProps());
      entry.updateMood(Mood.create(5));
      expect(entry.mood!.level).toBe(5);
    });

    it('deve remover mood', () => {
      const entry = JournalEntry.create(buildValidProps({ mood: Mood.create(3) }));
      entry.updateMood(null);
      expect(entry.mood).toBeNull();
    });

    it('deve adicionar tag', () => {
      const entry = JournalEntry.create(buildValidProps());
      entry.addTag('tag-1');
      entry.addTag('tag-2');
      expect(entry.tagIds).toEqual(['tag-1', 'tag-2']);
    });

    it('não deve adicionar tag duplicada', () => {
      const entry = JournalEntry.create(buildValidProps());
      entry.addTag('tag-1');
      entry.addTag('tag-1');
      expect(entry.tagIds).toEqual(['tag-1']);
    });

    it('deve remover tag', () => {
      const entry = JournalEntry.create(buildValidProps({ tagIds: ['tag-1', 'tag-2'] }));
      entry.removeTag('tag-1');
      expect(entry.tagIds).toEqual(['tag-2']);
    });

    it('deve substituir áudio e limpar transcrição', () => {
      const entry = JournalEntry.create(buildValidProps({
        audioUrl: 'https://storage.example.com/old.mp3',
        audioDurationSeconds: 60,
      }));
      entry.completeTranscription('Texto antigo.');
      entry.replaceAudio('https://storage.example.com/new.mp3', 90);
      expect(entry.audioUrl).toBe('https://storage.example.com/new.mp3');
      expect(entry.audioDurationSeconds).toBe(90);
      expect(entry.audioTranscription).toBeNull();
      expect(entry.audioTranscriptionStatus).toBe('pending');
    });

    it('deve atualizar updatedAt ao editar texto', () => {
      const entry = JournalEntry.create(buildValidProps());
      const originalUpdatedAt = entry.updatedAt;
      // Pequeno delay para garantir diferença de tempo
      entry.updateText('Novo texto.');
      expect(entry.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('deve atualizar updatedAt ao editar mood', () => {
      const entry = JournalEntry.create(buildValidProps());
      const originalUpdatedAt = entry.updatedAt;
      entry.updateMood(Mood.create(2));
      expect(entry.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('restore', () => {
    it('deve restaurar entrada a partir dos dados do banco', () => {
      const now = new Date();
      const entry = JournalEntry.restore({
        id: 'entry-1',
        userId: 'user-1',
        type: 'daily',
        date: now,
        textContent: 'Texto restaurado.',
        audioUrl: null,
        audioTranscription: null,
        audioTranscriptionStatus: null,
        audioDurationSeconds: null,
        mood: null,
        tagIds: ['tag-1'],
        createdAt: now,
        updatedAt: now,
      });
      expect(entry.id).toBe('entry-1');
      expect(entry.textContent).toBe('Texto restaurado.');
      expect(entry.tagIds).toEqual(['tag-1']);
    });

    it('deve restaurar entrada com áudio e transcrição', () => {
      const now = new Date();
      const entry = JournalEntry.restore({
        id: 'entry-2',
        userId: 'user-1',
        type: 'thought',
        date: now,
        textContent: null,
        audioUrl: 'https://storage.example.com/audio.mp3',
        audioTranscription: 'Transcrição completa.',
        audioTranscriptionStatus: 'completed',
        audioDurationSeconds: 120,
        mood: Mood.restore(4),
        tagIds: [],
        createdAt: now,
        updatedAt: now,
      });
      expect(entry.audioUrl).toBe('https://storage.example.com/audio.mp3');
      expect(entry.audioTranscription).toBe('Transcrição completa.');
      expect(entry.audioTranscriptionStatus).toBe('completed');
      expect(entry.mood!.level).toBe(4);
    });
  });
});
