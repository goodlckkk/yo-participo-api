import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientIntake } from './entities/patient-intake.entity';
import { CreatePatientIntakeDto } from './dto/create-patient-intake.dto';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class PatientIntakesService {
  private readonly logger = new Logger(PatientIntakesService.name);

  constructor(
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
    private readonly emailsService: EmailsService,
  ) {}

  async create(createPatientIntakeDto: CreatePatientIntakeDto) {
    const intake = this.patientIntakeRepository.create({
      ...createPatientIntakeDto,
      direccion: createPatientIntakeDto.direccion ?? null,
      medicamentosActuales: createPatientIntakeDto.medicamentosActuales ?? null,
      alergias: createPatientIntakeDto.alergias ?? null,
      cirugiasPrevias: createPatientIntakeDto.cirugiasPrevias ?? null,
    });

    const savedIntake = await this.patientIntakeRepository.save(intake);

    try {
      const patientName = `${savedIntake.nombres} ${savedIntake.apellidos}`;
      await this.emailsService.sendPatientConfirmationEmail(savedIntake.email, patientName);
      this.logger.log(`📧 Correo de confirmación enviado a ${savedIntake.email}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de confirmación: ${error.message}`);
    }

    return savedIntake;
  }

  async findAll() {
    return this.patientIntakeRepository.find({
      relations: ['trial', 'referralResearchSite'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const intake = await this.patientIntakeRepository.findOne({
      where: { id },
      relations: ['trial', 'referralResearchSite'],
    });

    if (!intake) {
      throw new NotFoundException(`Solicitud de paciente con ID "${id}" no encontrada.`);
    }

    return intake;
  }

  async findByTrial(trialId: string) {
    return this.patientIntakeRepository.find({
      where: { trialId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualiza un paciente (por ejemplo, asignar a un ensayo)
   */
  async update(id: string, updateData: Partial<PatientIntake>) {
    const intake = await this.findOne(id);
    
    // Actualizar los campos proporcionados
    Object.assign(intake, updateData);
    
    return this.patientIntakeRepository.save(intake);
  }

  /**
   * Elimina un paciente del sistema (SOFT DELETE)
   * En lugar de eliminar físicamente, marca el paciente como DISCARDED
   * Esto mantiene el historial y la integridad referencial
   */
  async remove(id: string) {
    const intake = await this.findOne(id);
    
    // Soft delete: cambiar estado a DISCARDED en lugar de eliminar
    intake.status = 'DISCARDED' as any;
    
    await this.patientIntakeRepository.save(intake);
    
    return { 
      message: 'Paciente marcado como descartado exitosamente',
      status: 'DISCARDED'
    };
  }

  /**
   * Elimina PERMANENTEMENTE un paciente del sistema (HARD DELETE)
   * ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
   * Solo debe usarse para limpiar datos de prueba o por solicitud explícita
   */
  async hardDelete(id: string): Promise<void> {
    const intake = await this.patientIntakeRepository.findOne({ where: { id } });
    
    if (!intake) {
      throw new NotFoundException(`Paciente con ID "${id}" no encontrado`);
    }
    
    try {
      console.log(`🗑️ HARD DELETE: Eliminando permanentemente paciente ${intake.nombres} ${intake.apellidos} (${intake.rut})`);
      
      // Eliminación física permanente de la base de datos
      await this.patientIntakeRepository.delete(id);
      
      console.log(`✅ Paciente eliminado permanentemente de la base de datos`);
    } catch (error) {
      console.error('❌ Error al eliminar permanentemente el paciente:', error);
      throw new Error(`Error al eliminar el paciente: ${error.message}`);
    }
  }

  /**
   * Elimina PERMANENTEMENTE todos los pacientes marcados como DISCARDED
   * ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
   * Útil para limpiar la base de datos de pacientes descartados
   */
  async hardDeleteAllDiscarded(): Promise<{ deleted: number }> {
    try {
      console.log(`🗑️ HARD DELETE: Eliminando todos los pacientes descartados...`);
      
      const result = await this.patientIntakeRepository
        .createQueryBuilder()
        .delete()
        .from(PatientIntake)
        .where('status = :status', { status: 'DISCARDED' })
        .execute();
      
      console.log(`✅ ${result.affected || 0} pacientes descartados eliminados permanentemente`);
      
      return { deleted: result.affected || 0 };
    } catch (error) {
      console.error('❌ Error al eliminar pacientes descartados:', error);
      throw new Error(`Error al eliminar pacientes descartados: ${error.message}`);
    }
  }
}
