import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

/**
 * EmailsService
 * 
 * Este servicio maneja el envío de correos electrónicos usando SendGrid.
 * 
 * Funcionalidades:
 * - Envío de correo de confirmación cuando un paciente se postula
 * - Envío de correo cuando se encuentra un match con un ensayo clínico
 * - Plantillas HTML profesionales con diseño responsive
 * 
 * Configuración requerida en variables de entorno:
 * - SENDGRID_API_KEY: API Key de SendGrid
 * - EMAIL_FROM: Correo remitente verificado en SendGrid (ej: contacto@yoparticipo.cl)
 */
@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private emailFrom: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('⚠️ SENDGRID_API_KEY no configurada. El envío de correos fallará.');
    } else {
      sgMail.setApiKey(apiKey);
      this.logger.log('✅ SendGrid configurado correctamente');
    }

    this.emailFrom = this.configService.get<string>('EMAIL_FROM') || 'contacto@yoparticipo.cl';
  }

  /**
   * Envía correo de confirmación cuando un paciente se postula
   * 
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   */
  async sendPatientConfirmationEmail(patientEmail: string, patientName: string): Promise<void> {
    const subject = 'Hemos recibido tu solicitud - YoParticipo';
    const htmlBody = this.getConfirmationEmailTemplate(patientName);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de confirmación enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de confirmación a ${patientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Envía correo cuando se encuentra un match con un ensayo clínico
   * 
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   * @param dashboardLink - Link al dashboard del paciente (opcional)
   */
  async sendMatchFoundEmail(
    patientEmail: string,
    patientName: string,
    dashboardLink?: string,
  ): Promise<void> {
    const subject = '¡Buenas noticias! Hemos encontrado una oportunidad - YoParticipo';
    const htmlBody = this.getMatchFoundEmailTemplate(patientName, dashboardLink);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de match encontrado enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de match a ${patientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para enviar correos usando SendGrid
   */
  private async sendEmail(to: string, subject: string, htmlBody: string): Promise<void> {
    const msg = {
      to,
      from: this.emailFrom,
      subject,
      html: htmlBody,
    };

    await sgMail.send(msg);
  }

  /**
   * Plantilla HTML para correo de confirmación de postulación
   */
  private getConfirmationEmailTemplate(patientName: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Postulación</title>
</head>
<body style="background-color: #ffffff; font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 0; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #005f73;">
            <tr>
                <td align="center" style="padding: 30px 20px;">
                    <img src="https://elasticbeanstalk-sa-east-1-773182953904.s3.sa-east-1.amazonaws.com/assets/logo-2.svg" alt="YoParticipo" style="max-width: 220px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Hemos recibido tu solicitud</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Queremos confirmarte que tu postulación ha ingresado correctamente a nuestra base de datos segura.</p>

            <div style="background-color: #e0f7fa; border-left: 4px solid #00bcd4; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>¿Qué sucede ahora?</strong><br>
                Nuestro equipo médico revisará tu perfil clínico. No es necesario que realices ninguna acción adicional por el momento.
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Ten la tranquilidad de que nos pondremos en contacto contigo <strong>únicamente si encontramos un ensayo clínico</strong> que se ajuste perfectamente a tu diagnóstico y necesidades.</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Agradecemos tu confianza en nosotros para buscar nuevas oportunidades de tratamiento.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>El equipo de Gestión de Ensayos Clínicos YoParticipo.</em></p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            <p>Este es un correo automático, por favor no responder a esta dirección.</p>
            <p>© 2025 YoParticipo. Todos los derechos reservados.</p>
            <p><a href="#" style="color: #0a9396; text-decoration: none;">Política de Privacidad</a></p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Plantilla HTML para correo de match encontrado
   */
  private getMatchFoundEmailTemplate(patientName: string, dashboardLink?: string): string {
    const linkButton = dashboardLink
      ? `
        <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="display: inline-block; background-color: #0a9396; color: #ffffff !important; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; margin-top: 10px; text-align: center;">Ver Estado de mi Solicitud</a>
        </div>
      `
      : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ensayo Encontrado</title>
</head>
<body style="background-color: #ffffff; font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 0; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #005f73;">
            <tr>
                <td align="center" style="padding: 30px 20px;">
                    <img src="https://elasticbeanstalk-sa-east-1-773182953004.s3.sa-east-1.amazonaws.com/assets/logo-2.svg" alt="YoParticipo" style="max-width: 220px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">¡Buenas noticias! Hemos encontrado una oportunidad</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Nuestro sistema ha detectado que tu perfil es compatible con un nuevo <strong>Ensayo Clínico Activo</strong>.</p>

            <div style="background-color: #f0fff4; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Próximos pasos:</strong><br>
                Un coordinador clínico se pondrá en contacto contigo en las próximas 48 horas hábiles para explicarte los detalles y requisitos.
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Por favor, mantente atento a tu teléfono o correo electrónico.${dashboardLink ? ' Si deseas ver los detalles preliminares, puedes ingresar a tu perfil:' : ''}</p>
            
            ${linkButton}

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Estamos entusiasmados de poder ofrecerte esta posibilidad.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>El equipo de Gestión de Ensayos Clínicos.</em></p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            <p>¿Tienes dudas? Contáctanos a ${this.emailFrom}</p>
            <p>© 2025 YoParticipo. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}
