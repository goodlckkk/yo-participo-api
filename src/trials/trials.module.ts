import { Module } from '@nestjs/common';
import { TrialsService } from './trials.service';
import { TrialsController } from './trials.controller';
import { TrialMatchingService } from './trial-matching.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trial } from './entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';
import { EmailsModule } from '../emails/emails.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trial, PatientIntake]), EmailsModule, AuditLogsModule],
  controllers: [TrialsController],
  providers: [TrialsService, TrialMatchingService],
})
export class TrialsModule {}
