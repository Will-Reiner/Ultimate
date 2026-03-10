import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/presentation/auth.module';
import { TAG_REPOSITORY } from '../domain/repositories/ITagRepository';
import { TagRepositoryImpl } from '../infrastructure/repositories/TagRepositoryImpl';
import { GetTagsUseCase } from '../application/use-cases/GetTagsUseCase';
import { CreateTagUseCase } from '../application/use-cases/CreateTagUseCase';
import { DeleteTagUseCase } from '../application/use-cases/DeleteTagUseCase';
import { TagsController } from './tags.controller';

@Module({
  imports: [AuthModule],
  providers: [
    { provide: TAG_REPOSITORY, useClass: TagRepositoryImpl },
    GetTagsUseCase,
    CreateTagUseCase,
    DeleteTagUseCase,
  ],
  controllers: [TagsController],
  exports: [TAG_REPOSITORY],
})
export class TagModule {}
