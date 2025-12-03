import { PartialType } from '@nestjs/mapped-types';
import { CreateResearchSiteDto } from './create-research-site.dto';

/**
 * DTO para actualizar una institución existente
 * Todos los campos son opcionales (hereda de CreateResearchSiteDto con PartialType)
 */
export class UpdateResearchSiteDto extends PartialType(CreateResearchSiteDto) {}
