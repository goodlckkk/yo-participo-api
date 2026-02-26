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

    try {
      await sgMail.send(msg);
    } catch (error) {
      // Extraer detalles del error de SendGrid para diagnóstico
      if (error.response) {
        const { statusCode, body } = error.response;
        this.logger.error(
          `❌ SendGrid respondió con HTTP ${statusCode}: ${JSON.stringify(body?.errors || body)}`,
        );
        if (statusCode === 401) {
          this.logger.error('🔑 SENDGRID_API_KEY es inválida o fue revocada. Verificar en https://app.sendgrid.com/settings/api_keys');
        } else if (statusCode === 403) {
          this.logger.error('🚫 Créditos de SendGrid agotados o remitente no verificado. Verificar plan y Sender Authentication.');
        }
      }
      throw error;
    }
  }

  /**
   * Genera el HTML del stepper visual de 5 pasos para los correos de paciente.
   *
   * @param activeStep - Número del paso activo (1-5)
   * @param showAllDescriptions - true = muestra descripción de todos los pasos (registro),
   *                              false = solo muestra descripción del paso activo y el siguiente
   */
  private getStepperHtml(activeStep: number, showAllDescriptions: boolean): string {
    const steps = [
      {
        icon: '📝',
        title: 'Registro de formulario completado',
        description: 'Hemos recibido exitosamente el formulario con tus datos iniciales y antecedentes de salud.',
      },
      {
        icon: '🔍',
        title: 'Revisión y recopilación de antecedentes médicos',
        description: 'En caso de ser necesario, uno de nuestros profesionales de salud podría contactarte para solicitar o aclarar información médica adicional, siempre con tu autorización.',
      },
      {
        icon: '📍',
        title: 'Búsqueda de estudios clínicos disponibles',
        description: 'Nuestro equipo experto evaluará si existen ensayos clínicos activos que se ajusten a tu condición de salud, intereses y que se desarrollen en tu ciudad o en la zona más cercana a tu domicilio.',
      },
      {
        icon: '📞',
        title: 'Invitación formal a participar',
        description: 'Si identificamos un estudio adecuado, nos pondremos en contacto contigo para explicarte en detalle de qué se trata el estudio, resolver tus dudas y preguntarte si deseas participar. La decisión de participar será siempre voluntaria.',
      },
      {
        icon: '🤝',
        title: 'Seguimiento y acompañamiento',
        description: 'En caso de que decidas participar, nuestro equipo realizará un seguimiento y acompañamiento durante el proceso, manteniéndote informado y resguardando en todo momento tu bienestar y confidencialidad.',
      },
    ];

    let html = '';

    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const isCompleted = stepNumber < activeStep;
      const isActive = stepNumber === activeStep;
      const showDesc = showAllDescriptions || stepNumber === activeStep || stepNumber === activeStep + 1;

      // Estilos del círculo según estado
      let circleBg: string, circleColor: string, circleContent: string;
      if (isCompleted) {
        circleBg = '#04BFAD';
        circleColor = '#ffffff';
        circleContent = '&#10003;';
      } else if (isActive) {
        circleBg = '#024959';
        circleColor = '#ffffff';
        circleContent = String(stepNumber);
      } else {
        circleBg = '#e0e0e0';
        circleColor = '#999999';
        circleContent = String(stepNumber);
      }

      // Color del título según estado
      const titleColor = isCompleted ? '#04BFAD' : isActive ? '#024959' : '#999999';
      const titleWeight = isActive ? '700' : '600';

      // Fondo destacado para paso activo
      const rowBg = isActive ? 'background-color: #f0faf9; border-radius: 8px; padding: 12px 14px;' : 'padding: 6px 14px;';

      // Color de la línea conectora
      const lineColor = isCompleted ? '#04BFAD' : '#e0e0e0';

      html += `
      <tr>
        <td width="50" valign="top" align="center" style="padding: 0;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width: 36px; height: 36px; border-radius: 18px; background-color: ${circleBg}; color: ${circleColor}; text-align: center; font-weight: bold; font-size: 16px; line-height: 36px;">${circleContent}</td>
          </tr></table>
        </td>
        <td valign="top" style="${rowBg}">
          <p style="margin: 0; font-size: 15px; font-weight: ${titleWeight}; color: ${titleColor};">${step.icon} ${step.title}</p>
          ${showDesc ? `<p style="margin: 5px 0 0; font-size: 14px; color: #555555; line-height: 1.5;">${step.description}</p>` : ''}
        </td>
      </tr>`;

      // Línea conectora entre pasos (excepto después del último)
      if (index < steps.length - 1) {
        html += `
      <tr>
        <td width="50" align="center" style="padding: 0;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width: 2px; height: ${showDesc ? '12' : '8'}px; background-color: ${lineColor}; margin: 0 auto;"></td>
          </tr></table>
        </td>
        <td></td>
      </tr>`;
      }
    });

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">${html}</table>`;
  }

  /**
   * Genera la estructura base (header + footer) de los correos de paciente.
   * Recibe el contenido interior como parámetro.
   */
  private getEmailWrapper(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="background-color: #f4f4f4; font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 20px 0; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">

        <!-- HEADER CON LOGO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #024959;">
            <tr>
                <td align="center" style="padding: 30px 20px;">
                    <img src="cid:logo_yoparticipo" alt="Yo Participo" style="max-width: 180px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            ${content}
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            <p style="margin: 0 0 8px;">Este es un correo automático, por favor no responder a esta dirección.</p>
            <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Yo Participo. Todos los derechos reservados.</p>
            <p style="margin: 0;"><a href="https://yoparticipo.cl" style="color: #04BFAD; text-decoration: none;">yoparticipo.cl</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Plantilla HTML para correo de confirmación de registro (Paso 1)
   * Muestra el stepper completo con descripción de TODOS los pasos.
   */
  private getConfirmationEmailTemplate(patientName: string): string {
    const stepper = this.getStepperHtml(1, true);

    const content = `
            <h1 style="color: #024959; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Hemos recibido tu registro</h1>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Queremos confirmarte que tu registro ha sido recibido correctamente y que la informaci&oacute;n ingresada ya forma parte de nuestra base de datos segura de participantes.</p>

            <p style="margin-bottom: 10px; color: #555555; font-size: 16px;">A continuaci&oacute;n, te explicamos de forma clara en qu&eacute; etapa del proceso te encuentras y cu&aacute;les son los pasos siguientes:</p>

            <!-- T&Iacute;TULO DEL STEPPER -->
            <h2 style="color: #024959; font-size: 18px; margin: 25px 0 5px; font-weight: 600;">Etapas del proceso en Yo Participo</h2>

            <!-- STEPPER VISUAL -->
            ${stepper}

            <!-- NOTA IMPORTANTE -->
            <div style="background-color: #f0faf9; border-left: 4px solid #04BFAD; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #555555; font-size: 14px;">Es importante que sepas que <strong>solo te contactaremos si identificamos una oportunidad real y adecuada para ti</strong>. Si no existen estudios compatibles en este momento, no recibir&aacute;s comunicaciones innecesarias.</p>
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 14px;">Toda tu informaci&oacute;n ser&aacute; tratada con estricta confidencialidad y utilizada &uacute;nicamente para fines relacionados con la evaluaci&oacute;n y gesti&oacute;n de oportunidades de participaci&oacute;n en estudios cl&iacute;nicos.</p>

            <!-- CONTACTO -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: #024959; font-size: 14px; font-weight: 600;">&iquest;Tienes dudas o necesitas contactarnos?</p>
                <p style="margin: 0; font-size: 14px;">Escr&iacute;benos a <a href="mailto:contacto@yoparticipo.cl" style="color: #04BFAD; text-decoration: none; font-weight: 600;">contacto@yoparticipo.cl</a></p>
            </div>

            <p style="margin: 20px 0 5px; color: #555555; font-size: 14px;">Agradecemos tu confianza y tu inter&eacute;s en contribuir al avance de la investigaci&oacute;n cl&iacute;nica.</p>

            <p style="margin-bottom: 0; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gesti&oacute;n de Ensayos Cl&iacute;nicos<br><strong>Yo Participo</strong></em></p>`;

    return this.getEmailWrapper('Confirmaci\u00f3n de Registro - Yo Participo', content);
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
   * Envía un email al administrador cuando una institución solicita un nuevo estudio
   * @param adminEmail - Email del administrador
   * @param requestData - Datos de la solicitud del estudio
   */
  async sendTrialRequestEmail(
    adminEmail: string,
    requestData: {
      institutionName: string;
      contactEmail: string;
      trialTitle: string;
      trialDescription: string;
      additionalNotes?: string;
      requestDate: string;
    }
  ): Promise<void> {
    const subject = `Nueva solicitud de estudio: ${requestData.trialTitle}`;
    const htmlBody = this.getTrialRequestEmailTemplate(requestData);

    try {
      await this.sendEmail(adminEmail, subject, htmlBody);
      this.logger.log(`✅ Correo de solicitud de estudio enviado a ${adminEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error al enviar correo de solicitud a ${adminEmail}:`, error);
      throw error;
    }
  }

  /**
   * Plantilla HTML para correo de paciente verificado (Paso 2)
   * Muestra el stepper con paso 2 activo y descripción del paso actual y siguiente.
   */
  private getPatientVerifiedEmailTemplate(patientName: string): string {
    const stepper = this.getStepperHtml(2, false);

    const content = `
            <h1 style="color: #024959; font-size: 22px; margin-bottom: 20px; font-weight: 600;">&iexcl;Tu perfil ha sido verificado!</h1>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Nos complace informarte que tu perfil ha sido <strong>verificado exitosamente</strong> por nuestro equipo. Tu informaci&oacute;n ha sido revisada y validada, lo que significa que tu perfil est&aacute; activo en nuestra plataforma.</p>

            <p style="margin-bottom: 10px; color: #555555; font-size: 16px;">A continuaci&oacute;n puedes ver en qu&eacute; etapa del proceso te encuentras:</p>

            <!-- T&Iacute;TULO DEL STEPPER -->
            <h2 style="color: #024959; font-size: 18px; margin: 25px 0 5px; font-weight: 600;">Tu progreso en Yo Participo</h2>

            <!-- STEPPER VISUAL -->
            ${stepper}

            <!-- NOTA -->
            <div style="background-color: #f0faf9; border-left: 4px solid #04BFAD; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #555555; font-size: 14px;">Nuestro equipo ya est&aacute; trabajando en buscar estudios cl&iacute;nicos compatibles con tu perfil. <strong>Te contactaremos &uacute;nicamente si identificamos una oportunidad real y adecuada para ti.</strong></p>
            </div>

            <!-- CONTACTO -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: #024959; font-size: 14px; font-weight: 600;">&iquest;Tienes dudas o necesitas contactarnos?</p>
                <p style="margin: 0; font-size: 14px;">Escr&iacute;benos a <a href="mailto:contacto@yoparticipo.cl" style="color: #04BFAD; text-decoration: none; font-weight: 600;">contacto@yoparticipo.cl</a></p>
            </div>

            <p style="margin-bottom: 0; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gesti&oacute;n de Ensayos Cl&iacute;nicos<br><strong>Yo Participo</strong></em></p>`;

    return this.getEmailWrapper('Perfil Verificado - Yo Participo', content);
  }

  /**
   * Plantilla HTML para correo de asignación a estudio clínico (Paso 4)
   * Muestra el stepper con paso 4 activo y descripción del paso actual y siguiente.
   */
  private getStudyAssignedEmailTemplate(patientName: string, studyName: string): string {
    const stepper = this.getStepperHtml(4, false);

    const content = `
            <h1 style="color: #024959; font-size: 22px; margin-bottom: 20px; font-weight: 600;">&iexcl;Hemos encontrado un estudio para ti!</h1>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">&iexcl;Excelentes noticias! Hemos identificado un estudio cl&iacute;nico que se ajusta a tu perfil y condici&oacute;n de salud:</p>

            <!-- ESTUDIO ASIGNADO -->
            <div style="background-color: #f0faf9; border: 2px solid #04BFAD; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; font-size: 13px; color: #024959; text-transform: uppercase; letter-spacing: 1px;">Estudio asignado</p>
                <h3 style="color: #024959; margin: 0; font-size: 20px; font-weight: 700;">${studyName}</h3>
            </div>

            <p style="margin-bottom: 10px; color: #555555; font-size: 16px;">A continuaci&oacute;n puedes ver en qu&eacute; etapa del proceso te encuentras:</p>

            <!-- T&Iacute;TULO DEL STEPPER -->
            <h2 style="color: #024959; font-size: 18px; margin: 25px 0 5px; font-weight: 600;">Tu progreso en Yo Participo</h2>

            <!-- STEPPER VISUAL -->
            ${stepper}

            <!-- NOTA IMPORTANTE -->
            <div style="background-color: #f0faf9; border-left: 4px solid #04BFAD; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #555555; font-size: 14px;"><strong>Importante:</strong> Mant&eacute;n tu tel&eacute;fono y correo disponibles. Un coordinador del estudio se comunicar&aacute; contigo en las pr&oacute;ximas 48 horas h&aacute;biles para explicarte los detalles. Recuerda que la decisi&oacute;n de participar ser&aacute; siempre voluntaria.</p>
            </div>

            <!-- CONTACTO -->
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 5px; color: #024959; font-size: 14px; font-weight: 600;">&iquest;Tienes dudas o necesitas contactarnos?</p>
                <p style="margin: 0; font-size: 14px;">Escr&iacute;benos a <a href="mailto:contacto@yoparticipo.cl" style="color: #04BFAD; text-decoration: none; font-weight: 600;">contacto@yoparticipo.cl</a></p>
            </div>

            <p style="margin: 20px 0 5px; color: #555555; font-size: 14px;">&iexcl;Felicidades por dar este importante paso hacia nuevas oportunidades de salud!</p>

            <p style="margin-bottom: 0; color: #888888; font-size: 14px;"><em>Atentamente,<br>Equipo de Gesti&oacute;n de Ensayos Cl&iacute;nicos<br><strong>Yo Participo</strong></em></p>`;

    return this.getEmailWrapper('Estudio Asignado - Yo Participo', content);
  }

  /**
   * Plantilla HTML para correo de solicitud de estudio desde institución
   */
  private getTrialRequestEmailTemplate(requestData: {
    institutionName: string;
    contactEmail: string;
    trialTitle: string;
    trialDescription: string;
    additionalNotes?: string;
    requestDate: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Nuevo Estudio - YoParticipo</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #04bcbc 0%, #346c84 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">Nueva Solicitud de Estudio</h1>
        <p style="margin: 15px 0 0; font-size: 16px; opacity: 0.9;">Una institución ha solicitado crear un nuevo estudio clínico</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #04bcbc; margin-top: 0;">Detalles de la Solicitud</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #346c84; margin-top: 0;">${requestData.trialTitle}</h3>
            <p style="margin: 10px 0; color: #666;">${requestData.trialDescription}</p>
        </div>
        
        <div style="margin: 25px 0;">
            <h4 style="color: #04bcbc; margin-bottom: 15px;">📋 Información de la Institución</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Institución:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.institutionName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email Contacto:</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${requestData.contactEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">Fecha Solicitud:</td>
                    <td style="padding: 8px;">${requestData.requestDate}</td>
                </tr>
            </table>
        </div>
        
        ${requestData.additionalNotes ? `
        <div style="background-color: #e8f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #04bcbc; margin-top: 0;">📝 Notas Adicionales</h4>
            <p style="margin: 0; color: #666;">${requestData.additionalNotes}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://admin.yoparticipo.cl/trials" 
               style="display: inline-block; background-color: #04bcbc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
               👉 Revisar Solicitud en Dashboard
            </a>
        </div>
        
        <div style="border-top: 2px solid #04bcbc; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Acción requerida:</strong> Por favor revisa esta solicitud y contacta a la institución 
                para coordinar la creación del estudio clínico en el sistema.
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
