import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { GetTagsUseCase } from '../use-cases/GetTagsUseCase';
import { CreateTagUseCase } from '../use-cases/CreateTagUseCase';
import { DeleteTagUseCase } from '../use-cases/DeleteTagUseCase';
import { Tag } from '../../domain/entities/Tag';
import { ITagRepository } from '../../domain/repositories/ITagRepository';

function createMockTagRepo(): jest.Mocked<ITagRepository> {
  return {
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };
}

function makeTag(id = 'tag-1', name = 'Fitness', color = '#ff5500'): Tag {
  return Tag.restore({ id, userId: 'user-1', name, color });
}

describe('GetTagsUseCase', () => {
  it('deve retornar tags do usuário', async () => {
    const repo = createMockTagRepo();
    repo.findAllByUser.mockResolvedValue([makeTag(), makeTag('tag-2', 'Saúde', '#00ff00')]);
    const uc = new GetTagsUseCase(repo);

    const result = await uc.execute('user-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 'tag-1', name: 'Fitness', color: '#ff5500' });
    expect(repo.findAllByUser).toHaveBeenCalledWith('user-1');
  });

  it('deve retornar array vazio se não há tags', async () => {
    const repo = createMockTagRepo();
    repo.findAllByUser.mockResolvedValue([]);
    const uc = new GetTagsUseCase(repo);

    const result = await uc.execute('user-1');

    expect(result).toEqual([]);
  });
});

describe('CreateTagUseCase', () => {
  it('deve criar tag com dados válidos', async () => {
    const repo = createMockTagRepo();
    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue(makeTag());
    const uc = new CreateTagUseCase(repo);

    const result = await uc.execute('user-1', 'Fitness', '#ff5500');

    expect(result).toEqual({ id: 'tag-1', name: 'Fitness', color: '#ff5500' });
    expect(repo.create).toHaveBeenCalledWith({ userId: 'user-1', name: 'Fitness', color: '#ff5500' });
  });

  it('deve rejeitar nome vazio com BadRequestException', async () => {
    const repo = createMockTagRepo();
    const uc = new CreateTagUseCase(repo);

    await expect(uc.execute('user-1', '', '#ff5500')).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar cor inválida com BadRequestException', async () => {
    const repo = createMockTagRepo();
    const uc = new CreateTagUseCase(repo);

    await expect(uc.execute('user-1', 'Fitness', 'red')).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar tag duplicada com ConflictException', async () => {
    const repo = createMockTagRepo();
    repo.findByName.mockResolvedValue(makeTag());
    const uc = new CreateTagUseCase(repo);

    await expect(uc.execute('user-1', 'Fitness', '#ff5500')).rejects.toThrow(ConflictException);
  });
});

describe('DeleteTagUseCase', () => {
  it('deve deletar tag existente', async () => {
    const repo = createMockTagRepo();
    repo.findById.mockResolvedValue(makeTag());
    const uc = new DeleteTagUseCase(repo);

    await uc.execute('tag-1', 'user-1');

    expect(repo.remove).toHaveBeenCalledWith('tag-1');
  });

  it('deve lançar NotFoundException se tag não existe', async () => {
    const repo = createMockTagRepo();
    repo.findById.mockResolvedValue(null);
    const uc = new DeleteTagUseCase(repo);

    await expect(uc.execute('tag-1', 'user-1')).rejects.toThrow(NotFoundException);
  });
});
