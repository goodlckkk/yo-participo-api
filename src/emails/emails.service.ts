import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

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
   * Envía correo cuando una institución completa el formulario de contacto
   * 
   * @param institutionData - Datos de la institución
   */
  async sendInstitutionContactEmail(institutionData: {
    nombreInstitucion: string;
    nombreContacto: string;
    email: string;
    telefono: string;
    mensaje: string;
  }): Promise<void> {
    const subject = `Nueva solicitud de institución: ${institutionData.nombreInstitucion}`;
    const htmlBody = this.getInstitutionContactEmailTemplate(institutionData);

    try {
      await this.sendEmail('contacto@yoparticipo.cl', subject, htmlBody);
      this.logger.log(`✅ Correo de contacto de institución enviado a contacto@yoparticipo.cl`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de contacto de institución: ${error.message}`);
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
   * Método privado para enviar correos usando SendGrid con logo embebido
   * 
   * @param to - Email del destinatario
   * @param subject - Asunto del correo
   * @param html - Contenido HTML del correo
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const msg: any = {
      to,
      from: this.emailFrom,
      subject,
      html,
    };

    // Intentar leer logo PNG y adjuntarlo
    try {
      const logoPath = path.join(__dirname, 'logo-2.png');
      this.logger.debug(`Intentando leer logo desde: ${logoPath}`);
      
      if (fs.existsSync(logoPath)) {
        const logoContent = fs.readFileSync(logoPath, { encoding: 'base64' });
        msg.attachments = [
          {
            content: logoContent,
            filename: 'logo.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'logo_yoparticipo',
          },
        ];
        this.logger.debug('✅ Logo PNG adjuntado correctamente');
      } else {
        this.logger.warn(`⚠️ Logo no encontrado en: ${logoPath}. Enviando correo sin logo.`);
      }
    } catch (error) {
      this.logger.warn(`⚠️ Error al leer logo: ${error.message}. Enviando correo sin logo.`);
    }

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
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 180px; height: auto; display: block;" />
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
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 180px; height: auto; display: block;" />
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

  /**
   * Template HTML para correo de contacto de institución
   */
  private getInstitutionContactEmailTemplate(data: {
    nombreInstitucion: string;
    nombreContacto: string;
    email: string;
    telefono: string;
    mensaje: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Solicitud de Institución</title>
</head>
<body style="background-color: #ffffff; font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 0; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #005f73;">
            <tr>
                <td align="center" style="padding: 30px 20px;">
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 180px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Nueva Solicitud de Institución</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Se ha recibido una nueva solicitud de contacto desde el formulario de instituciones.</p>
            
            <!-- DATOS DE LA INSTITUCIÓN -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #005f73; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h2 style="color: #005f73; font-size: 18px; margin-top: 0; margin-bottom: 15px;">📋 Datos de la Institución</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: 600; width: 40%;">Institución:</td>
                        <td style="padding: 8px 0; color: #333;">${data.nombreInstitucion}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Contacto:</td>
                        <td style="padding: 8px 0; color: #333;">${data.nombreContacto}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Email:</td>
                        <td style="padding: 8px 0; color: #333;"><a href="mailto:${data.email}" style="color: #005f73; text-decoration: none;">${data.email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666; font-weight: 600;">Teléfono:</td>
                        <td style="padding: 8px 0; color: #333;">${data.telefono}</td>
                    </tr>
                </table>
            </div>

            <!-- MENSAJE -->
            <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #005f73; font-size: 16px; margin-top: 0; margin-bottom: 10px;">💬 Mensaje:</h3>
                <p style="color: #555; margin: 0; white-space: pre-wrap;">${data.mensaje}</p>
            </div>

            <!-- ACCIÓN RECOMENDADA -->
            <div style="background-color: #e7f6f8; padding: 15px; border-radius: 4px; margin-top: 25px;">
                <p style="margin: 0; color: #005f73; font-size: 14px;">
                    <strong>⏰ Acción recomendada:</strong> Responder en menos de 24 horas para mantener el compromiso de servicio.
                </p>
            </div>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; color: #666666; font-size: 12px;">
                Este correo fue generado automáticamente desde el formulario de contacto de instituciones en <strong>yoparticipo.cl</strong>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Envía correo cuando un paciente es verificado
   * 
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   */
  async sendPatientVerifiedEmail(patientEmail: string, patientName: string): Promise<void> {
    const subject = '¡Tu perfil ha sido verificado! - YoParticipo';
    const htmlBody = this.getPatientVerifiedEmailTemplate(patientName);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de verificación enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de verificación a ${patientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Envía correo cuando un paciente es asignado a un estudio clínico
   * 
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   * @param studyName - Nombre del estudio clínico
   */
  async sendStudyAssignedEmail(
    patientEmail: string,
    patientName: string,
    studyName: string,
  ): Promise<void> {
    const subject = '¡Has sido asignado a un estudio clínico! - YoParticipo';
    const htmlBody = this.getStudyAssignedEmailTemplate(patientName, studyName);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de asignación a estudio enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de asignación a ${patientEmail}:`, error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para correo de paciente verificado
   */
  private getPatientVerifiedEmailTemplate(patientName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil Verificado - YoParticipo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #04bcbc 0%, #346c84 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">¡Tu perfil ha sido verificado!</h1>
        <p style="margin: 15px 0 0; font-size: 16px; opacity: 0.9;">Estamos listos para encontrar las mejores oportunidades para ti</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #04bcbc; margin-top: 0;">Hola ${patientName},</h2>
        
        <p>Nos complace informarte que tu perfil ha sido <strong>verificado exitosamente</strong> en nuestra plataforma YoParticipo.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #346c84; margin-top: 0;">✅ Verificación completada</h3>
            <p>Tu información ha sido revisada y validada por nuestro equipo. Esto significa que:</p>
            <ul style="margin: 15px 0;">
                <li>Tu perfil está activo y visible para los estudios clínicos</li>
                <li>Podrás recibir notificaciones de oportunidades compatibles</li>
                <li>Estás un paso más cerca de participar en estudios que puedan ayudarte</li>
            </ul>
        </div>
        
        <p><strong>Próximos pasos:</strong></p>
        <ol style="margin: 15px 0;">
            <li>Nuestro sistema buscará estudios clínicos que coincidan con tu perfil</li>
            <li>Recibirás notificaciones cuando encontremos oportunidades relevantes</li>
            <li>Podrás revisar y aceptar participar en los estudios que te interesen</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666;">
                ¿Tienes preguntas? Contáctanos en 
                <a href="mailto:contacto@yoparticipo.cl" style="color: #04bcbc;">contacto@yoparticipo.cl</a>
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
            © 2024 YoParticipo. Todos los derechos reservados.
        </p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Plantilla HTML para correo de asignación a estudio clínico
   */
  private getStudyAssignedEmailTemplate(patientName: string, studyName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asignación a Estudio - YoParticipo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #04bcbc 0%, #346c84 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">¡Has sido asignado a un estudio!</h1>
        <p style="margin: 15px 0 0; font-size: 16px; opacity: 0.9;">Una nueva oportunidad te espera</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #04bcbc; margin-top: 0;">Hola ${patientName},</h2>
        
        <p>¡Excelentes noticias! Has sido <strong>seleccionado para participar</strong> en el estudio clínico:</p>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #346c84; margin-top: 0; font-size: 20px;">${studyName}</h3>
            <p style="color: #666; margin: 10px 0 0;">Tu perfil coincide perfectamente con los requisitos de este estudio</p>
        </div>
        
        <div style="background-color: #e8f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #04bcbc; margin-top: 0;">📋 Próximos pasos:</h4>
            <ol style="margin: 15px 0;">
                <li><strong>Contacto del equipo:</strong> El coordinador del estudio se comunicará contigo dentro de las próximas 48 horas</li>
                <li><strong>Información detallada:</strong> Recibirás toda la información sobre el estudio y los procedimientos</li>
                <li><strong>Confirmación:</strong> Podrás hacer todas las preguntas que necesites antes de confirmar tu participación</li>
            </ol>
        </div>
        
        <p><strong>📞 Contacto importante:</strong></p>
        <ul style="margin: 15px 0;">
            <li>Mantén tu teléfono y email disponibles para recibir la llamada</li>
            <li>Revisa tu bandeja de spam periódicamente por si nuestros correos llegan allí</li>
            <li>Si no recibes noticias en 3 días, contáctanos a <a href="mailto:contacto@yoparticipo.cl" style="color: #04bcbc;">contacto@yoparticipo.cl</a></li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #04bcbc; font-weight: bold;">
                ¡Felicidades por dar este importante paso!
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
            © 2024 YoParticipo. Todos los derechos reservados.
        </p>
    </div>
</body>
</html>
    `;
  }
}
