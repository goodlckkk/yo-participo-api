import { IsString, IsNotEmpty, IsObject, IsUUID, IsOptional, IsEnum, IsInt, Min, IsDateString, IsUrl, MaxLength } from 'class-validator';
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

  @IsUUID()
  @IsNotEmpty()
  research_site_id: string;

  @IsInt()
  @Min(1)
  @IsOptional() // Máximo de participantes es opcional, por defecto será 30
  max_participants?: number;

  @IsInt()
  @Min(0)
  @IsOptional() // Participantes actuales es opcional, por defecto será 0
  current_participants?: number;

  @IsUUID()
  @IsOptional() // Sponsor es opcional
  sponsor_id?: string; // Recibimos el ID del patrocinador (opcional)

  @IsEnum(TrialStatus)
  @IsOptional() // Status es opcional, por defecto será RECRUITING
  status?: TrialStatus;

  @IsDateString()
  @IsOptional() // Fecha límite de reclutamiento es opcional
  recruitment_deadline?: string; // Formato ISO 8601 (YYYY-MM-DD)

  @IsUrl()
  @MaxLength(500)
  @IsOptional() // URL del sitio de investigación es opcional
  research_site_url?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional() // Nombre del sitio de investigación es opcional
  research_site_name?: string;
}
