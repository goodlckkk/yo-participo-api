import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validador personalizado para RUT chileno
 * Valida el formato y el dígito verificador según el algoritmo oficial de Chile
 */
@ValidatorConstraint({ name: 'isRut', async: false })
export class IsRutConstraint implements ValidatorConstraintInterface {
  /**
   * Valida si un RUT chileno es válido
   * @param rut - RUT a validar (puede estar formateado o sin formato)
   * @returns true si el RUT es válido
   */
  validate(rut: string, args: ValidationArguments): boolean {
    if (!rut || typeof rut !== 'string') {
      return false;
    }

    // Limpiar el RUT: eliminar puntos, guiones y espacios
    const cleanRut = rut.replace(/[.\-\s]/g, '').toUpperCase();

    // Verificar longitud mínima y máxima
    if (cleanRut.length < 8 || cleanRut.length > 10) {
      return false;
    }

    // Separar el cuerpo del dígito verificador
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Verificar que el cuerpo solo contenga dígitos
    if (!/^\d+$/.test(body)) {
      return false;
    }

    // Verificar que el dígito verificador sea un dígito o 'K'
    if (!/^[0-9K]$/.test(dv)) {
      return false;
    }

    // Calcular el dígito verificador esperado
    const calculatedDv = this.calculateVerifierDigit(body);

    // Comparar con el dígito verificador proporcionado
    return calculatedDv === dv;
  }

  /**
   * Calcula el dígito verificador de un RUT chileno
   * @param body - Cuerpo del RUT (sin dígito verificador)
   * @returns Dígito verificador calculado ('0'-'9' o 'K')
   */
  private calculateVerifierDigit(body: string): string {
    let sum = 0;
    let multiplier = 2;

    // Recorrer el cuerpo de derecha a izquierda
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = 11 - (sum % 11);
    
    if (remainder === 11) return '0';
    if (remainder === 10) return 'K';
    return remainder.toString();
  }

  defaultMessage(args: ValidationArguments): string {
    return 'El RUT proporcionado no es válido. Debe tener el formato correcto y dígito verificador válido.';
  }
}

/**
 * Decorador @IsRut() para validar RUT chilenos
 * @param validationOptions - Opciones de validación de class-validator
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