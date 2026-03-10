import { Inject, Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { ITagRepository, TAG_REPOSITORY } from '../../domain/repositories/ITagRepository';
import { Tag } from '../../domain/entities/Tag';
import { TagResponseDto, toTagResponseDto } from '../dtos/TagResponseDto';
import { InvalidTagNameError, InvalidTagColorError, DuplicateTagError } from '../../domain/errors/TagErrors';

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository,
  ) {}

  async execute(userId: string, name: string, color: string): Promise<TagResponseDto> {
    try {
      Tag.create({ userId, name, color });
    } catch (err) {
      if (err instanceof InvalidTagNameError || err instanceof InvalidTagColorError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    const existing = await this.tagRepository.findByName(userId, name.trim());
    if (existing) {
      throw new ConflictException(new DuplicateTagError().message);
    }

    const tag = await this.tagRepository.create({ userId, name: name.trim(), color });
    return toTagResponseDto(tag);
  }
}
