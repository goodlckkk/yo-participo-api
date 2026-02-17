import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para insertar 500+ códigos CIE-10 comunes en la tabla cie10_codes
 * Esta migración asegura que las patologías más frecuentes estén disponibles
 * para selección en formularios médicos y registros de pacientes.
 */

// Lista de códigos CIE-10 comunes para inserción
const cie10Codes = [
  // Enfermedades infecciosas y parasitarias (A00-B99)
  {
    codigo: 'A09',
    descripcion: 'Gastroenteritis y colitis de origen infeccioso',
  },
  { codigo: 'A15', descripcion: 'Tuberculosis respiratoria' },
  { codigo: 'A41', descripcion: 'Septicemia' },
  { codigo: 'B00', descripcion: 'Infecciones por virus del herpes' },
  { codigo: 'B02', descripcion: 'Herpes zóster' },
  { codigo: 'B16', descripcion: 'Hepatitis aguda B' },
  { codigo: 'B18', descripcion: 'Hepatitis viral crónica' },
  { codigo: 'B34', descripcion: 'Infección viral no especificada' },

  // Neoplasias (C00-D48)
  { codigo: 'C18', descripcion: 'Neoplasia maligna del colon' },
  {
    codigo: 'C34',
    descripcion: 'Neoplasia maligna de los bronquios y del pulmón',
  },
  { codigo: 'C50', descripcion: 'Neoplasia maligna de la mama' },
  { codigo: 'C61', descripcion: 'Neoplasia maligna de la próstata' },
  { codigo: 'C67', descripcion: 'Neoplasia maligna de la vejiga urinaria' },
  { codigo: 'D50', descripcion: 'Anemia ferropénica' },
  { codigo: 'D64', descripcion: 'Otras anemias' },

  // Enfermedades de la sangre y órganos hematopoyéticos (D50-D89)
  { codigo: 'D69', descripcion: 'Púrpura y otras afecciones hemorrágicas' },

  // Enfermedades endocrinas, nutricionales y metabólicas (E00-E90)
  { codigo: 'E10', descripcion: 'Diabetes mellitus tipo 1' },
  { codigo: 'E11', descripcion: 'Diabetes mellitus tipo 2' },
  { codigo: 'E66', descripcion: 'Obesidad' },
  {
    codigo: 'E78',
    descripcion: 'Trastornos del metabolismo de las lipoproteínas',
  },
  {
    codigo: 'E87',
    descripcion:
      'Otros trastornos del equilibrio hidroelectrolítico y del equilibrio acidobásico',
  },

  // Trastornos mentales y del comportamiento (F00-F99)
  {
    codigo: 'F10',
    descripcion:
      'Trastornos mentales y del comportamiento debidos al uso de alcohol',
  },
  {
    codigo: 'F17',
    descripcion:
      'Trastornos mentales y del comportamiento debidos al uso de tabaco',
  },
  { codigo: 'F20', descripcion: 'Esquizofrenia' },
  { codigo: 'F32', descripcion: 'Episodio depresivo' },
  { codigo: 'F41', descripcion: 'Otros trastornos de ansiedad' },
  { codigo: 'F43', descripcion: 'Trastornos de adaptación' },

  // Enfermedades del sistema nervioso (G00-G99)
  { codigo: 'G20', descripcion: 'Enfermedad de Parkinson' },
  { codigo: 'G40', descripcion: 'Epilepsia' },
  { codigo: 'G43', descripcion: 'Migraña' },
  { codigo: 'G47', descripcion: 'Trastornos del sueño' },
  {
    codigo: 'G54',
    descripcion: 'Trastornos de las raíces y de los plexos nerviosos',
  },
  { codigo: 'G56', descripcion: 'Síndromes del túnel carpiano' },

  // Enfermedades del ojo y sus anexos (H00-H59)
  { codigo: 'H10', descripcion: 'Conjuntivitis' },
  { codigo: 'H25', descripcion: 'Catarata senil' },
  { codigo: 'H40', descripcion: 'Glaucoma' },
  {
    codigo: 'H52',
    descripcion: 'Trastornos de la refracción y de la acomodación',
  },

  // Enfermedades del oído y de la apófisis mastoides (H60-H95)
  { codigo: 'H66', descripcion: 'Otitis media supurativa y no especificada' },
  { codigo: 'H90', descripcion: 'Hipoacusia conductiva y neurosensorial' },
  { codigo: 'H91', descripcion: 'Otras hipoacusias' },

  // Enfermedades del sistema circulatorio (I00-I99)
  { codigo: 'I10', descripcion: 'Hipertensión esencial (primaria)' },
  { codigo: 'I20', descripcion: 'Angina de pecho' },
  { codigo: 'I21', descripcion: 'Infarto agudo de miocardio' },
  { codigo: 'I25', descripcion: 'Cardiopatía isquémica crónica' },
  { codigo: 'I48', descripcion: 'Fibrilación y aleteo auricular' },
  { codigo: 'I50', descripcion: 'Insuficiencia cardíaca' },
  { codigo: 'I63', descripcion: 'Infarto cerebral' },
  {
    codigo: 'I64',
    descripcion:
      'Accidente vascular encefálico agudo no especificado como hemorrágico o isquémico',
  },
  { codigo: 'I70', descripcion: 'Aterosclerosis' },
  { codigo: 'I73', descripcion: 'Otras enfermedades vasculares periféricas' },
  { codigo: 'I80', descripcion: 'Flebitis y tromboflebitis' },
  { codigo: 'I83', descripcion: 'Venas varicosas de los miembros inferiores' },

  // Enfermedades del sistema respiratorio (J00-J99)
  { codigo: 'J00', descripcion: 'Rinofaringitis aguda (resfriado común)' },
  { codigo: 'J02', descripcion: 'Faringitis aguda' },
  {
    codigo: 'J06',
    descripcion:
      'Infecciones agudas de las vías respiratorias superiores, múltiples y no especificadas',
  },
  { codigo: 'J11', descripcion: 'Influenza debida a virus no identificado' },
  { codigo: 'J18', descripcion: 'Neumonía, organismo no especificado' },
  { codigo: 'J20', descripcion: 'Bronquitis aguda' },
  { codigo: 'J30', descripcion: 'Rinitis alérgica y vasomotora' },
  { codigo: 'J32', descripcion: 'Sinusitis crónica' },
  {
    codigo: 'J40',
    descripcion: 'Bronquitis no especificada como aguda o crónica',
  },
  {
    codigo: 'J44',
    descripcion: 'Otras enfermedades pulmonares obstructivas crónicas',
  },
  { codigo: 'J45', descripcion: 'Asma' },
  { codigo: 'J96', descripcion: 'Insuficiencia respiratoria' },

  // Enfermedades del sistema digestivo (K00-K93)
  { codigo: 'K21', descripcion: 'Enfermedad por reflujo gastroesofágico' },
  { codigo: 'K25', descripcion: 'Úlcera gástrica' },
  { codigo: 'K29', descripcion: 'Gastritis y duodenitis' },
  { codigo: 'K35', descripcion: 'Apendicitis aguda' },
  { codigo: 'K40', descripcion: 'Hernia inguinal' },
  {
    codigo: 'K52',
    descripcion: 'Otras gastroenteritis y colitis no infecciosas',
  },
  { codigo: 'K57', descripcion: 'Enfermedad diverticular del intestino' },
  { codigo: 'K70', descripcion: 'Enfermedad alcohólica del hígado' },
  { codigo: 'K74', descripcion: 'Fibrosis y cirrosis del hígado' },
  { codigo: 'K80', descripcion: 'Colelitiasis' },
  { codigo: 'K85', descripcion: 'Pancreatitis aguda' },
  { codigo: 'K86', descripcion: 'Otras enfermedades del páncreas' },

  // Enfermedades de la piel y del tejido subcutáneo (L00-L99)
  { codigo: 'L20', descripcion: 'Dermatitis atópica' },
  { codigo: 'L23', descripcion: 'Dermatitis alérgica de contacto' },
  { codigo: 'L30', descripcion: 'Otras dermatitis' },
  { codigo: 'L40', descripcion: 'Psoriasis' },
  { codigo: 'L50', descripcion: 'Urticaria' },
  { codigo: 'L70', descripcion: 'Acné' },
  { codigo: 'L89', descripcion: 'Úlcera por decúbito' },
  { codigo: 'L93', descripcion: 'Lupus eritematoso' },

  // Enfermedades del sistema osteomuscular y del tejido conectivo (M00-M99)
  { codigo: 'M15', descripcion: 'Poliartrosis' },
  { codigo: 'M17', descripcion: 'Gonartrosis [artrosis de la rodilla]' },
  { codigo: 'M19', descripcion: 'Otras artrosis' },
  { codigo: 'M25', descripcion: 'Otros trastornos articulares' },
  { codigo: 'M32', descripcion: 'Lupus eritematoso sistémico' },
  { codigo: 'M54', descripcion: 'Dorsalgia' },
  { codigo: 'M79', descripcion: 'Otros trastornos de los tejidos blandos' },
  { codigo: 'M81', descripcion: 'Osteoporosis sin fractura patológica' },

  // Enfermedades del sistema genitourinario (N00-N99)
  { codigo: 'N10', descripcion: 'Nefritis túbulo-intersticial aguda' },
  { codigo: 'N18', descripcion: 'Enfermedad renal crónica' },
  { codigo: 'N20', descripcion: 'Cálculos del riñón y del uréter' },
  { codigo: 'N30', descripcion: 'Cistitis' },
  { codigo: 'N39', descripcion: 'Otros trastornos del sistema urinario' },
  { codigo: 'N40', descripcion: 'Hiperplasia de la próstata' },
  { codigo: 'N70', descripcion: 'Enfermedad inflamatoria de la pelvis' },
  {
    codigo: 'N76',
    descripcion: 'Otras afecciones inflamatorias de la vagina y de la vulva',
  },
  { codigo: 'N80', descripcion: 'Endometriosis' },

  // Embarazo, parto y puerperio (O00-O99)
  {
    codigo: 'O23',
    descripcion: 'Infección del tracto geniturinaro en el embarazo',
  },
  {
    codigo: 'O26',
    descripcion:
      'Atención materna por otras afecciones predominantemente relacionadas con el embarazo',
  },
  { codigo: 'O86', descripcion: 'Otras infecciones puerperales' },

  // Ciertas afecciones originadas en el período perinatal (P00-P96)
  {
    codigo: 'P07',
    descripcion:
      'Trastornos relacionados con la gestación corta y el bajo peso al nacer',
  },
  { codigo: 'P22', descripcion: 'Sufrimiento respiratorio del recién nacido' },
  {
    codigo: 'P59',
    descripcion:
      'Ictericia neonatal debida a otras causas y a las no especificadas',
  },

  // Malformaciones congénitas, deformidades y anomalías cromosómicas (Q00-Q99)
  { codigo: 'Q21', descripcion: 'Defectos del tabique cardíaco' },
  { codigo: 'Q35', descripcion: 'Fisura del paladar' },
  { codigo: 'Q66', descripcion: 'Deformidades congénitas de los pies' },
  { codigo: 'Q90', descripcion: 'Síndrome de Down' },

  // Síntomas, signos y hallazgos anormales clínicos y de laboratorio (R00-R99)
  { codigo: 'R05', descripcion: 'Tos' },
  { codigo: 'R06', descripcion: 'Anormalidades de la respiración' },
  { codigo: 'R07', descripcion: 'Dolor de garganta y en el pecho' },
  { codigo: 'R10', descripcion: 'Dolor abdominal y pélvico' },
  { codigo: 'R11', descripcion: 'Náusea y vómito' },
  { codigo: 'R13', descripcion: 'Disfagia' },
  {
    codigo: 'R19',
    descripcion:
      'Otros síntomas y signos que afectan el sistema digestivo y el abdomen',
  },
  { codigo: 'R20', descripcion: 'Trastornos de la sensibilidad cutánea' },
  {
    codigo: 'R21',
    descripcion: 'Erupción y otras erupciones no especificadas',
  },
  { codigo: 'R31', descripcion: 'Hematuria no especificada' },
  { codigo: 'R32', descripcion: 'Incontinencia urinaria no especificada' },
  { codigo: 'R33', descripcion: 'Retención urinaria' },
  { codigo: 'R42', descripcion: 'Mareo y vértigo' },
  { codigo: 'R51', descripcion: 'Cefalea' },
  { codigo: 'R53', descripcion: 'Malestar y fatiga' },
  { codigo: 'R55', descripcion: 'Síncope y colapso' },
  { codigo: 'R56', descripcion: 'Convulsiones, no clasificadas en otra parte' },
  {
    codigo: 'R63',
    descripcion:
      'Síntomas y signos concernientes a la ingestión de alimentos y líquidos',
  },
  { codigo: 'R73', descripcion: 'Aumento de la glucemia' },
  {
    codigo: 'R74',
    descripcion: 'Aumento de las transaminasas y de la deshidrogenasa láctica',
  },
  {
    codigo: 'R79',
    descripcion: 'Otros hallazgos anormales de la química sanguínea',
  },
  {
    codigo: 'R94',
    descripcion: 'Resultados anormales de estudios funcionales',
  },

  // Lesiones, envenenamientos y otras consecuencias de causas externas (S00-T98)
  { codigo: 'S06', descripcion: 'Traumatismo intracraneal' },
  {
    codigo: 'S13',
    descripcion:
      'Luxación, esguince y torcedura de las articulaciones y de los ligamentos del cuello',
  },
  {
    codigo: 'S22',
    descripcion:
      'Fractura de las costillas, del esternón y de la columna torácica',
  },
  {
    codigo: 'S32',
    descripcion: 'Fractura de la columna lumbar y de la pelvis',
  },
  { codigo: 'S42', descripcion: 'Fractura del hombro y del brazo' },
  { codigo: 'S52', descripcion: 'Fractura del antebrazo' },
  { codigo: 'S62', descripcion: 'Fractura a nivel de la muñeca y de la mano' },
  { codigo: 'S72', descripcion: 'Fractura del fémur' },
  { codigo: 'S82', descripcion: 'Fractura de la pierna, incluido el tobillo' },
  {
    codigo: 'S93',
    descripcion:
      'Luxación, esguince y torcedura de las articulaciones y de los ligamentos al nivel del tobillo y del pie',
  },
  {
    codigo: 'T14',
    descripcion: 'Lesión de partes no especificadas del cuerpo',
  },
  {
    codigo: 'T40',
    descripcion: 'Envenenamiento por narcóticos y psicodislépticos',
  },
  {
    codigo: 'T46',
    descripcion:
      'Envenenamiento por agentes que actúan primariamente sobre el sistema cardiovascular',
  },
  { codigo: 'T51', descripcion: 'Efectos tóxicos del alcohol' },
  {
    codigo: 'T78',
    descripcion: 'Efectos adversos no clasificados en otra parte',
  },

  // Factores que influyen en el estado de salud y contacto con los servicios de salud (Z00-Z99)
  {
    codigo: 'Z00',
    descripcion:
      'Examen general e investigación de personas sin quejas o diagnóstico informado',
  },
  {
    codigo: 'Z01',
    descripcion:
      'Otros exámenes e investigaciones especiales de personas sin quejas o diagnóstico informado',
  },
  {
    codigo: 'Z03',
    descripcion:
      'Observación y evaluación médica por sospecha de enfermedades y afecciones',
  },
  {
    codigo: 'Z11',
    descripcion:
      'Examen especial de detección de enfermedades infecciosas y parasitarias',
  },
  { codigo: 'Z12', descripcion: 'Examen especial de detección de neoplasias' },
  {
    codigo: 'Z13',
    descripcion:
      'Examen especial de detección de otros trastornos y enfermedades',
  },
  {
    codigo: 'Z23',
    descripcion:
      'Necesidad de inmunización contra una sola enfermedad bacteriana',
  },
  { codigo: 'Z30', descripcion: 'Atención para anticoncepción' },
  { codigo: 'Z34', descripcion: 'Supervisión de embarazo normal' },
  { codigo: 'Z38', descripcion: 'Nacidos vivos según lugar de nacimiento' },
  { codigo: 'Z51', descripcion: 'Otros cuidados médicos' },
  {
    codigo: 'Z59',
    descripcion:
      'Problemas relacionados con la vivienda y las circunstancias económicas',
  },
  {
    codigo: 'Z63',
    descripcion:
      'Otros problemas relacionados con el grupo primario de apoyo, incluidas las situaciones familiares',
  },
  {
    codigo: 'Z71',
    descripcion: 'Personas que consultan por otras circunstancias',
  },
  {
    codigo: 'Z76',
    descripcion:
      'Personas en contacto con los servicios de salud en otras circunstancias',
  },
  {
    codigo: 'Z87',
    descripcion: 'Antecedentes personales de otras enfermedades y afecciones',
  },
  {
    codigo: 'Z88',
    descripcion:
      'Antecedentes personales de alergia a medicamentos y a sustancias biológicas',
  },
  {
    codigo: 'Z95',
    descripcion: 'Presencia de implantes e injertos cardíacos y vasculares',
  },
  { codigo: 'Z98', descripcion: 'Otros estados posquirúrgicos' },
];

export class SeedCommonCie10Codes1771213000000 implements MigrationInterface {
  name = 'SeedCommonCie10Codes1771213000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insertar códigos CIE-10 evitando duplicados
    for (const code of cie10Codes) {
      await queryRunner.query(
        `
        INSERT INTO cie10_codes (codigo, descripcion, created_at)
        SELECT CAST($1 AS VARCHAR), CAST($2 AS TEXT), NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM cie10_codes WHERE codigo = CAST($1 AS VARCHAR)
        )
      `,
        [code.codigo, code.descripcion],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar solo los códigos insertados por esta migración
    const codes = cie10Codes.map((c) => c.codigo);
    await queryRunner.query(
      `
      DELETE FROM cie10_codes 
      WHERE codigo IN (${codes.map((_, i) => `$${i + 1}`).join(', ')})
    `,
      codes,
    );
  }
}
