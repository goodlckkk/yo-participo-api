import { IsString, IsNotEmpty, IsObject, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { TrialStatus } from '../entities/trial.entity';

export class CreateTrialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  public_description: string;

  @IsObject()
  inclusion_criteria: object;

  @IsString()
  @IsNotEmpty()
  clinic_city: string;

  @IsUUID()
  @IsOptional() // Sponsor es opcional
  sponsor_id?: string; // Recibimos el ID del patrocinador (opcional)

  @IsEnum(TrialStatus)
  @IsOptional() // Status es opcional, por defecto será RECRUITING
  status?: TrialStatus;
}
