import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  findAll(@Query('institutionId') institutionId?: string) {
    return this.patientIntakesService.findAll(institutionId);
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

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.patientIntakesService.update(id, updateData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientIntakesService.remove(id);
  }

  /**
   * Elimina PERMANENTEMENTE un paciente de la base de datos
   * ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/permanent')
  hardDelete(@Param('id') id: string) {
    return this.patientIntakesService.hardDelete(id);
  }

  /**
   * Endpoint para exportar datos de pacientes en formato JSON (para CSV/Excel)
   * Soporta filtrado por institución
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('export/data')
  async exportData(@Query('institutionId') institutionId?: string) {
    const exportData =
      await this.patientIntakesService.generateExportData(institutionId);
    return {
      success: true,
      data: exportData,
      total: exportData.length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Elimina PERMANENTEMENTE todos los pacientes marcados como DISCARDED
   * ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('discarded/purge')
  hardDeleteAllDiscarded() {
    return this.patientIntakesService.hardDeleteAllDiscarded();
  }
}
