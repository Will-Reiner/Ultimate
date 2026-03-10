import { Module } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../domain/repositories/ICategoryRepository';
import { CategoryRepositoryImpl } from '../infrastructure/repositories/CategoryRepositoryImpl';
import { GetCategoriesUseCase } from '../application/use-cases/GetCategoriesUseCase';
import { CategoriesController } from './categories.controller';

@Module({
  providers: [
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepositoryImpl },
    GetCategoriesUseCase,
  ],
  controllers: [CategoriesController],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule {}
