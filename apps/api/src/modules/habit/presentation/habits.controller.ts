import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dtos/create-habit.dto';
import { UpdateHabitDto } from './dtos/update-habit.dto';
import { CreateEntryDto } from './dtos/create-entry.dto';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; email: string; name: string };
}

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(
    @Query('status') status: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.findAll(req.user.id, status as any);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.findOne(id, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHabitDto, @Request() req: AuthenticatedRequest) {
    return this.habitsService.create(req.user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.update(id, req.user.id, dto);
  }

  @Patch(':id/pause')
  @HttpCode(HttpStatus.OK)
  pause(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.pause(id, req.user.id);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  archive(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.archive(id, req.user.id);
  }

  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  reactivate(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.reactivate(id, req.user.id);
  }

  @Patch(':id/goal/evaluate')
  @HttpCode(HttpStatus.OK)
  evaluateGoal(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.evaluateGoal(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.remove(id, req.user.id);
  }

  @Get(':id/streak')
  getStreak(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.getStreak(id, req.user.id);
  }

  @Get(':id/entries')
  getEntries(
    @Param('id') id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('entry_type') entryType: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return this.habitsService.listEntries(
      id,
      req.user.id,
      from || thirtyDaysAgo,
      to || today,
      entryType,
    );
  }

  @Post(':id/entries')
  @HttpCode(HttpStatus.CREATED)
  createEntry(
    @Param('id') id: string,
    @Body() dto: CreateEntryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.addEntry(id, req.user.id, dto);
  }
}
