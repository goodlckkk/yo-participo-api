import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

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
}
