import { IsString, IsNotEmpty, IsObject, IsUUID } from 'class-validator';

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
  @IsNotEmpty()
  sponsor_id: string; // Recibimos el ID del patrocinador
}
