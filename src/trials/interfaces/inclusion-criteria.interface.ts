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

  // Condición médica principal del ensayo (con código y nombre)
  condicionPrincipal?: {
    codigo: string;
    nombre: string;
  };

  // Condiciones requeridas estructuradas (código + nombre)
  condicionesRequeridas?: Array<{
    codigo: string;
    nombre: string;
  }>;

  // Condiciones excluidas estructuradas (código + nombre)
  condicionesExcluidas?: Array<{
    codigo: string;
    nombre: string;
  }>;

  // Alergias excluidas estructuradas (código + nombre)
  alergiasExcluidas?: Array<{
    codigo: string;
    nombre: string;
  }>;

  // Códigos CIE-10 requeridos (legacy, mantener por compatibilidad)
  codigos_cie10_requeridos?: string[]; // ["E11", "E10"]

  // Códigos CIE-10 excluidos (legacy, mantener por compatibilidad)
  codigos_cie10_excluidos?: string[]; // ["I50", "N18"]

  // Condiciones en texto libre (legacy, mantener por compatibilidad)
  condiciones_requeridas?: string[];
  condiciones_excluidas?: string[];

  // Medicamentos prohibidos estructurados (híbrido: autocomplete + texto libre)
  // Array de strings: ["Insulina", "Prednisona", "Warfarina"]
  // Solo nombres de medicamentos, sin dosis ni frecuencia
  medicamentosProhibidosEstructurados?: string[];

  // Medicamentos prohibidos (texto libre, no hay CIE-10 para medicamentos)
  medicamentos_prohibidos?: string[];

  // Otros criterios en texto libre
  otros_criterios?: string;

  // Criterios adicionales específicos
  fumador_permitido?: boolean; // true = se permiten fumadores, false = no fumadores, undefined = no importa
  imc_minimo?: number;
  imc_maximo?: number;
}
