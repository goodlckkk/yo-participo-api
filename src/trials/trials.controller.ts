import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrialsService } from './trials.service';
import { TrialMatchingService } from './trial-matching.service';
import { EmailsService } from '../emails/emails.service';
import { CreateTrialDto } from './dto/create-trial.dto';
import { UpdateTrialDto } from './dto/update-trial.dto';
import { CreateTrialRequestDto } from './dto/create-trial-request.dto';
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
    private readonly emailsService: EmailsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'DOCTOR')
  create(@Body() createTrialDto: CreateTrialDto) {
    return this.trialsService.create(createTrialDto);
  }

  @Post('request')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('INSTITUTION')
  async requestTrial(@Body() createTrialRequestDto: CreateTrialRequestDto, @Req() req: any) {
    const user = req.user;
    
    try {
      // Enviar email al administrador con la solicitud
      await this.emailsService.sendTrialRequestEmail(
        'admin@yoparticipo.cl', // Email del admin (debería venir de configuración)
        {
          institutionName: user.institutionName || user.institution?.nombre || 'Institución',
          contactEmail: user.email,
          trialTitle: createTrialRequestDto.title,
          trialDescription: createTrialRequestDto.description,
          additionalNotes: createTrialRequestDto.additionalNotes,
          requestDate: new Date().toLocaleDateString('es-CL')
        }
      );

      return {
        success: true,
        message: 'Solicitud de estudio recibida. El administrador será notificado.',
        request: createTrialRequestDto
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar la solicitud. Por favor, intente nuevamente.',
        error: error.message
      };
    }
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
