import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/presentation/auth.module';
import { HABIT_REPOSITORY } from '../domain/repositories/IHabitRepository';
import { HabitRepositoryImpl } from '../infrastructure/repositories/HabitRepositoryImpl';
import { GetHabitsUseCase } from '../application/use-cases/GetHabitsUseCase';
import { GetHabitUseCase } from '../application/use-cases/GetHabitUseCase';
import { CreateHabitUseCase } from '../application/use-cases/CreateHabitUseCase';
import { UpdateHabitUseCase } from '../application/use-cases/UpdateHabitUseCase';
import { DeleteHabitUseCase } from '../application/use-cases/DeleteHabitUseCase';
import { GetEntriesUseCase } from '../application/use-cases/GetEntriesUseCase';
import { CreateEntryUseCase } from '../application/use-cases/CreateEntryUseCase';
import { PauseHabitUseCase } from '../application/use-cases/PauseHabitUseCase';
import { ArchiveHabitUseCase } from '../application/use-cases/ArchiveHabitUseCase';
import { ReactivateHabitUseCase } from '../application/use-cases/ReactivateHabitUseCase';
import { GetStreakUseCase } from '../application/use-cases/GetStreakUseCase';
import { EvaluateGoalUseCase } from '../application/use-cases/EvaluateGoalUseCase';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';

@Module({
  imports: [AuthModule],
  providers: [
    { provide: HABIT_REPOSITORY, useClass: HabitRepositoryImpl },
    GetHabitsUseCase,
    GetHabitUseCase,
    CreateHabitUseCase,
    UpdateHabitUseCase,
    DeleteHabitUseCase,
    GetEntriesUseCase,
    CreateEntryUseCase,
    PauseHabitUseCase,
    ArchiveHabitUseCase,
    ReactivateHabitUseCase,
    GetStreakUseCase,
    EvaluateGoalUseCase,
    HabitsService,
  ],
  controllers: [HabitsController],
})
export class HabitsModule {}
