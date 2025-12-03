import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Cie10Code } from '../src/cie10/entities/cie10-code.entity';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para importar códigos CIE-10 a la base de datos
 * 
 * Fuente de datos:
 * - GitHub: https://github.com/verasativa/CIE-10
 * - Archivo: cie-10.csv
 * 
 * Uso:
 * npm run import:cie10
 * 
 * El script:
 * 1. Descarga el CSV desde GitHub (si no existe localmente)
 * 2. Parsea el CSV
 * 3. Inserta los códigos en la BD en lotes (batch insert)
 * 4. Muestra progreso y estadísticas
 */

// Cargar variables de entorno
config();

const CSV_URL = 'https://raw.githubusercontent.com/verasativa/CIE-10/master/cie-10.csv';
const CSV_PATH = path.join(__dirname, 'cie-10.csv');

// Configuración de la conexión a BD
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Cie10Code],
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Descargar archivo CSV desde GitHub
 */
async function downloadCSV(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('📥 Descargando CSV desde GitHub...');
    const file = fs.createWriteStream(CSV_PATH);

    https.get(CSV_URL, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ CSV descargado exitosamente');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(CSV_PATH, () => {});
      reject(err);
    });
  });
}

/**
 * Parsear línea CSV
 * Formato esperado: codigo,descripcion,nivel,capitulo,rango_capitulo
 */
function parseCSVLine(line: string): Partial<Cie10Code> | null {
  // Saltar líneas vacías o de encabezado
  if (!line || line.startsWith('codigo') || line.trim() === '') {
    return null;
  }

  // Split básico por comas (mejorar si hay comas dentro de campos)
  const parts = line.split(',');
  
  if (parts.length < 2) {
    return null;
  }

  const codigo = parts[0]?.trim();
  const descripcion = parts.slice(1).join(',').trim(); // Unir el resto por si hay comas

  if (!codigo || !descripcion) {
    return null;
  }

  // Determinar nivel jerárquico
  let nivel = 0;
  if (codigo.includes('.')) {
    nivel = 2; // Subcategoría (ej: E11.9)
  } else if (codigo.length === 3) {
    nivel = 1; // Categoría (ej: E11)
  } else if (codigo.includes('-')) {
    nivel = 0; // Capítulo (ej: E00-E90)
  }

  // Determinar código padre
  let codigo_padre: string | null = null;
  if (nivel === 2) {
    codigo_padre = codigo.split('.')[0]; // E11.9 -> E11
  }

  // Determinar capítulo y rango
  let capitulo: string | null = null;
  let rango_capitulo: string | null = null;

  // Mapeo básico de rangos a capítulos
  const capituloMap: { [key: string]: { nombre: string; rango: string } } = {
    'A': { nombre: 'Enfermedades infecciosas y parasitarias', rango: 'A00-B99' },
    'B': { nombre: 'Enfermedades infecciosas y parasitarias', rango: 'A00-B99' },
    'C': { nombre: 'Tumores [neoplasias]', rango: 'C00-D48' },
    'D': { nombre: 'Tumores [neoplasias]', rango: 'C00-D48' },
    'E': { nombre: 'Enfermedades endocrinas, nutricionales y metabólicas', rango: 'E00-E90' },
    'F': { nombre: 'Trastornos mentales y del comportamiento', rango: 'F00-F99' },
    'G': { nombre: 'Enfermedades del sistema nervioso', rango: 'G00-G99' },
    'H': { nombre: 'Enfermedades del ojo y sus anexos / Enfermedades del oído', rango: 'H00-H95' },
    'I': { nombre: 'Enfermedades del sistema circulatorio', rango: 'I00-I99' },
    'J': { nombre: 'Enfermedades del sistema respiratorio', rango: 'J00-J99' },
    'K': { nombre: 'Enfermedades del sistema digestivo', rango: 'K00-K93' },
    'L': { nombre: 'Enfermedades de la piel y del tejido subcutáneo', rango: 'L00-L99' },
    'M': { nombre: 'Enfermedades del sistema osteomuscular', rango: 'M00-M99' },
    'N': { nombre: 'Enfermedades del sistema genitourinario', rango: 'N00-N99' },
    'O': { nombre: 'Embarazo, parto y puerperio', rango: 'O00-O99' },
    'P': { nombre: 'Afecciones originadas en el período perinatal', rango: 'P00-P96' },
    'Q': { nombre: 'Malformaciones congénitas', rango: 'Q00-Q99' },
    'R': { nombre: 'Síntomas, signos y hallazgos anormales', rango: 'R00-R99' },
    'S': { nombre: 'Traumatismos, envenenamientos', rango: 'S00-T98' },
    'T': { nombre: 'Traumatismos, envenenamientos', rango: 'S00-T98' },
    'V': { nombre: 'Causas externas de morbilidad y mortalidad', rango: 'V01-Y98' },
    'W': { nombre: 'Causas externas de morbilidad y mortalidad', rango: 'V01-Y98' },
    'X': { nombre: 'Causas externas de morbilidad y mortalidad', rango: 'V01-Y98' },
    'Y': { nombre: 'Causas externas de morbilidad y mortalidad', rango: 'V01-Y98' },
    'Z': { nombre: 'Factores que influyen en el estado de salud', rango: 'Z00-Z99' },
  };

  const primeraLetra = codigo.charAt(0).toUpperCase();
  if (capituloMap[primeraLetra]) {
    capitulo = capituloMap[primeraLetra].nombre;
    rango_capitulo = capituloMap[primeraLetra].rango;
  }

  return {
    codigo,
    descripcion,
    nivel,
    codigo_padre,
    capitulo,
    rango_capitulo,
    activo: true,
  };
}

