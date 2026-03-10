import { StudyTag } from '../value-objects/StudyTag';
import { InvalidStudyTagNameError } from '../errors/StudyErrors';

describe('StudyTag', () => {
  it('deve criar tag com nome obrigatório', () => {
    const tag = StudyTag.create({ userId: 'user-1', name: 'JavaScript' });
    expect(tag.name).toBe('JavaScript');
    expect(tag.userId).toBe('user-1');
    expect(tag.color).toBeNull();
  });

  it('deve criar tag com cor', () => {
    const tag = StudyTag.create({ userId: 'user-1', name: 'TypeScript', color: '#3178c6' });
    expect(tag.color).toBe('#3178c6');
  });

  it('deve rejeitar nome vazio', () => {
    expect(() => StudyTag.create({ userId: 'user-1', name: '' })).toThrow(InvalidStudyTagNameError);
    expect(() => StudyTag.create({ userId: 'user-1', name: '   ' })).toThrow(InvalidStudyTagNameError);
  });

  it('deve fazer trim no nome', () => {
    const tag = StudyTag.create({ userId: 'user-1', name: '  React  ' });
    expect(tag.name).toBe('React');
  });

  it('tags de estudo devem ser independentes das tags de outros contextos', () => {
    const tag = StudyTag.create({ userId: 'user-1', name: 'Backend' });
    expect(tag).toBeInstanceOf(StudyTag);
  });

  it('deve restaurar tag a partir de dados do banco', () => {
    const tag = StudyTag.restore({ id: 'tag-1', userId: 'user-1', name: 'Go', color: '#00ADD8' });
    expect(tag.id).toBe('tag-1');
    expect(tag.name).toBe('Go');
    expect(tag.color).toBe('#00ADD8');
  });
});
