import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validador personalizado para RUT chileno
 * Implementa el algoritmo oficial de validación de RUT
 * Acepta formatos: 12345678-9, 12.345.678-9, 123456789
 */
@ValidatorConstraint({ name: 'isRut', async: false })
export class IsRutConstraint implements ValidatorConstraintInterface {
  validate(rut: string, args: ValidationArguments): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }

    // Limpiar el RUT de puntos y guiones
    const cleanRut = rut.replace(/[.-]/g, '');

    // Validar formato básico
    if (cleanRut.length < 2) {
      return false;
    }

    // Separar cuerpo y dígito verificador
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(body)) {
      return false;
    }

    // Validar que el dígito verificador sea número o K
    if (!/^[0-9K]$/.test(dv)) {
      return false;
    }

    // Calcular dígito verificador esperado usando algoritmo oficial chileno
    let sum = 0;
    let multiplier = 2;

    // Recorrer el cuerpo de derecha a izquierda
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

    return dv === calculatedDv;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'El RUT ingresado no es válido. Debe seguir el formato chileno (ej: 12.345.678-9)';
  }
}

/**
 * Decorador para validar RUT chileno
 * @param validationOptions Opciones de validación de class-validator
 */
export function IsRut(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRutConstraint,
    });
  };
}