import { IsOptional, IsString, IsUrl, MinLength, IsEnum } from 'class-validator';
import { SponsorType } from '../entities/sponsor.entity';

export class CreateSponsorDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  web_site?: string;

  @IsEnum(SponsorType)
  @IsOptional() // Tipo de sponsor es opcional, por defecto será SPONSOR
  sponsor_type?: SponsorType;
}
