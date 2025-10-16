import { IsUUID } from 'class-validator';

export class CreateParticipationDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  trialId: string;
}
