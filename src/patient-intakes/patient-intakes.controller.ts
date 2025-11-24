import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PatientIntakesService } from './patient-intakes.service';
import { CreatePatientIntakeDto } from './dto/create-patient-intake.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('patient-intakes')
export class PatientIntakesController {
  constructor(private readonly patientIntakesService: PatientIntakesService) {}

  @Post()
  create(@Body() createPatientIntakeDto: CreatePatientIntakeDto) {
    return this.patientIntakesService.create(createPatientIntakeDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.patientIntakesService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('trial/:trialId')
  findByTrial(@Param('trialId') trialId: string) {
    return this.patientIntakesService.findByTrial(trialId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientIntakesService.findOne(id);
  }
}
