import {
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  IsEnum,
} from 'class-validator';
import { SponsorType } from '../entities/sponsor.entity';

export class CreateSponsorDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  web_site?: string;

  @IsOptional()
  @IsEnum(SponsorType, { message: 'El tipo debe ser SPONSOR o CRO' })
  sponsor_type?: SponsorType;
}
