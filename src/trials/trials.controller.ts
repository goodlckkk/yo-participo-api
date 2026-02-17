import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrialsService } from './trials.service';
import { TrialMatchingService } from './trial-matching.service';
import { CreateTrialDto } from './dto/create-trial.dto';
import { UpdateTrialDto } from './dto/update-trial.dto';
import { HttpStatus } from '@nestjs/common';
import { TrialStatus } from './entities/trial.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('trials')
export class TrialsController {
  constructor(
    private readonly trialsService: TrialsService,
    private readonly trialMatchingService: TrialMatchingService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() createTrialDto: CreateTrialDto) {
    return this.trialsService.create(createTrialDto);
  }

  @Get()
  // Endpoint público - no requiere autenticación para ver ensayos
  findAll(@Query() query: PaginationDto & { status?: TrialStatus }) {
    const { page, limit, status } = query;
    return this.trialsService.findAll(status, page, limit);
  }

  @Get('suggestions/:patientId')
  @UseGuards(AuthGuard('jwt'))
  async getSuggestionsForPatient(@Param('patientId') patientId: string) {
    return this.trialMatchingService.getSuggestionsForPatient(patientId);
  }

  @Get(':id')
  // Endpoint público - no requiere autenticación para ver detalle
  findOne(@Param('id') id: string) {
    return this.trialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  update(@Param('id') id: string, @Body() updateTrialDto: UpdateTrialDto) {
    return this.trialsService.update(id, updateTrialDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.trialsService.remove(id);
  }
}
