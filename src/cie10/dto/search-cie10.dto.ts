import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para búsqueda de códigos CIE-10
 * 
 * Permite buscar por:
 * - Texto en descripción o código
 * - Limitar cantidad de resultados
 */
export class SearchCie10Dto {
  @IsString()
  @IsOptional()
  q?: string; // Query de búsqueda

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20; // Límite de resultados (default: 20)
}
