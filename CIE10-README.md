# 📚 Sistema CIE-10 - Guía de Uso

## **¿Qué es CIE-10?**

La **Clasificación Internacional de Enfermedades, 10ª revisión (CIE-10)** es un sistema de clasificación de enfermedades publicado por la Organización Mundial de la Salud (OMS). Contiene aproximadamente **14,000 códigos únicos** organizados jerárquicamente.

### **Estructura de Códigos**

```
Capítulos:    A00-B99, C00-D48, E00-E90, etc.
Categorías:   E10, E11, E12 (dentro de E00-E90)
Subcategorías: E11.0, E11.1, E11.9 (dentro de E11)
```

### **Ejemplo**

```
Código:      E11.9
Descripción: "Diabetes mellitus tipo 2 sin mención de complicación"
Capítulo:    "Enfermedades endocrinas, nutricionales y metabólicas"
Rango:       E00-E90
Nivel:       2 (subcategoría)
```

---

## **🚀 Instalación y Configuración**

### **1. Ejecutar Migraciones**

```bash
cd yo-participo-api
npm run migration:run
```

Esto creará las tablas:
- ✅ `research_sites` (Instituciones)
- ✅ `cie10_codes` (Códigos CIE-10)
- ✅ Campos nuevos en `patient_intakes` y `trials`

### **2. Importar Códigos CIE-10**

```bash
npm run import:cie10
```

