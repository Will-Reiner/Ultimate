import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITagRepository, TAG_REPOSITORY } from '../../domain/repositories/ITagRepository';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const tag = await this.tagRepository.findById(id, userId);
    if (!tag) throw new NotFoundException('Tag não encontrada.');
    await this.tagRepository.remove(id);
  }
}
