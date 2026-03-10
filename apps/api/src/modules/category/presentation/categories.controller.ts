import { Controller, Get } from '@nestjs/common';
import { GetCategoriesUseCase } from '../application/use-cases/GetCategoriesUseCase';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly getCategoriesUC: GetCategoriesUseCase) {}

  @Get()
  findAll() {
    return this.getCategoriesUC.execute();
  }
}
