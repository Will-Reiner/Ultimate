import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { GetTagsUseCase } from '../application/use-cases/GetTagsUseCase';
import { CreateTagUseCase } from '../application/use-cases/CreateTagUseCase';
import { DeleteTagUseCase } from '../application/use-cases/DeleteTagUseCase';
import { CreateTagDto } from './dtos/create-tag.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; email: string; name: string };
}

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(
    private readonly getTagsUC: GetTagsUseCase,
    private readonly createTagUC: CreateTagUseCase,
    private readonly deleteTagUC: DeleteTagUseCase,
  ) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.getTagsUC.execute(req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTagDto, @Request() req: AuthenticatedRequest) {
    return this.createTagUC.execute(req.user.id, dto.name, dto.color);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.deleteTagUC.execute(id, req.user.id);
  }
}
