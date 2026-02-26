import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { PatientIntakesModule } from '../patient-intakes/patient-intakes.module';

/**
 * Módulo de subida de archivos
 *
 * Maneja la subida de documentos de consentimiento informado a S3.
 * Depende de PatientIntakesModule para actualizar la URL del documento
 * en el registro del paciente.
 *
 * Variables de entorno requeridas:
 * - AWS_S3_BUCKET
 * - AWS_S3_REGION
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 */
@Module({
  imports: [PatientIntakesModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
