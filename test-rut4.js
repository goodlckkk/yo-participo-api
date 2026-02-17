// Test con los RUTs que usaré en los tests
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

console.log('=== Verificando RUTs para tests ===');

console.log('\n1. 12.345.678-5:');
validateRut('12.345.678-5');

console.log('\n2. 11.111.111-1:');
validateRut('11.111.111-1');

console.log('\n3. 9.840.380-5:');
validateRut('9.840.380-5');

console.log('\n4. 98403805:');
validateRut('98403805');

console.log('\n5. 6.583.677-0:');
validateRut('6.583.677-0');

console.log('\n6. 111111111:');
validateRut('111111111');