import { Inject, Injectable } from '@nestjs/common';
import { ICategoryRepository, CATEGORY_REPOSITORY } from '../../domain/repositories/ICategoryRepository';
import { CategoryResponseDto, toCategoryResponseDto } from '../dtos/CategoryResponseDto';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map(toCategoryResponseDto);
  }
}