/**
 * Importar códigos CIE-10 desde CSV
 */
async function importCie10(): Promise<void> {
  try {
    console.log('🚀 Iniciando importación de códigos CIE-10...\n');

    // 1. Conectar a la BD
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida\n');

    const cie10Repository = dataSource.getRepository(Cie10Code);

    // 2. Verificar si ya hay datos
    const count = await cie10Repository.count();
    if (count > 0) {
      console.log(`⚠️  Ya existen ${count} códigos en la BD`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise<string>((resolve) => {
        readline.question('¿Desea eliminar y reimportar? (s/n): ', resolve);
      });
      readline.close();

      if (answer.toLowerCase() !== 's') {
        console.log('❌ Importación cancelada');
        await dataSource.destroy();
        return;
      }

      console.log('🗑️  Eliminando códigos existentes...');
      await cie10Repository.clear();
      console.log('✅ Códigos eliminados\n');
    }

    // 3. Descargar CSV si no existe
    if (!fs.existsSync(CSV_PATH)) {
      await downloadCSV();
    } else {
      console.log('📄 Usando CSV local existente');
    }

    // 4. Leer y parsear CSV
    console.log('📖 Leyendo CSV...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n');
    console.log(`📊 Total de líneas: ${lines.length}\n`);

    // 5. Procesar en lotes
    const BATCH_SIZE = 500;
    let batch: Partial<Cie10Code>[] = [];
    let totalImported = 0;
    let totalSkipped = 0;

    console.log('💾 Importando códigos...');

    for (let i = 0; i < lines.length; i++) {
      const parsed = parseCSVLine(lines[i]);

      if (parsed) {
        batch.push(parsed);

        if (batch.length >= BATCH_SIZE) {
          await cie10Repository.save(batch);
          totalImported += batch.length;
          console.log(`  ✓ Importados: ${totalImported} códigos`);
          batch = [];
        }
      } else {
        totalSkipped++;
      }
    }

    // Guardar último lote
    if (batch.length > 0) {
      await cie10Repository.save(batch);
      totalImported += batch.length;
      console.log(`  ✓ Importados: ${totalImported} códigos`);
    }

    // 6. Estadísticas finales
    console.log('\n📊 ESTADÍSTICAS FINALES:');
    console.log(`  ✅ Total importados: ${totalImported}`);
    console.log(`  ⏭️  Total omitidos: ${totalSkipped}`);

    const stats = await Promise.all([
      cie10Repository.count({ where: { nivel: 0 } }),
      cie10Repository.count({ where: { nivel: 1 } }),
      cie10Repository.count({ where: { nivel: 2 } }),
    ]);

    console.log(`  📚 Capítulos: ${stats[0]}`);
    console.log(`  📖 Categorías: ${stats[1]}`);
    console.log(`  📄 Subcategorías: ${stats[2]}`);

    console.log('\n✅ Importación completada exitosamente!');

    // 7. Cerrar conexión
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar
importCie10();
