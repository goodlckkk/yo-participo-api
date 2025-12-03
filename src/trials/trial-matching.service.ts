import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trial, TrialStatus } from './entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';
import { InclusionCriteria } from './interfaces/inclusion-criteria.interface';

/**
 * Interfaz para representar una sugerencia de ensayo con su score de compatibilidad
 */
export interface TrialSuggestion {
  trial: Trial;
  matchScore: number; // 0-100
  matchReasons: string[]; // Razones por las que coincide
}

/**
 * Servicio para calcular compatibilidad entre pacientes y ensayos clínicos
 * 
 * Algoritmo de matching:
 * 1. Solo ensayos en estado RECRUITING
 * 2. Coincidencia de patologías del paciente con criterios de inclusión
 * 3. Coincidencia de condición principal
 * 4. Coincidencia de descripción de otras enfermedades
 * 5. Score basado en cantidad de coincidencias
 */
@Injectable()
export class TrialMatchingService {
  constructor(
    @InjectRepository(Trial)
    private readonly trialRepository: Repository<Trial>,
    @InjectRepository(PatientIntake)
    private readonly patientIntakeRepository: Repository<PatientIntake>,
  ) {}

  /**
   * Obtiene sugerencias de ensayos para un paciente específico
   * 
   * @param patientId - ID del paciente
   * @returns Array de sugerencias ordenadas por score (mayor a menor)
   */
  async getSuggestionsForPatient(patientId: string): Promise<TrialSuggestion[]> {
    // 1. Obtener datos del paciente
    const patient = await this.patientIntakeRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error(`Paciente con ID ${patientId} no encontrado`);
    }

    // 2. Obtener solo ensayos en RECRUITING
    const recruitingTrials = await this.trialRepository.find({
      where: { status: TrialStatus.RECRUITING },
      relations: ['sponsor', 'researchSite'],
    });

    // 3. Calcular score para cada ensayo
    const suggestions: TrialSuggestion[] = recruitingTrials
      .map((trial) => this.calculateMatch(patient, trial))
      .filter((suggestion) => suggestion.matchScore > 0) // Solo mostrar si hay alguna coincidencia
      .sort((a, b) => b.matchScore - a.matchScore); // Ordenar por score descendente

