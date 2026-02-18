import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTrialRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del estudio es obligatorio' })
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del estudio es obligatoria' })
  @MaxLength(1000)
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  additionalNotes?: string;
}