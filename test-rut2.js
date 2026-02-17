// Test manual del RUT 6.583.677-K
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

console.log('=== Probando RUT 6.583.677-K ===');
validateRut('6.583.677-K');

console.log('\n=== Probando RUT 16.416.085-0 ===');
validateRut('16.416.085-0');