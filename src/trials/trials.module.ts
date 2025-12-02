import { Module } from '@nestjs/common';
import { TrialsService } from './trials.service';
import { TrialsController } from './trials.controller';
import { TrialMatchingService } from './trial-matching.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trial } from './entities/trial.entity';
import { PatientIntake } from '../patient-intakes/entities/patient-intake.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trial, PatientIntake])],
  controllers: [TrialsController],
  providers: [TrialsService, TrialMatchingService],
})
export class TrialsModule {}
