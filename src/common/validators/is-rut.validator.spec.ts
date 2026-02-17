import { validate } from 'class-validator';
import { IsRut } from './is-rut.validator';

class TestClass {
  @IsRut()
  rut: string;

  constructor(rut: string) {
    this.rut = rut;
  }
}

describe('IsRut Validator', () => {
  it('should validate correct RUT formats', async () => {
    const validRuts = [
      '12.345.678-5',    // RUT válido ejemplo 1
      '11.111.111-1',    // RUT válido ejemplo 2
      '111111111',        // Formato sin separadores (11.111.111-1)
    ];

    for (const rut of validRuts) {
      const testObj = new TestClass(rut);
      const errors = await validate(testObj);
      expect(errors).toHaveLength(0);
    }
  });

  it('should reject invalid RUTs', async () => {
    const invalidRuts = [
      '12345678-0',      // Dígito verificador incorrecto
      '12.345.678-0',    // Dígito verificador incorrecto con puntos
      '12345678',        // Sin dígito verificador
      'ABC45678-9',      // Letras en el cuerpo
      '12.345.678-',     // Sin dígito verificador
      '12.345.678-123',  // Dígito verificador demasiado largo
      '',                 // Vacío
      null,              // Nulo
      undefined,         // Indefinido
    ];

    for (const rut of invalidRuts) {
      if (rut === null || rut === undefined) {
        const testObj = new TestClass(rut as any);
        const errors = await validate(testObj);
        expect(errors).toHaveLength(1);
      } else {
        const testObj = new TestClass(rut);
        const errors = await validate(testObj);
        expect(errors).toHaveLength(1);
      }
    }
  });

  it('should validate edge cases', async () => {
    // RUT con formato sin separadores
    const testObj = new TestClass('111111111');
    const errors = await validate(testObj);
    expect(errors).toHaveLength(0);
  });
});