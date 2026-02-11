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
  IsPhoneNumber,
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

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  telefono?: string;

  @IsOptional()
  @IsString()
  telefonoCodigoPais?: string;

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

  @IsBoolean()
  aceptaAlmacenamiento15Anos: boolean;

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
