import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear una historia de éxito
 *
 * Validaciones:
 * - imageUrl: Obligatorio, máx 500 caracteres
 * - patientName: Opcional, máx 200 caracteres
 * - condition: Opcional, máx 200 caracteres
 * - story: Obligatorio, texto largo
 * - quote: Opcional, máx 500 caracteres
 * - order: Opcional, número entero (default: 0)
 * - isActive: Opcional, booleano (default: true)
 */
export class CreateSuccessStoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  imageUrl: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  patientName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  condition?: string;

  @IsString()
  @IsNotEmpty()
  story: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  quote?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
