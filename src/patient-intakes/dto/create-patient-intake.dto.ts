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
import { IsRut } from '../../common/validators/is-rut.validator';

export class CreatePatientIntakeDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsRut({ message: 'El RUT ingresado no es válido. Debe seguir el formato chileno (ej: 12.345.678-9)' })
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

  // Campos estructurados (nuevos)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicamentosEstructurados?: string[];

  @IsOptional()
  @IsArray()
  alergiasEstructuradas?: Array<{ codigo: string; nombre: string }>;

  @IsOptional()
  @IsArray()
  otrasEnfermedadesEstructuradas?: Array<{ codigo: string; nombre: string }>;

  @IsBoolean()
  aceptaTerminos: boolean;

  @IsBoolean()
  aceptaPrivacidad: boolean;

  @IsOptional()
  @IsUUID()
  trialId?: string;

  @IsOptional()
  @IsUUID()
  referralResearchSiteId?: string;

  @IsEnum(PatientIntakeSource)
  @IsOptional() // Source es opcional, por defecto será WEB
  source?: PatientIntakeSource;
}
