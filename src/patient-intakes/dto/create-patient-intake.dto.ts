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
  @IsIn(['masculino', 'femenino'])
  sexo: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

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

  @IsString()
  @IsNotEmpty()
  descripcionCondicion: string;

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
  patologias?: string[];

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
