import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UploadsService } from './uploads.service';
import { PatientIntakesService } from '../patient-intakes/patient-intakes.service';

/**
 * Controlador para subida de archivos (documentos de consentimiento)
 *
 * Endpoints:
 * - POST /uploads/consent/:patientId → Sube documento de consentimiento para un paciente
 * - GET /uploads/consent/:patientId/url → Obtiene URL presignada para ver/descargar el documento
 *
 * Todos los endpoints requieren autenticación JWT.
 */
@Controller('uploads')
@UseGuards(AuthGuard('jwt'))
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly patientIntakesService: PatientIntakesService,
  ) {}

  /**
   * Sube un documento de consentimiento firmado para un paciente
   *
   * El archivo se sube a S3 y la URL se guarda en el campo consentDocumentUrl
   * del paciente.
   *
   * @param patientId - UUID del paciente
   * @param file - Archivo (PDF, JPG, PNG o WebP, máx 10MB)
   * @returns Objeto con la URL del documento y datos del paciente actualizado
   */
  @Post('consent/:patientId')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadConsentDocument(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }

    // Verificar que el paciente existe
    const patient = await this.patientIntakesService.findOne(patientId);

    // Subir archivo a S3
    const fileUrl = await this.uploadsService.uploadConsentDocument(
      file,
      patientId,
    );

    // Guardar la URL en el paciente
    await this.patientIntakesService.update(patientId, {
      consentDocumentUrl: fileUrl,
    } as any);

    return {
      message: 'Documento de consentimiento subido exitosamente',
      consentDocumentUrl: fileUrl,
      patientId: patientId,
    };
  }

  /**
   * Obtiene una URL presignada temporal para ver/descargar el documento
   * de consentimiento de un paciente.
   *
   * La URL expira en 1 hora.
   *
   * @param patientId - UUID del paciente
   * @returns Objeto con la URL presignada
   */
  @Get('consent/:patientId/url')
  async getConsentDocumentUrl(@Param('patientId') patientId: string) {
    const patient = await this.patientIntakesService.findOne(patientId);

    if (!patient.consentDocumentUrl) {
      throw new BadRequestException(
        'Este paciente no tiene documento de consentimiento registrado.',
      );
    }

    const presignedUrl = await this.uploadsService.getPresignedUrl(
      patient.consentDocumentUrl,
    );

    return {
      presignedUrl,
      patientId: patientId,
    };
  }
}
