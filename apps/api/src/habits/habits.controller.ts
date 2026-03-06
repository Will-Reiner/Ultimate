import {
  Controller,
  Get,
  Post,
  Put,
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
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { id: string; email: string };
}

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.habitsService.findAll(req.user.id);
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.remove(id, req.user.id);
  }

  @Get(':id/entries')
  getEntries(
    @Param('id') id: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.habitsService.getEntries(
      id,
      req.user.id,
      from ? new Date(from) : thirtyDaysAgo,
      to ? new Date(to) : new Date(),
    );
  }

  @Post(':id/entries')
  @HttpCode(HttpStatus.CREATED)
  createEntry(
    @Param('id') id: string,
    @Body() dto: CreateEntryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.createEntry(id, req.user.id, dto);
  }
}
