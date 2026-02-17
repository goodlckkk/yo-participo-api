import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para separar las comunas de los sitios de investigación
 *
 * Esta migración corrige el error donde se insertaron las 346 comunas de Chile
 * en la tabla research_sites. Crea una tabla communes separada y limpia los datos.
 */

// Lista completa de 346 comunas de Chile con sus regiones
const communesWithRegions = [
  // Región de Arica y Parinacota
  { nombre: 'Arica', region: 'Arica y Parinacota', codigo_region: 'XV' },
  { nombre: 'Camarones', region: 'Arica y Parinacota', codigo_region: 'XV' },
  { nombre: 'Putre', region: 'Arica y Parinacota', codigo_region: 'XV' },
  {
    nombre: 'General Lagos',
    region: 'Arica y Parinacota',
    codigo_region: 'XV',
  },

  // Región de Tarapacá
  { nombre: 'Iquique', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Alto Hospicio', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Pozo Almonte', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Camiña', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Colchane', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Huara', region: 'Tarapacá', codigo_region: 'I' },
  { nombre: 'Pica', region: 'Tarapacá', codigo_region: 'I' },

  // Región de Antofagasta
  { nombre: 'Antofagasta', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'Mejillones', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'Sierra Gorda', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'Taltal', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'Calama', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'Ollagüe', region: 'Antofagasta', codigo_region: 'II' },
  {
    nombre: 'San Pedro de Atacama',
    region: 'Antofagasta',
    codigo_region: 'II',
  },
  { nombre: 'Tocopilla', region: 'Antofagasta', codigo_region: 'II' },
  { nombre: 'María Elena', region: 'Antofagasta', codigo_region: 'II' },

  // Región de Atacama
  { nombre: 'Copiapó', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Caldera', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Tierra Amarilla', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Chañaral', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Diego de Almagro', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Vallenar', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Alto del Carmen', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Freirina', region: 'Atacama', codigo_region: 'III' },
  { nombre: 'Huasco', region: 'Atacama', codigo_region: 'III' },

  // Región de Coquimbo
  { nombre: 'La Serena', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Coquimbo', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Andacollo', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'La Higuera', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Paihuano', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Vicuña', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Illapel', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Canela', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Los Vilos', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Salamanca', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Ovalle', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Combarbalá', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Monte Patria', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Punitaqui', region: 'Coquimbo', codigo_region: 'IV' },
  { nombre: 'Río Hurtado', region: 'Coquimbo', codigo_region: 'IV' },

  // Región de Valparaíso (continuación completa)
  { nombre: 'Valparaíso', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Casablanca', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Concón', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Juan Fernández', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Puchuncaví', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Quintero', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Viña del Mar', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Isla de Pascua', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Los Andes', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Calle Larga', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Rinconada', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'San Esteban', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'La Ligua', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Cabildo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Papudo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Petorca', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Zapallar', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Quillota', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Calera', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Hijuelas', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'La Cruz', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Nogales', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'San Antonio', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Algarrobo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Cartagena', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'El Quisco', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'El Tabo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Santo Domingo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'San Felipe', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Catemu', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Llaillay', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Panquehue', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Putaendo', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Santa María', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Quilpué', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Limache', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Olmué', region: 'Valparaíso', codigo_region: 'V' },
  { nombre: 'Villa Alemana', region: 'Valparaíso', codigo_region: 'V' },

  // Región Metropolitana (continuación completa)
  { nombre: 'Santiago', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Cerrillos', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Cerro Navia', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Conchalí', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'El Bosque', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Estación Central', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Huechuraba', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Independencia', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'La Cisterna', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'La Florida', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'La Granja', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'La Pintana', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'La Reina', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Las Condes', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Lo Barnechea', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Lo Espejo', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Lo Prado', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Macul', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Maipú', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Ñuñoa', region: 'Metropolitana', codigo_region: 'RM' },
  {
    nombre: 'Pedro Aguirre Cerda',
    region: 'Metropolitana',
    codigo_region: 'RM',
  },
  { nombre: 'Peñalolén', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Providencia', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Pudahuel', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Quilicura', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Quinta Normal', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Recoleta', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Renca', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San Joaquín', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San Miguel', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San Ramón', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Vitacura', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Puente Alto', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Pirque', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San José de Maipo', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Colina', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Lampa', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Tiltil', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San Bernardo', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Buin', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Calera de Tango', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Paine', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Melipilla', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Alhué', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Curacaví', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'María Pinto', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'San Pedro', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Talagante', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'El Monte', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Isla de Maipo', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Padre Hurtado', region: 'Metropolitana', codigo_region: 'RM' },
  { nombre: 'Peñaflor', region: 'Metropolitana', codigo_region: 'RM' },

  // Región de O'Higgins (continuación completa)
  { nombre: 'Rancagua', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Codegua', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Coinco', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Coltauco', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Doñihue', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Graneros', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Las Cabras', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Machalí', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Malloa', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Mostazal', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Olivar', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Peumo', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Pichidegua', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Quinta de Tilcoco', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Rengo', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Requínoa', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'San Vicente', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Pichilemu', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'La Estrella', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Litueche', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Marchihue', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Navidad', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Santa Cruz', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Chépica', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Chimbarongo', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Lolol', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Nancagua', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Palmilla', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Peralillo', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Placilla', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'Pumanque', region: "O'Higgins", codigo_region: 'VI' },
  { nombre: 'San Fernando', region: "O'Higgins", codigo_region: 'VI' },

  // Región del Maule (continuación completa)
  { nombre: 'Talca', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Constitución', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Curepto', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Empedrado', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Maule', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Pelarco', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Pencahue', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Río Claro', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'San Clemente', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'San Rafael', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Cauquenes', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Chanco', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Pelluhue', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Curicó', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Hualañé', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Licantén', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Molina', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Rauco', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Romeral', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Sagrada Familia', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Teno', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Vichuquén', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Linares', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Colbún', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Longaví', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Parral', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Retiro', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'San Javier', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Villa Alegre', region: 'Maule', codigo_region: 'VII' },
  { nombre: 'Yerbas Buenas', region: 'Maule', codigo_region: 'VII' },

  // Región de Ñuble (continuación completa)
  { nombre: 'Chillán', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Bulnes', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Chillán Viejo', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'El Carmen', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Pemuco', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Pinto', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Quillón', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'San Ignacio', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Yungay', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Quirihue', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Cobquecura', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Coelemu', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Ninhue', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Portezuelo', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Ránquil', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Treguaco', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'San Carlos', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Coihueco', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'Ñiquén', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'San Fabián', region: 'Ñuble', codigo_region: 'XVI' },
  { nombre: 'San Nicolás', region: 'Ñuble', codigo_region: 'XVI' },

  // Región del Biobío (continuación completa)
  { nombre: 'Concepción', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Coronel', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Chiguayante', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Florida', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Hualpén', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Hualqui', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Lota', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Penco', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'San Pedro de la Paz', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Santa Juana', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Talcahuano', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Tomé', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Arauco', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Cañete', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Contulmo', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Curanilahue', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Lebu', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Los Álamos', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Tirúa', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Los Ángeles', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Antuco', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Cabrero', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Laja', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Mulchén', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Nacimiento', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Negrete', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Quilaco', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Quilleco', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'San Rosendo', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Santa Bárbara', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Tucapel', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Yumbel', region: 'Biobío', codigo_region: 'VIII' },
  { nombre: 'Alto Biobío', region: 'Biobío', codigo_region: 'VIII' },

  // Región de La Araucanía (continuación completa)
  { nombre: 'Temuco', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Carahue', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Cunco', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Curarrehue', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Freire', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Galvarino', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Gorbea', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Lautaro', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Loncoche', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Melipeuco', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Nueva Imperial', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Padre Las Casas', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Perquenco', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Pitrufquén', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Pucón', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Saavedra', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Teodoro Schmidt', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Toltén', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Vilcún', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Villarrica', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Cholchol', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Angol', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Collipulli', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Curacautín', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Ercilla', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Lonquimay', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Los Sauces', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Lumaco', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Purén', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Renaico', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Traiguén', region: 'La Araucanía', codigo_region: 'IX' },
  { nombre: 'Victoria', region: 'La Araucanía', codigo_region: 'IX' },

  // Región de Los Ríos
  { nombre: 'Valdivia', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Corral', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Lanco', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Los Lagos', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Máfil', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Mariquina', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Paillaco', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Panguipulli', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'La Unión', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Futrono', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Lago Ranco', region: 'Los Ríos', codigo_region: 'XIV' },
  { nombre: 'Río Bueno', region: 'Los Ríos', codigo_region: 'XIV' },

  // Región de Los Lagos
  { nombre: 'Puerto Montt', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Calbuco', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Cochamó', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Fresia', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Frutillar', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Los Muermos', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Llanquihue', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Maullín', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Puerto Varas', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Castro', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Ancud', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Chonchi', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Curaco de Vélez', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Dalcahue', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Puqueldón', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Queilén', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Quellón', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Quemchi', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Quinchao', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Osorno', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Puerto Octay', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Purranque', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Puyehue', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Río Negro', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'San Juan de la Costa', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'San Pablo', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Chaitén', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Futaleufú', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Hualaihué', region: 'Los Lagos', codigo_region: 'X' },
  { nombre: 'Palena', region: 'Los Lagos', codigo_region: 'X' },

  // Región de Aysén
  { nombre: 'Coyhaique', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Lago Verde', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Aysén', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Cisnes', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Guaitecas', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Cochrane', region: 'Aysén', codigo_region: 'XI' },
  { nombre: "O'Higgins", region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Tortel', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Chile Chico', region: 'Aysén', codigo_region: 'XI' },
  { nombre: 'Río Ibáñez', region: 'Aysén', codigo_region: 'XI' },

  // Región de Magallanes
  { nombre: 'Punta Arenas', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Laguna Blanca', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Río Verde', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'San Gregorio', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Cabo de Hornos', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Antártica', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Porvenir', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Primavera', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Timaukel', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Natales', region: 'Magallanes', codigo_region: 'XII' },
  { nombre: 'Torres del Paine', region: 'Magallanes', codigo_region: 'XII' },
];

export class FixSeparateCommunesFromSites1771300000000
  implements MigrationInterface
{
  name = 'FixSeparateCommunesFromSites1771300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Paso A: Crear tabla communes
    await queryRunner.query(`
      CREATE TABLE communes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        codigo_region VARCHAR(50) NULL,
        activa BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Paso B: Poblar tabla communes con las 346 comunas de Chile
    // Usamos inserción individual con parámetros para evitar problemas de escape
    for (const commune of communesWithRegions) {
      await queryRunner.query(
        `INSERT INTO communes (nombre, region, codigo_region, activa, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [
          commune.nombre,
          commune.region,
          commune.codigo_region || null,
          true
        ]
      );
    }
    console.log(`Insertadas ${communesWithRegions.length} comunas correctamente`);

    // Paso C: LIMPIEZA SEGURA - Eliminar solo comunas sin datos asociados
    const communeNames = communesWithRegions.map((c) =>
      c.nombre.replace(/\'/g, "\\'"),
    );
    const communeNamesList = communeNames.map((name) => `'${name}'`).join(',');

    // PRIMERO: Verificar qué registros vamos a eliminar para logging
    // Usamos parámetros preparados para evitar problemas de escape
    const communesToDelete = await queryRunner.query(
      `SELECT rs.id, rs.nombre, rs.direccion, rs.descripcion, rs.telefono,
               (SELECT COUNT(*) FROM trials WHERE research_site_id = rs.id) as trial_count,
               (SELECT COUNT(*) FROM patient_intakes WHERE "referralResearchSiteId" = rs.id) as patient_count
        FROM research_sites rs
        WHERE rs.nombre = ANY($1)
        ORDER BY rs.nombre`,
      [communeNames]
    );

    console.log(`Encontradas ${communesToDelete.length} comunas en research_sites:`);
    communesToDelete.forEach(commune => {
      console.log(`- ${commune.nombre}: ${commune.trial_count} estudios, ${commune.patient_count} pacientes`);
    });

    // SEGUNDO: Eliminar SOLO las comunas que NO tienen datos asociados
    // Esto protege los sitios de investigación legítimos que podrían tener nombres de comunas
    await queryRunner.query(
      `DELETE FROM research_sites 
       WHERE nombre = ANY($1)
       AND id NOT IN (
         SELECT DISTINCT research_site_id FROM trials WHERE research_site_id IS NOT NULL
       )
       AND id NOT IN (
         SELECT DISTINCT referralResearchSiteId FROM patient_intakes WHERE referralResearchSiteId IS NOT NULL
       )
       AND (direccion IS NULL OR direccion = '')
       AND (descripcion IS NULL OR descripcion = '')
       AND (telefono IS NULL OR telefono = '')`,
      [communeNames]
    );

    // Log de la operación
    const deletedCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM research_sites 
       WHERE nombre = ANY($1)`,
      [communeNames]
    );
    
    console.log(`\n✅ Migración completada. Se eliminaron ${deletedCount[0]?.count || 0} comunas sin datos asociados.`);
    console.log(`ℹ️  Se preservaron las comunas que tienen estudios o pacientes asociados.`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir: Eliminar tabla communes
    await queryRunner.query(`DROP TABLE communes`);

    // NOTA: No podemos restaurar automáticamente las comunas eliminadas de research_sites
    // ya que esa información se perdió. Esto requeriría un backup o seed manual.
  }
}