    return suggestions;
  }

  /**
   * Calcula el score de compatibilidad entre un paciente y un ensayo
   * MEJORADO: Ahora usa códigos CIE-10 para matching preciso
   * 
   * @param patient - Datos del paciente
   * @param trial - Datos del ensayo
   * @returns Sugerencia con score y razones
   */
  private calculateMatch(patient: PatientIntake, trial: Trial): TrialSuggestion {
    let score = 0;
    const reasons: string[] = [];

    // Extraer criterios de inclusión del ensayo
    const inclusionCriteria = trial.inclusion_criteria as InclusionCriteria;
    
    if (!inclusionCriteria) {
      return { trial, matchScore: 0, matchReasons: [] };
    }

    // === MATCHING CON CÓDIGOS CIE-10 (PRIORIDAD ALTA) ===
    
    // 1. Verificar códigos CIE-10 EXCLUIDOS (eliminatorio)
    if (inclusionCriteria.codigos_cie10_excluidos && patient.codigos_cie10) {
      const hasExcludedCode = patient.codigos_cie10.some(patientCode =>
        inclusionCriteria.codigos_cie10_excluidos!.some(excludedCode =>
          this.matchCie10Code(patientCode, excludedCode)
        )
      );
      
      if (hasExcludedCode) {
        reasons.push('❌ Paciente tiene código CIE-10 excluido');
        return { trial, matchScore: 0, matchReasons: reasons };
      }
    }

    // 2. Matching de códigos CIE-10 REQUERIDOS (peso: 50 puntos)
    if (inclusionCriteria.codigos_cie10_requeridos && patient.codigos_cie10) {
      const matchedCodes = patient.codigos_cie10.filter(patientCode =>
        inclusionCriteria.codigos_cie10_requeridos!.some(requiredCode =>
          this.matchCie10Code(patientCode, requiredCode)
        )
      );

      if (matchedCodes.length > 0) {
        score += 50;
        reasons.push(`✓ ${matchedCodes.length} código(s) CIE-10 coinciden: ${matchedCodes.join(', ')}`);
      }
    }

    // === MATCHING CON TEXTO LIBRE (LEGACY) ===
    const trialConditions = this.extractConditionsFromCriteria(inclusionCriteria);

    // 1. Coincidencia de condición principal (peso: 40 puntos)
    if (patient.condicionPrincipal && trialConditions.length > 0) {
      const conditionMatch = trialConditions.some((condition) =>
        this.fuzzyMatch(patient.condicionPrincipal, condition),
      );
      if (conditionMatch) {
        score += 40;
        reasons.push(`Condición principal coincide: ${patient.condicionPrincipal}`);
      }
    }

    // 2. Coincidencia de patologías (peso: 30 puntos)
    if (patient.patologias && patient.patologias.length > 0) {
      const patologyMatches = patient.patologias.filter((patologia) =>
        trialConditions.some((condition) => this.fuzzyMatch(patologia, condition)),
      );

      if (patologyMatches.length > 0) {
        const patologyScore = Math.min(30, patologyMatches.length * 10);
        score += patologyScore;
        reasons.push(`${patologyMatches.length} patología(s) coinciden`);
      }
    }

    // 3. Coincidencia en descripción de condición (peso: 20 puntos)
    if (patient.descripcionCondicion && trialConditions.length > 0) {
      const descriptionMatch = trialConditions.some((condition) =>
        this.fuzzyMatch(patient.descripcionCondicion, condition),
      );
      if (descriptionMatch) {
        score += 20;
        reasons.push('Descripción de condición coincide');
      }
    }

    // 4. Bonus: Ensayo tiene cupos disponibles (peso: 10 puntos)
    if (trial.max_participants > 0) {
      score += 10;
      reasons.push('Tiene cupos disponibles');
    }

    return {
      trial,
      matchScore: Math.min(100, score), // Máximo 100
      matchReasons: reasons,
    };
  }

  /**
   * Extrae condiciones médicas de los criterios de inclusión
   * 
   * @param criteria - Objeto JSON con criterios de inclusión
   * @returns Array de strings con condiciones
   */
  private extractConditionsFromCriteria(criteria: any): string[] {
    const conditions: string[] = [];

    if (!criteria) return conditions;

    // Extraer de diferentes campos posibles
    if (criteria.conditions && Array.isArray(criteria.conditions)) {
      conditions.push(...criteria.conditions);
    }

    if (criteria.diseases && Array.isArray(criteria.diseases)) {
      conditions.push(...criteria.diseases);
    }

    if (criteria.diagnosis && typeof criteria.diagnosis === 'string') {
      conditions.push(criteria.diagnosis);
    }

    if (criteria.medicalConditions && Array.isArray(criteria.medicalConditions)) {
      conditions.push(...criteria.medicalConditions);
    }

    // Convertir todo a minúsculas para comparación
    return conditions.map((c) => c.toLowerCase().trim());
  }

  /**
   * Compara dos strings de forma flexible (case-insensitive, partial match)
   * 
   * @param text1 - Primer texto
   * @param text2 - Segundo texto
   * @returns true si hay coincidencia
   */
  private fuzzyMatch(text1: string, text2: string): boolean {
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();

    // Coincidencia exacta
    if (normalized1 === normalized2) return true;

    // Coincidencia parcial (uno contiene al otro)
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }

    // Coincidencia de palabras clave
    const keywords1 = normalized1.split(/\s+/);
    const keywords2 = normalized2.split(/\s+/);

    // Si al menos 2 palabras coinciden, considerar match
    const commonWords = keywords1.filter((word) =>
      keywords2.some((w) => w === word && word.length > 3),
    );

    return commonWords.length >= 2;
  }

  /**
   * Compara dos códigos CIE-10 considerando jerarquía
   * 
   * Ejemplos:
   * - matchCie10Code("E11.9", "E11") => true (E11.9 es subcategoría de E11)
   * - matchCie10Code("E11", "E11.9") => true (E11 incluye todas sus subcategorías)
   * - matchCie10Code("E11.9", "E11.9") => true (exacto)
   * - matchCie10Code("E11.9", "E10") => false (diferentes categorías)
   * 
   * @param patientCode - Código CIE-10 del paciente
   * @param criteriaCode - Código CIE-10 del criterio del ensayo
   * @returns true si hay coincidencia
   */
  private matchCie10Code(patientCode: string, criteriaCode: string): boolean {
    // Normalizar códigos (mayúsculas, sin espacios)
    const patient = patientCode.toUpperCase().trim();
    const criteria = criteriaCode.toUpperCase().trim();

    // Coincidencia exacta
    if (patient === criteria) {
      return true;
    }

    // Coincidencia jerárquica: el paciente tiene una subcategoría del criterio
    // Ej: paciente tiene "E11.9" y criterio es "E11"
    if (patient.startsWith(criteria)) {
      return true;
    }

    // Coincidencia jerárquica inversa: el criterio es más específico que el paciente
    // Ej: paciente tiene "E11" y criterio es "E11.9"
    if (criteria.startsWith(patient)) {
      return true;
    }

    return false;
  }
}
