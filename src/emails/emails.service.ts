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
      this.logger.warn(
        '⚠️ SENDGRID_API_KEY no configurada. El envío de correos fallará.',
      );
    } else {
      sgMail.setApiKey(apiKey);
      this.logger.log('✅ SendGrid configurado correctamente');
    }

    this.emailFrom =
      this.configService.get<string>('EMAIL_FROM') || 'contacto@yoparticipo.cl';
  }

  /**
   * Envía correo de confirmación cuando un paciente se postula (ETAPA 1)
   *
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   */
  async sendPatientConfirmationEmail(
    patientEmail: string,
    patientName: string,
  ): Promise<void> {
    const subject = 'Confirmación de Registro - YoParticipo';
    const htmlBody = this.getConfirmationEmailTemplate(patientName);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de confirmación (Etapa 1) enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar correo de confirmación a ${patientEmail}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Envía correo de verificación cuando se validan los antecedentes (ETAPA 2)
   *
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   */
  async sendVerificationEmail(
    patientEmail: string,
    patientName: string,
  ): Promise<void> {
    const subject = 'Verificación de Antecedentes Completada - YoParticipo';
    const htmlBody = this.getVerificationEmailTemplate(patientName);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de verificación (Etapa 2) enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar correo de verificación a ${patientEmail}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Envía correo cuando se encuentra un ensayo clínico (ETAPA 3)
   *
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   * @param studyDetails - Detalles del estudio clínico encontrado
   */
  async sendStudyFoundEmail(
    patientEmail: string,
    patientName: string,
    studyDetails?: string,
  ): Promise<void> {
    const subject = '¡Estudio Clínico Encontrado! - YoParticipo';
    const htmlBody = this.getStudyFoundEmailTemplate(patientName, studyDetails);

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de estudio encontrado (Etapa 3) enviado a ${patientEmail}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar correo de estudio encontrado a ${patientEmail}:`,
        error,
      );
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
      this.logger.log(
        `✅ Correo de contacto de institución enviado a contacto@yoparticipo.cl`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar correo de contacto de institución: ${error.message}`,
      );
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
    const subject =
      '¡Buenas noticias! Hemos encontrado una oportunidad - YoParticipo';
    const htmlBody = this.getMatchFoundEmailTemplate(
      patientName,
      dashboardLink,
    );

    try {
      await this.sendEmail(patientEmail, subject, htmlBody);
      this.logger.log(
        `✅ Correo de match encontrado enviado a ${patientEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar correo de match a ${patientEmail}:`,
        error,
      );
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
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
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
        this.logger.warn(
          `⚠️ Logo no encontrado en: ${logoPath}. Enviando correo sin logo.`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `⚠️ Error al leer logo: ${error.message}. Enviando correo sin logo.`,
      );
    }

    await sgMail.send(msg);
  }

  /**
   * Plantilla HTML para correo de confirmación de registro (ETAPA 1)
   */
  private getConfirmationEmailTemplate(patientName: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Registro - YoParticipo</title>
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
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Confirmación de Registro</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Queremos confirmarte que tu registro ha sido recibido correctamente y que la información ingresada ya forma parte de nuestra base de datos segura de participantes.</p>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">A continuación, te explicamos de forma clara en qué etapa del proceso te encuentras y cuáles son los pasos siguientes:</p>

            <h2 style="color: #005f73; font-size: 18px; margin: 25px 0 15px 0;">📝 Etapas del proceso en Yo Participo</h2>

            <!-- ETAPA 1 -->
            <div style="background-color: #e8f5e8; border-left: 4px solid #38a169; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 1. Registro de formulario completado</strong><br>
                <span style="color: #4a5568;">Hemos recibido exitosamente el formulario con tus datos iniciales y antecedentes de salud.</span>
            </div>

            <!-- ETAPA 2 -->
            <div style="background-color: #e6f7ff; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">🔍 2. Revisión y recopilación de antecedentes médicos (si corresponde)</strong><br>
                <span style="color: #4a5568;">En caso de ser necesario, uno de nuestros profesionales de salud podría contactarte para solicitar o aclarar información médica adicional, siempre con tu autorización.</span>
            </div>

            <!-- ETAPA 3 -->
            <div style="background-color: #faf5ff; border-left: 4px solid #805ad5; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">📍 3. Búsqueda de estudios clínicos disponibles</strong><br>
                <span style="color: #4a5568;">Nuestro equipo experto evaluará si existen ensayos clínicos activos que se ajusten a tu condición de salud, intereses y que se desarrollen en tu ciudad o en la zona más cercana a tu domicilio.</span>
            </div>

            <!-- ETAPA 4 -->
            <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">📞 4. Invitación formal a participar</strong><br>
                <span style="color: #4a5568;">Si identificamos un estudio adecuado, nos pondremos en contacto contigo para explicarte en detalle de qué se trata el estudio, resolver tus dudas y preguntarte si deseas participar.<br>La decisión de participar será siempre voluntaria.</span>
            </div>

            <!-- ETAPA 5 -->
            <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">🤝 5. Seguimiento y acompañamiento</strong><br>
                <span style="color: #4a5568;">En caso de que decidas participar, nuestro equipo realizará un seguimiento y acompañamiento durante el proceso, manteniéndote informado y resguardando en todo momento tu bienestar y confidencialidad.</span>
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Es importante que sepas que solo te contactaremos si identificamos una oportunidad real y adecuada para ti. Si no existen estudios compatibles en este momento, no recibirás comunicaciones innecesarias.</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Toda tu información será tratada con estricta confidencialidad y utilizada únicamente para fines relacionados con la evaluación y gestión de oportunidades de participación en estudios clínicos.</p>

            <h2 style="color: #005f73; font-size: 18px; margin: 25px 0 15px 0;">📩 ¿Tienes dudas o necesitas contactarnos?</h2>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Puedes escribirnos en cualquier momento a:</p>
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;"><strong>contacto@yoparticipo.cl</strong><br>(o al canal de contacto definido por la plataforma)</p>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Agradecemos tu confianza y tu interés en contribuir al avance de la investigación clínica.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gestión de Ensayos Clínicos<br>Yo Participo</em></p>
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
  private getMatchFoundEmailTemplate(
    patientName: string,
    dashboardLink?: string,
  ): string {
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
   * Plantilla HTML para correo de verificación de antecedentes (ETAPA 2)
   */
  private getVerificationEmailTemplate(patientName: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación Completada - YoParticipo</title>
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
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Verificación de Antecedentes Completada</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Te informamos que hemos completado exitosamente la verificación de tus antecedentes médicos. Tu perfil ha sido validado y ahora está listo para la búsqueda de estudios clínicos compatibles.</p>

            <h2 style="color: #005f73; font-size: 18px; margin: 25px 0 15px 0;">📊 Estado Actual del Proceso</h2>

            <!-- ETAPA 1 COMPLETADA -->
            <div style="background-color: #e8f5e8; border-left: 4px solid #38a169; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 1. Registro de formulario completado</strong><br>
                <span style="color: #4a5568;">Formulario recibido y procesado correctamente.</span>
            </div>

            <!-- ETAPA 2 COMPLETADA -->
            <div style="background-color: #e6f7ff; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 2. Revisión y verificación de antecedentes médicos</strong><br>
                <span style="color: #4a5568;">Antecedentes médicos verificados y validados exitosamente.</span>
            </div>

            <!-- ETAPA 3 EN PROCESO -->
            <div style="background-color: #faf5ff; border-left: 4px solid #805ad5; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">🔄 3. Búsqueda de estudios clínicos disponibles</strong><br>
                <span style="color: #4a5568;">Nuestro equipo está evaluando activamente ensayos clínicos que se ajusten a tu perfil.</span>
            </div>

            <!-- ETAPA 4 PENDIENTE -->
            <div style="background-color: #f7fafc; border-left: 4px solid #a0aec0; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">⏳ 4. Invitación formal a participar</strong><br>
                <span style="color: #4a5568;">Esperando identificación de estudio compatible.</span>
            </div>

            <!-- ETAPA 5 PENDIENTE -->
            <div style="background-color: #f7fafc; border-left: 4px solid #a0aec0; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">⏳ 5. Seguimiento y acompañamiento</strong><br>
                <span style="color: #4a5568;">Disponible una vez que se identifique un estudio adecuado.</span>
            </div>

            <div style="background-color: #f0fff4; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>🎯 Próximo paso:</strong><br>
                Nuestro sistema está analizando la base de datos de estudios clínicos activos. Te contactaremos únicamente si encontramos una oportunidad que se ajuste perfectamente a tu condición.
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">El tiempo de búsqueda puede variar dependiendo de la disponibilidad de estudios en tu área y especialidad médica. Te pedimos paciencia durante este proceso.</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Agradecemos tu paciencia y confianza en nuestro sistema.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gestión de Ensayos Clínicos<br>Yo Participo</em></p>
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
   * Plantilla HTML para correo de estudio encontrado (ETAPA 3)
   */
  private getStudyFoundEmailTemplate(patientName: string, studyDetails?: string): string {
    const studyInfo = studyDetails || "Nuestro equipo ha identificado un ensayo clínico que coincide con tu perfil médico. Los detalles específicos serán proporcionados por nuestro coordinador clínico durante la entrevista personalizada.";
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Estudio Clínico Encontrado! - YoParticipo</title>
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
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">¡Excelentes Noticias!</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Tenemos el agrado de informarte que hemos encontrado un <strong>ensayo clínico activo</strong> que se ajusta a tu perfil médico.</p>

            <h2 style="color: #005f73; font-size: 18px; margin: 25px 0 15px 0;">🎯 Progreso del Proceso</h2>

            <!-- ETAPA 1 COMPLETADA -->
            <div style="background-color: #e8f5e8; border-left: 4px solid #38a169; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 1. Registro de formulario completado</strong><br>
                <span style="color: #4a5568;">Formulario recibido y procesado correctamente.</span>
            </div>

            <!-- ETAPA 2 COMPLETADA -->
            <div style="background-color: #e6f7ff; border-left: 4px solid #3182ce; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 2. Revisión y verificación de antecedentes médicos</strong><br>
                <span style="color: #4a5568;">Antecedentes médicos verificados y validados.</span>
            </div>

            <!-- ETAPA 3 COMPLETADA -->
            <div style="background-color: #faf5ff; border-left: 4px solid #805ad5; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">✅ 3. Búsqueda de estudios clínicos disponibles</strong><br>
                <span style="color: #4a5568;">¡Estudio clínico compatible identificado!</span>
            </div>

            <!-- ETAPA 4 EN PROCESO -->
            <div style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">📞 4. Invitación formal a participar</strong><br>
                <span style="color: #4a5568;">Un coordinador clínico se contactará contigo para explicarte los detalles.</span>
            </div>

            <!-- ETAPA 5 PENDIENTE -->
            <div style="background-color: #f7fafc; border-left: 4px solid #a0aec0; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <strong style="color: #2d3748;">⏳ 5. Seguimiento y acompañamiento</strong><br>
                <span style="color: #4a5568;">Disponible una vez confirmada tu participación.</span>
            </div>

            <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>📋 Información del Estudio:</strong><br>
                ${studyInfo}
            </div>

            <div style="background-color: #e6fffa; border-left: 4px solid #319795; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>📞 Próximos pasos:</strong><br>
                Un coordinador clínico de nuestro equipo se pondrá en contacto contigo dentro de las próximas <strong>48 horas hábiles</strong> para:
                <ul style="margin: 10px 0 0 20px; color: #4a5568;">
                    <li>Explicarte detalladamente el estudio clínico</li>
                    <li>Resolver todas tus dudas e inquietudes</li>
                    <li>Informarte sobre los requisitos y procedimientos</li>
                    <li>Coordinar una visita al centro médico si corresponde</li>
                </ul>
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;"><strong>💡 Importante:</strong> La participación en cualquier estudio clínico es completamente voluntaria. Podrás decidir libremente si deseas participar después de recibir toda la información.</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Estamos muy contentos de poder ofrecerte esta oportunidad y esperamos que esta posibilidad represente una alternativa beneficiosa para tu salud.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gestión de Ensayos Clínicos<br>Yo Participo</em></p>
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
}
