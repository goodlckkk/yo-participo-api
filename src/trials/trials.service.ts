import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateTrialDto } from './dto/create-trial.dto';
import { UpdateTrialDto } from './dto/update-trial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Trial, TrialStatus } from './entities/trial.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class TrialsService {
  private readonly logger = new Logger(TrialsService.name);

  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createTrialDto: CreateTrialDto, user?: any) {
    try {
      const { sponsor_id, research_site_id, ...trialData } = createTrialDto;

      console.log('📝 Creando trial con datos:', {
        sponsor_id,
        research_site_id,
        trialData
      });

      const newTrial = this.trialRepository.create({
        ...trialData,
        // Solo asignar sponsor si se proporciona sponsor_id
        ...(sponsor_id && { sponsor: { id: sponsor_id } }),
        // Asignar research site usando solo el ID (TypeORM manejará la relación)
        ...(research_site_id && { researchSite: { id: research_site_id } }),
      });

      console.log('✅ Trial creado en memoria:', newTrial);

      const savedTrial = await this.trialRepository.save(newTrial);
      
      console.log('💾 Trial guardado en BD:', savedTrial);

      // Registrar en audit log
      try {
        await this.auditLogsService.logChange(
          'Trial',
          savedTrial.id,
          'CREATE',
          { title: savedTrial.title, status: savedTrial.status, sponsor_id, research_site_id },
          user?.sub || user?.id,
          user?.email,
        );
        this.logger.log(`📋 Audit log registrado para trial ${savedTrial.id} (CREATE)`);
      } catch (auditError) {
        this.logger.warn(`⚠️ No se pudo registrar audit log: ${auditError.message}`);
      }
      
      return savedTrial;
    } catch (error) {
      console.error('❌ Error al crear trial:', error);
      throw error;
    }
  }

  async findAll(status?: TrialStatus, page = 1, limit = 10) {
    const findOptions: FindManyOptions<Trial> = {
      relations: ['sponsor', 'researchSite'],
    };

    if (status) {
      findOptions.where = {
        status,
      };
    }

    const pageNumber = page > 0 ? page : 1;
    const limitNumber = limit > 0 ? limit : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const [data, totalItems] = await this.trialRepository.findAndCount({
      ...findOptions,
      take: limitNumber,
      skip,
    });

    // Contar pacientes inscritos para cada ensayo
    const trialsWithPatientCount = await Promise.all(
      data.map(async (trial) => {
        const patientCount = await this.patientIntakeRepository.count({
          where: { trialId: trial.id },
        });
        
        return {
          ...trial,
          current_participants: patientCount,
        };
      })
    );

    const totalPages = Math.ceil(totalItems / limitNumber) || 1;

    return {
      data: trialsWithPatientCount,
      totalItems,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    };
  }

  async findOne(id: string) {
    const trial = await this.trialRepository.findOne({
      where: { id },
      relations: ['sponsor', 'researchSite'],
    });

    if (!trial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    // Contar pacientes inscritos en este ensayo
    const patientCount = await this.patientIntakeRepository.count({
      where: { trialId: trial.id },
    });

    return {
      ...trial,
      current_participants: patientCount,
    };
  }

  async update(id: string, updateTrialDto: UpdateTrialDto, user?: any) {
    const { sponsor_id, research_site_id, ...trialData } = updateTrialDto;

    // Si se está cambiando el estado, resetear la solicitud de cambio de fase
    const existingTrial = await this.trialRepository.findOne({ where: { id }, relations: ['sponsor', 'researchSite'] });
    if (!existingTrial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    const statusChanged = trialData.status && trialData.status !== existingTrial.status;

    const trial = await this.trialRepository.preload({
      id,
      ...trialData,
      // Solo actualizar sponsor si se proporciona sponsor_id
      ...(sponsor_id && { sponsor: { id: sponsor_id } }),
      // Solo actualizar research site si se proporciona research_site_id
      ...(research_site_id && { researchSite: { id: research_site_id } }),
      // Resetear solicitud de cambio de fase si el admin cambió el estado
      ...(statusChanged && {
        phaseChangeRequested: false,
        phaseChangeRequestedAt: null,
        phaseChangeRequestedBy: null,
      }),
    });

    const savedTrial = await this.trialRepository.save(trial);

    // Registrar en audit log: comparar valores anteriores con nuevos
    try {
      const changes: Record<string, { before: any; after: any }> = {};
      if (trialData.title && trialData.title !== existingTrial.title) {
        changes['title'] = { before: existingTrial.title, after: trialData.title };
      }
      if (trialData.public_description && trialData.public_description !== existingTrial.public_description) {
        changes['public_description'] = { before: existingTrial.public_description, after: trialData.public_description };
      }
      if (statusChanged) {
        changes['status'] = { before: existingTrial.status, after: trialData.status };
      }
      if (sponsor_id && sponsor_id !== existingTrial.sponsor?.id) {
        changes['sponsor_id'] = { before: existingTrial.sponsor?.id, after: sponsor_id };
      }
      if (research_site_id && research_site_id !== existingTrial.researchSite?.id) {
        changes['research_site_id'] = { before: existingTrial.researchSite?.id, after: research_site_id };
      }
      if (trialData.max_participants !== undefined && trialData.max_participants !== existingTrial.max_participants) {
        changes['max_participants'] = { before: existingTrial.max_participants, after: trialData.max_participants };
      }
      if (trialData.recruitment_deadline && String(trialData.recruitment_deadline) !== String(existingTrial.recruitment_deadline)) {
        changes['recruitment_deadline'] = { before: existingTrial.recruitment_deadline, after: trialData.recruitment_deadline };
      }
      if (trialData.inclusion_criteria) {
        changes['inclusion_criteria'] = { before: existingTrial.inclusion_criteria, after: trialData.inclusion_criteria };
      }

      if (Object.keys(changes).length > 0) {
        await this.auditLogsService.logChange(
          'Trial',
          id,
          'UPDATE',
          changes,
          user?.sub || user?.id,
          user?.email,
        );
        this.logger.log(`📋 Audit log registrado para trial ${id} (UPDATE) por ${user?.email || 'sistema'}`);
      }
    } catch (auditError) {
      this.logger.warn(`⚠️ No se pudo registrar audit log: ${auditError.message}`);
    }

    return savedTrial;
  }

  /**
   * Solicitar cambio de fase por parte de una institución.
   * No cambia el estado directamente, solo marca la solicitud para que el admin la revise.
   */
  async requestPhaseChange(id: string, requestedBy: string) {
    const trial = await this.trialRepository.findOne({ where: { id } });
    if (!trial) {
      throw new NotFoundException(`Ensayo clínico con ID "${id}" no encontrado.`);
    }

    trial.phaseChangeRequested = true;
    trial.phaseChangeRequestedAt = new Date();
    trial.phaseChangeRequestedBy = requestedBy;

    return this.trialRepository.save(trial);
  }

  async remove(id: string): Promise<void> {
    const trial = await this.trialRepository.findOne({ where: { id } });
    
    if (!trial) {
      throw new NotFoundException(`Trial con ID "${id}" no encontrado`);
    }
    
    try {
      console.log(`🗑️ Iniciando eliminación del trial: ${trial.title}`);
      
      // 1. Desvincular todos los pacientes de este trial (SET NULL)
      const updateResult = await this.patientIntakeRepository
        .createQueryBuilder()
        .update(PatientIntake)
        .set({ trialId: null })
        .where('trialId = :trialId', { trialId: id })
        .execute();
      
      console.log(`📝 Pacientes desvinculados: ${updateResult.affected || 0}`);
      
      // 2. Eliminar registros de la tabla participations (si existe)
      try {
        await this.trialRepository.query(
          'DELETE FROM participations WHERE "trialId" = $1',
          [id]
        );
        console.log(`📝 Participaciones eliminadas`);
      } catch (participationError) {
        // Si la tabla no existe, continuar
        console.log(`ℹ️ No hay tabla participations o ya está vacía`);
      }
      
      // 3. Ahora podemos eliminar el trial de forma segura
      await this.trialRepository.delete(id);
      
      console.log(`✅ Trial "${trial.title}" eliminado exitosamente`);
    } catch (error) {
      console.error('❌ Error al eliminar trial:', error);
      throw new Error(`Error al eliminar el trial: ${error.message}`);
    }
  }
}
