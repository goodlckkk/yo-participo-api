import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
  IsBoolean,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear una nueva institución/sitio de investigación
 *
 * Campos requeridos:
 * - nombre: Nombre único de la institución
 *
 * Campos opcionales:
 * - direccion, ciudad, region, telefono, email, sitio_web, descripcion
 */
export class CreateResearchSiteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la institución es obligatorio' })
  @MaxLength(255)
  nombre: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  comuna?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  @MaxLength(500)
  sitio_web?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
