import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PatientIntakeSource } from '../entities/patient-intake.entity';

export class CreatePatientIntakeDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsString()
  @IsIn(['Hombre', 'Mujer', 'masculino', 'femenino']) // Aceptar ambos formatos
  sexo: string;

  /**
   * Teléfono completo (legacy, mantener por compatibilidad)
   * Ahora es opcional si se envían telefonoCodigoPais + telefonoNumero
   */
  @IsOptional()
  @IsString()
  telefono?: string;

  /**
   * Código de país del teléfono
   * Ejemplos: "+56", "+1", "+34"
   */
  @IsOptional()
  @IsString()
  telefonoCodigoPais?: string;

  /**
   * Número de teléfono sin código de país
   * Ejemplo: "912345678"
   */
  @IsOptional()
  @IsString()
  telefonoNumero?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  comuna: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsString()
  @IsNotEmpty()
  condicionPrincipal: string;

  @IsOptional()
  @IsString()
  condicionPrincipalCodigo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  patologias?: string[];

  @IsOptional()
  @IsString()
  descripcionCondicion?: string;

  @IsOptional()
  @IsString()
  medicamentosActuales?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  cirugiasPrevias?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  codigos_cie10?: string[];

  @IsOptional()
  @IsString()
  otrasEnfermedades?: string;

  @IsBoolean()
  aceptaTerminos: boolean;

  @IsBoolean()
  aceptaPrivacidad: boolean;

  @IsOptional()
  @IsUUID()
  trialId?: string;

  @IsEnum(PatientIntakeSource)
  @IsOptional() // Source es opcional, por defecto será WEB
  source?: PatientIntakeSource;
}
