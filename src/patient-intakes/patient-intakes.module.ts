import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientIntakesController } from './patient-intakes.controller';
import { PatientIntakesService } from './patient-intakes.service';
import { PatientIntake } from './entities/patient-intake.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PatientIntake])],
  controllers: [PatientIntakesController],
  providers: [PatientIntakesService],
  exports: [PatientIntakesService],
})
export class PatientIntakesModule {}
