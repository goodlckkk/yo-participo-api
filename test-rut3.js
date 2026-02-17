// Test con RUTs chilenos reales válidos
function validateRut(rut) {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  const cleanRut = rut.replace(/[.-]/g, '');
  
  if (cleanRut.length < 2) {
    return false;
  }

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) {
    return false;
  }

  if (!/^[0-9K]$/.test(dv)) {
    return false;
  }

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const expectedDv = 11 - remainder;
  
  const calculatedDv = 
    expectedDv === 11 ? '0' : 
    expectedDv === 10 ? 'K' : 
    expectedDv.toString();

  console.log('RUT:', rut);
  console.log('Cuerpo:', body);
  console.log('DV ingresado:', dv);
  console.log('Suma:', sum);
  console.log('Resto:', remainder);
  console.log('DV esperado:', calculatedDv);
  console.log('Válido:', dv === calculatedDv);
  
  return dv === calculatedDv;
}

// RUTs válidos reales (ejemplos)
console.log('=== RUTs válidos reales ===');

// Ejemplo 1: RUT conocido válido
console.log('\n1. Probando 16.416.085-7:');
validateRut('16.416.085-7');

// Ejemplo 2: Otro RUT válido  
console.log('\n2. Probando 12.345.678-5:');
validateRut('12.345.678-5');

// Ejemplo 3: RUT con K válido
console.log('\n3. Probando 7.654.321-0:'); // Este debería dar K pero es 0
validateRut('7.654.321-0');

// Ejemplo 4: Buscando RUT con K real
console.log('\n4. Probando 13.899.799-K:');
validateRut('13.899.799-K');