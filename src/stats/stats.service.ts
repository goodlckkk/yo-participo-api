/**
 * Servicio de Estadísticas
 * 
 * Calcula y proporciona estadísticas del sistema:
 * - Conteo de ensayos por estado
 * - Conteo de pacientes totales
 * - Tendencias de postulaciones por día/semana
 * - Ensayos con más postulaciones
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trial, TrialStatus } from '../trials/entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
  ) {}

  /**
   * Obtiene estadísticas generales del sistema
   */
  async getGeneralStats() {
    // Total de ensayos por estado
    const trialsByStatus = await this.trialRepository
      .createQueryBuilder('trial')
      .select('trial.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('trial.status')
      .getRawMany();

    // Total de ensayos
    const totalTrials = await this.trialRepository.count();

    // Total de pacientes postulados
    const totalPatients = await this.patientIntakeRepository.count();

    // Pacientes por estado
    const patientsByStatus = await this.patientIntakeRepository
      .createQueryBuilder('intake')
      .select('intake.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('intake.status')
      .getRawMany();

    // Ensayos activos (RECRUITING o ACTIVE)
    const activeTrials = await this.trialRepository.count({
      where: [{ status: TrialStatus.RECRUITING }, { status: TrialStatus.ACTIVE }],
    });

    // Ensayos más populares (con más postulaciones)
    const popularTrials = await this.patientIntakeRepository
      .createQueryBuilder('intake')
      .select('intake.trialId', 'trialId')
      .addSelect('COUNT(*)', 'count')
      .where('intake.trialId IS NOT NULL')
      .groupBy('intake.trialId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // Obtener detalles de los ensayos más populares
    const popularTrialsWithDetails = await Promise.all(
      popularTrials.map(async (item) => {
        const trial = await this.trialRepository.findOne({
          where: { id: item.trialId },
        });
        return {
          trial,
          patientCount: parseInt(item.count),
        };
      }),
    );

    return {
      totalTrials,
      totalPatients,
      activeTrials,
      trialsByStatus: trialsByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      patientsByStatus: patientsByStatus.map((item) => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      popularTrials: popularTrialsWithDetails,
    };
  }

  /**
   * Obtiene tendencias de postulaciones de pacientes
   * Agrupa por día en los últimos 30 días
   */
  async getPatientIntakeTrends() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await this.patientIntakeRepository
      .createQueryBuilder('intake')
      .select("DATE(intake.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('intake.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('DATE(intake.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return trends.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }
}
