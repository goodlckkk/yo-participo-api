/**
 * Interfaz para los criterios de inclusión/exclusión de un ensayo clínico
 * 
 * Estructura mejorada con códigos CIE-10 para matching preciso
 */
export interface InclusionCriteria {
  // Criterios de edad
  edad_minima?: number;
  edad_maxima?: number;

  // Género
  genero?: string; // "Hombre", "Mujer", "Todos"

  // Códigos CIE-10 requeridos (el paciente DEBE tener al menos uno)
  codigos_cie10_requeridos?: string[]; // ["E11", "E10"]

  // Códigos CIE-10 excluidos (el paciente NO debe tener ninguno)
  codigos_cie10_excluidos?: string[]; // ["I50", "N18"]

  // Condiciones en texto libre (legacy, mantener por compatibilidad)
  condiciones_requeridas?: string[];
  condiciones_excluidas?: string[];

  // Medicamentos prohibidos
  medicamentos_prohibidos?: string[];

  // Otros criterios en texto libre
  otros_criterios?: string;

  // Criterios adicionales específicos
  fumador_permitido?: boolean; // true = se permiten fumadores, false = no fumadores, undefined = no importa
  imc_minimo?: number;
  imc_maximo?: number;
}
