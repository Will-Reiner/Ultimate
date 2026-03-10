import { TagFrequency } from '../value-objects/TagFrequency';

describe('TagFrequency', () => {
  it('deve ordenar tags por contagem decrescente', () => {
    const freq = TagFrequency.create([
      { tagId: '1', tagName: 'ansiedade', count: 3 },
      { tagId: '2', tagName: 'sono', count: 7 },
      { tagId: '3', tagName: 'exercício', count: 5 },
    ]);

    const tags = freq.tags;
    expect(tags[0]).toEqual({ tagId: '2', tagName: 'sono', count: 7 });
    expect(tags[1]).toEqual({ tagId: '3', tagName: 'exercício', count: 5 });
    expect(tags[2]).toEqual({ tagId: '1', tagName: 'ansiedade', count: 3 });
    expect(freq.toJSON()).toEqual({
      tags: [
        { tagId: '2', tagName: 'sono', count: 7 },
        { tagId: '3', tagName: 'exercício', count: 5 },
        { tagId: '1', tagName: 'ansiedade', count: 3 },
      ],
    });
  });

  it('deve funcionar com array vazio', () => {
    const freq = TagFrequency.create([]);

    expect(freq.tags).toEqual([]);
    expect(freq.toJSON()).toEqual({ tags: [] });
  });
});
