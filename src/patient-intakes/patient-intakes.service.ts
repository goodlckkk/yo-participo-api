import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientIntake } from './entities/patient-intake.entity';
import { CreatePatientIntakeDto } from './dto/create-patient-intake.dto';
import { EmailsService } from '../emails/emails.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PatientIntakesService {
  private readonly logger = new Logger(PatientIntakesService.name);

  constructor(
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
    private readonly emailsService: EmailsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createPatientIntakeDto: CreatePatientIntakeDto) {
    // 1. Validar longitud del RUT (8-9 dígitos/caracteres sin formato)
    const cleanRut = createPatientIntakeDto.rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length < 8 || cleanRut.length > 9) {
      throw new BadRequestException('El RUT debe tener entre 8 y 9 caracteres (sin puntos ni guión).');
    }

    // 2. Verificar si el RUT ya existe
    const existingPatient = await this.patientIntakeRepository.findOne({
      where: { rut: createPatientIntakeDto.rut },
    });

    if (existingPatient) {
      throw new ConflictException(`El paciente con RUT ${createPatientIntakeDto.rut} ya está registrado.`);
    }

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

  async findAll(user?: any) {
    const where: any = {};

    // Si es una institución, filtrar solo sus pacientes referidos
    if (user?.role === UserRole.INSTITUTION && user?.institutionId) {
      where.referralResearchSiteId = user.institutionId;
    }

    return this.patientIntakeRepository.find({
      where,
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
  async update(id: string, updateData: Partial<PatientIntake>, user?: any) {
    const intake = await this.findOne(id);
    const previousStatus = intake.status;
    
    // Verificar duplicado de RUT si se está actualizando
    if (updateData.rut && updateData.rut !== intake.rut) {
      // Validar longitud
      const cleanRut = updateData.rut.replace(/[^0-9kK]/g, '');
      if (cleanRut.length < 8 || cleanRut.length > 9) {
        throw new BadRequestException('El RUT debe tener entre 8 y 9 caracteres (sin puntos ni guión).');
      }

      const existing = await this.patientIntakeRepository.findOne({
        where: { rut: updateData.rut },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`El paciente con RUT ${updateData.rut} ya está registrado.`);
      }
    }
    
    // Actualizar los campos proporcionados
    Object.assign(intake, updateData);
    
    const savedIntake = await this.patientIntakeRepository.save(intake);

    // Log audit
    if (user) {
      await this.auditLogsService.logChange(
        'PatientIntake',
        id,
        'UPDATE',
        updateData,
        user.id,
        user.email
      );
    }

    // Verificar cambios de estado para enviar correos
    if (previousStatus !== savedIntake.status) {
      const patientName = `${savedIntake.nombres} ${savedIntake.apellidos}`;

      // 1. Cambio a VERIFIED
      if (savedIntake.status === 'VERIFIED') {
        try {
          await this.emailsService.sendPatientVerifiedEmail(savedIntake.email, patientName);
          this.logger.log(`📧 Correo de verificación enviado a ${savedIntake.email} por cambio de estado`);
        } catch (error) {
          this.logger.error(`❌ Error al enviar correo de verificación en update: ${error.message}`);
        }
      }

      // 2. Cambio a STUDY_ASSIGNED
      if (savedIntake.status === 'STUDY_ASSIGNED') {
        try {
          // Link al dashboard o perfil del paciente (ajustar URL según entorno)
          const dashboardLink = process.env.FRONTEND_URL 
            ? `${process.env.FRONTEND_URL}/dashboard/patients` 
            : 'https://admin.yoparticipo.cl/dashboard/patients';
            
          await this.emailsService.sendMatchFoundEmail(savedIntake.email, patientName, dashboardLink);
          this.logger.log(`📧 Correo de asignación de estudio enviado a ${savedIntake.email} por cambio de estado`);
        } catch (error) {
          this.logger.error(`❌ Error al enviar correo de match en update: ${error.message}`);
        }
      }
    }
    
    return savedIntake;
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
