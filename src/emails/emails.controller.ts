import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailsService } from './emails.service';

/**
 * Controlador para el envío de correos electrónicos
 * 
 * Ruta base: /emails
 * 
 * Endpoints:
 * - POST /emails/institution-contact: Envía correo cuando una institución completa el formulario de contacto
 */
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  /**
   * Endpoint para enviar correo de contacto de institución
   * 
   * @param body - Datos del formulario de contacto de la institución
   * @returns Mensaje de confirmación
   * 
   * Ejemplo de uso con Postman:
   * POST http://localhost:3000/emails/institution-contact
   * Body (JSON):
   * {
   *   "nombreInstitucion": "Clínica Santa María",
   *   "nombreContacto": "Dr. Juan Pérez",
   *   "email": "contacto@clinica.cl",
   *   "telefono": "+56 9 1234 5678",
   *   "mensaje": "Estamos interesados en publicar nuestros ensayos clínicos"
   * }
   */
  @Post('institution-contact')
  @HttpCode(HttpStatus.OK)
  async sendInstitutionContact(
    @Body() body: {
      nombreInstitucion: string;
      nombreContacto: string;
      email: string;
      telefono: string;
      mensaje: string;
    },
  ) {
    await this.emailsService.sendInstitutionContactEmail(body);
    
    return {
      success: true,
      message: 'Correo enviado correctamente. Nos contactaremos contigo en menos de 24 horas.',
    };
  }
}
