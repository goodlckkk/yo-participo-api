import { IsString, IsNotEmpty, IsObject, IsUUID, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
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
}
