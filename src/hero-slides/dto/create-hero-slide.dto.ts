import { IsString, IsOptional, IsInt, IsBoolean, IsUrl, MaxLength } from 'class-validator';

/**
 * DTO para crear un slide del hero
 * 
 * Valida los datos de entrada al crear un nuevo slide.
 * La imagen es obligatoria, el resto de campos son opcionales.
 */
export class CreateHeroSlideDto {
  /**
   * URL de la imagen del slide
   * Puede ser una URL completa, ruta relativa o imagen en base64
   */
  @IsString()
  imageUrl: string;

  /**
   * Título del slide (opcional)
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  /**
   * Descripción del slide (opcional)
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Texto del botón CTA (opcional)
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaText?: string;

  /**
   * URL del botón CTA (opcional)
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  ctaUrl?: string;

  /**
   * Orden de visualización (opcional, default: 0)
   */
  @IsOptional()
  @IsInt()
  order?: number;

  /**
   * Estado activo/inactivo (opcional, default: true)
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
