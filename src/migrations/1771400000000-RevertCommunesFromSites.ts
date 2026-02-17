import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertCommunesFromSites1771400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 Iniciando limpieza de comunas de la tabla research_sites...');
    
    // Lista completa de las 346 comunas de Chile
    const comunasChile = [
      'Arica', 'Camarones', 'Putre', 'General Lagos', 'Iquique', 'Alto Hospicio',
      'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica', 'Antofagasta',
      'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama',
      'Tocopilla', 'María Elena', 'Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral',
      'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco', 'La Serena',
      'Coquimbo', 'Andacollo', 'La Higuera', 'Paihuano', 'Vicuña', 'Illapel', 'Canela',
      'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui',
      'Río Hurtado', 'Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví',
      'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada',
      'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota',
      'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena',
      'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue',
      'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana', 'Rancagua',
      'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí',
      'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo',
      'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue',
      'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua',
      'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz', 'Talca', 'Constitución',
      'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente',
      'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén',
      'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares',
      'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas',
      'Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco',
      'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu',
      'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles',
      'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco',
      'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío', 'Chillán',
      'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'Chillán Viejo', 'El Carmen',
      'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue',
      'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco',
      'Yungay', 'Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino',
      'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas',
      'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén',
      'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla',
      'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria',
      'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco',
      'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno', 'Puerto Montt',
      'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín',
      'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue',
      'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay',
      'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén',
      'Futaleufú', 'Hualaihué', 'Palena', 'Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes',
      'Guaitecas', 'Cochrane', 'O\'Higgins', 'Tortel', 'Chile Chico', 'Río Ibáñez',
      'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos',
      'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine',
      'Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
      'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana',
      'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú',
      'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura',
      'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón',
      'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil',
      'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví',
      'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado',
      'Peñaflor'
    ];

    // Primero: Contar cuántas comunas existen en la tabla
    // Usamos IN con parámetros preparados para cada comuna individualmente
    let totalComunas = 0;
    
    for (const comuna of comunasChile) {
      const countQuery = `SELECT COUNT(*) as count FROM research_sites WHERE nombre = $1`;
      const countResult = await queryRunner.query(countQuery, [comuna]);
      totalComunas += parseInt(countResult[0]?.count || 0);
    }
    
    console.log(`📊 Se encontraron ${totalComunas} comunas en research_sites`);

    if (totalComunas > 0) {
      let deletedCount = 0;
      
      // Eliminar cada comuna individualmente (más seguro con parámetros preparados)
      for (const comuna of comunasChile) {
        const deleteQuery = `
          DELETE FROM research_sites 
          WHERE nombre = $1
          AND (direccion IS NULL OR direccion = '')
          AND (descripcion IS NULL OR descripcion = '')
          AND (telefono IS NULL OR telefono = '')
        `;
        
        const result = await queryRunner.query(deleteQuery, [comuna]);
        if (result[1] > 0) {
          deletedCount += result[1];
          console.log(`✅ Eliminada comuna: ${comuna}`);
        }
      }
      
      console.log(`✅ Se eliminaron ${deletedCount} comunas de research_sites`);
      
      // Contar cuántas comunas quedan (con datos adicionales)
      let remainingComunas = 0;
      for (const comuna of comunasChile) {
        const countQuery = `SELECT COUNT(*) as count FROM research_sites WHERE nombre = $1`;
        const countResult = await queryRunner.query(countQuery, [comuna]);
        remainingComunas += parseInt(countResult[0]?.count || 0);
      }
      
      console.log(`📋 Quedan ${remainingComunas} registros que coinciden con nombres de comunas pero tienen datos adicionales (se preservan por seguridad)`);
    } else {
      console.log('ℹ️  No se encontraron comunas para eliminar');
    }

    console.log('🎉 Limpieza completada. Los sitios de investigación legítimos se preservaron.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Esta migración es de limpieza, no hay forma de revertirla de manera segura
    console.log('⚠️  Esta migración no se puede revertir de forma segura');
    console.log('ℹ️  La operación up() eliminó registros erróneos que no deberían restaurarse');
  }
}