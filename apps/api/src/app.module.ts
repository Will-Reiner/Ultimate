import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/presentation/auth.module';
import { HabitsModule } from './modules/habit/presentation/habits.module';
import { CategoryModule } from './modules/category/presentation/category.module';
import { TagModule } from './modules/tag/presentation/tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HabitsModule,
    CategoryModule,
    TagModule,
  ],
})
export class AppModule {}