Este script:
1. Descarga el CSV desde GitHub (https://github.com/verasativa/CIE-10)
2. Parsea ~14,000 códigos
3. Los importa a la base de datos en lotes
4. Muestra estadísticas finales

**Tiempo estimado:** 2-3 minutos

**Salida esperada:**
```
🚀 Iniciando importación de códigos CIE-10...
🔌 Conectando a la base de datos...
✅ Conexión establecida
📥 Descargando CSV desde GitHub...
✅ CSV descargado exitosamente
📖 Leyendo CSV...
📊 Total de líneas: 14523
💾 Importando códigos...
  ✓ Importados: 500 códigos
  ✓ Importados: 1000 códigos
  ...
  ✓ Importados: 14000 códigos

📊 ESTADÍSTICAS FINALES:
  ✅ Total importados: 14000
  ⏭️  Total omitidos: 523
  📚 Capítulos: 22
  📖 Categorías: 2036
  📄 Subcategorías: 11942

✅ Importación completada exitosamente!
```

---

## **📡 Endpoints API**

### **Búsqueda de Códigos CIE-10**

```http
GET /cie10/search?q=diabetes&limit=20
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "codigo": "E10",
    "descripcion": "Diabetes mellitus tipo 1",
    "nivel": 1,
    "capitulo": "Enfermedades endocrinas, nutricionales y metabólicas",
    "rango_capitulo": "E00-E90",
    "activo": true
  },
  {
    "id": "uuid",
    "codigo": "E11",
    "descripcion": "Diabetes mellitus tipo 2",
    "nivel": 1,
    "capitulo": "Enfermedades endocrinas, nutricionales y metabólicas",
    "rango_capitulo": "E00-E90",
    "activo": true
  }
]
```

### **Obtener Código Específico**

```http
GET /cie10/codigo/E11.9
```

### **Listar Capítulos**

```http
GET /cie10/capitulos
```

### **Códigos por Capítulo**

```http
GET /cie10/capitulo/E00-E90
```

### **Estadísticas**

```http
GET /cie10/stats
```

---

## **💾 Uso en PatientIntake**

### **Campos Nuevos**

```typescript
{
  // Array de códigos CIE-10
  codigos_cie10: ["E11.9", "I10", "E78.5"],
  
  // Texto libre para otras condiciones
  otrasEnfermedades: "Condición rara sin código CIE-10"
}
```

### **Ejemplo de Creación**

```http
POST /patient-intakes
Content-Type: application/json

{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "rut": "12345678-9",
  "fechaNacimiento": "1980-01-01",
  "sexo": "Hombre",
  "telefono": "+56912345678",
  "email": "juan@example.com",
  "region": "Metropolitana",
  "comuna": "Santiago",
  "condicionPrincipal": "Diabetes",
  "codigos_cie10": ["E11.9"],
  "otrasEnfermedades": "Hipertensión leve",
  "aceptaTerminos": true,
  "aceptaPrivacidad": true
}
```

---

## **🎯 Uso en Trials (Criterios de Inclusión)**

### **Estructura Mejorada**

```typescript
{
  inclusion_criteria: {
    // Edad
    edad_minima: 18,
    edad_maxima: 65,
    
    // Género
    genero: "Todos",
    
    // Códigos CIE-10 REQUERIDOS (el paciente DEBE tener al menos uno)
    codigos_cie10_requeridos: ["E11", "E10"], // Diabetes tipo 1 o 2
    
    // Códigos CIE-10 EXCLUIDOS (el paciente NO debe tener ninguno)
    codigos_cie10_excluidos: ["I50", "N18"], // Insuficiencia cardíaca o renal
    
    // Legacy (texto libre, mantener por compatibilidad)
    condiciones_requeridas: ["Diabetes"],
    condiciones_excluidas: ["Cáncer"],
    medicamentos_prohibidos: ["Metformina"],
    
    // Otros criterios
    fumador_permitido: false,
    otros_criterios: "Paciente debe estar dispuesto a viajar"
  }
}
```

---

## **🔍 Algoritmo de Matching Mejorado**

### **Prioridad de Matching**

1. **Códigos CIE-10 EXCLUIDOS** (eliminatorio)
   - Si el paciente tiene un código excluido → Score = 0

2. **Códigos CIE-10 REQUERIDOS** (peso: 50 puntos)
   - Matching jerárquico: `E11.9` coincide con `E11`
   - Múltiples coincidencias suman más puntos

3. **Condición Principal** (peso: 40 puntos)
   - Matching de texto libre (legacy)

4. **Patologías** (peso: 30 puntos)
   - Matching de texto libre (legacy)

5. **Descripción de Condición** (peso: 20 puntos)
   - Matching de texto libre (legacy)

6. **Cupos Disponibles** (peso: 10 puntos)
   - Bonus si el ensayo tiene cupos

### **Matching Jerárquico de CIE-10**

```typescript
// Ejemplos de coincidencias:
matchCie10Code("E11.9", "E11")   => true  // E11.9 es subcategoría de E11
matchCie10Code("E11", "E11.9")   => true  // E11 incluye todas sus subcategorías
matchCie10Code("E11.9", "E11.9") => true  // Exacto
matchCie10Code("E11.9", "E10")   => false // Diferentes categorías
```

---

## **📊 Capítulos Principales CIE-10**

| Rango | Capítulo |
|-------|----------|
| A00-B99 | Enfermedades infecciosas y parasitarias |
| C00-D48 | Tumores [neoplasias] |
| E00-E90 | Enfermedades endocrinas, nutricionales y metabólicas |
| F00-F99 | Trastornos mentales y del comportamiento |
| G00-G99 | Enfermedades del sistema nervioso |
| H00-H95 | Enfermedades del ojo / oído |
| I00-I99 | Enfermedades del sistema circulatorio |
| J00-J99 | Enfermedades del sistema respiratorio |
| K00-K93 | Enfermedades del sistema digestivo |
| L00-L99 | Enfermedades de la piel |
| M00-M99 | Enfermedades del sistema osteomuscular |
| N00-N99 | Enfermedades del sistema genitourinario |
| O00-O99 | Embarazo, parto y puerperio |
| P00-P96 | Afecciones del período perinatal |
| Q00-Q99 | Malformaciones congénitas |
| R00-R99 | Síntomas, signos y hallazgos anormales |
| S00-T98 | Traumatismos, envenenamientos |
| V01-Y98 | Causas externas de morbilidad |
| Z00-Z99 | Factores que influyen en el estado de salud |

---

## **🛠️ Mantenimiento**

### **Reimportar Códigos**

Si necesitas actualizar los códigos CIE-10:

```bash
npm run import:cie10
```

El script preguntará si deseas eliminar y reimportar.

### **Verificar Integridad**

```http
GET /cie10/stats
```

Debe mostrar:
- Total: ~14,000 códigos
- Capítulos: ~22
- Categorías: ~2,000
- Subcategorías: ~12,000

---

## **✅ Ventajas del Sistema CIE-10**

| Ventaja | Descripción |
|---------|-------------|
| **Estandarización** | Códigos internacionales reconocidos por la OMS |
| **Matching Preciso** | `E11` siempre es Diabetes tipo 2, sin ambigüedad |
| **Jerarquía** | `E11.9` incluye automáticamente `E11` |
| **Búsqueda Eficiente** | Índices optimizados en la BD |
| **Escalabilidad** | Base sólida para futuras funcionalidades |
| **Interoperabilidad** | Compatible con sistemas médicos externos |

---

## **🔗 Referencias**

- **OMS CIE-10:** https://www.who.int/es/standards/classifications/classification-of-diseases
- **Dataset GitHub:** https://github.com/verasativa/CIE-10
- **Documentación Oficial:** https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/CIE10/

---

## **📝 Notas Importantes**

1. Los endpoints de CIE-10 son **públicos** (no requieren autenticación) para usarse en el formulario web de pacientes.

2. Los códigos CIE-10 son **opcionales** en `PatientIntake`. Si no se proporcionan, el matching usará solo texto libre (legacy).

3. El campo `otrasEnfermedades` permite capturar condiciones que no tienen código CIE-10 asignado.

4. El matching es **tolerante**: si un ensayo requiere `E11` (Diabetes tipo 2) y el paciente tiene `E11.9` (Diabetes tipo 2 sin complicaciones), habrá coincidencia.

5. Los códigos excluidos son **eliminatorios**: si un paciente tiene aunque sea uno, el score será 0 automáticamente.
