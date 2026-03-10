import { Inject, Injectable } from '@nestjs/common';
import { ITagRepository, TAG_REPOSITORY } from '../../domain/repositories/ITagRepository';
import { TagResponseDto, toTagResponseDto } from '../dtos/TagResponseDto';

@Injectable()
export class GetTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
  ) {}

  async execute(userId: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findAllByUser(userId);
    return tags.map(toTagResponseDto);
  }
}
