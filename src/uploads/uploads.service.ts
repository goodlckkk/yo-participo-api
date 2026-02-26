import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio de subida de archivos a Amazon S3
 *
 * Maneja la subida de documentos de consentimiento informado firmados
 * (escaneados o fotografiados) desde el dashboard admin.
 *
 * Variables de entorno requeridas:
 * - AWS_S3_BUCKET: Nombre del bucket S3
 * - AWS_S3_REGION: Región del bucket (ej: us-east-1)
 * - AWS_ACCESS_KEY_ID: Access key de IAM
 * - AWS_SECRET_ACCESS_KEY: Secret key de IAM
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  // Tipos MIME permitidos para documentos de consentimiento
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  // Tamaño máximo: 10MB
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || '';

    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_S3_REGION') || 'us-east-1',
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  /**
   * Sube un documento de consentimiento a S3
   *
   * @param file - Archivo recibido desde multer (Express.Multer.File)
   * @param patientId - UUID del paciente al que pertenece el documento
   * @returns URL pública del archivo subido
   */
  async uploadConsentDocument(
    file: Express.Multer.File,
    patientId: string,
  ): Promise<string> {
    // Validar tipo de archivo
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan PDF, JPG, PNG y WebP.`,
      );
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo de 10MB (${(file.size / 1024 / 1024).toFixed(1)}MB).`,
      );
    }

    // Generar nombre único para el archivo
    const extension = file.originalname.split('.').pop() || 'pdf';
    const key = `consent-documents/${patientId}/${uuidv4()}.${extension}`;

    try {
      const result = await this.s3
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Los documentos de consentimiento NO deben ser públicos
          // Se accede vía URL presignada desde el dashboard
        })
        .promise();

      this.logger.log(
        `✅ Documento de consentimiento subido para paciente ${patientId}: ${key}`,
      );

      return result.Location;
    } catch (error) {
      this.logger.error(
        `❌ Error al subir documento a S3: ${error.message}`,
      );
      throw new BadRequestException(
        'Error al subir el documento. Por favor, intenta nuevamente.',
      );
    }
  }

  /**
   * Genera una URL presignada temporal para descargar/ver un documento
   * La URL expira en 1 hora (3600 segundos)
   *
   * @param fileUrl - URL completa del archivo en S3
   * @returns URL presignada válida por 1 hora
   */
  async getPresignedUrl(fileUrl: string): Promise<string> {
    try {
      // Extraer la key del archivo desde la URL completa
      const url = new URL(fileUrl);
      const key = url.pathname.startsWith('/')
        ? url.pathname.substring(1)
        : url.pathname;

      const presignedUrl = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: 3600, // 1 hora
      });

      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `❌ Error al generar URL presignada: ${error.message}`,
      );
      throw new BadRequestException(
        'Error al generar el enlace de descarga del documento.',
      );
    }
  }

  /**
   * Elimina un documento de S3
   *
   * @param fileUrl - URL completa del archivo en S3
   */
  async deleteDocument(fileUrl: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const key = url.pathname.startsWith('/')
        ? url.pathname.substring(1)
        : url.pathname;

      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      this.logger.log(`✅ Documento eliminado de S3: ${key}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al eliminar documento de S3: ${error.message}`,
      );
    }
  }
}
