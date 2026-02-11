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
   * Envía correo cuando un paciente es verificado
   * 
   * @param patientEmail - Email del paciente
   * @param patientName - Nombre completo del paciente
   */
  async sendPatientVerifiedEmail(patientEmail: string, patientName: string): Promise<void> {
    const subject = 'Tu perfil ha sido verificado - YoParticipo';
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
   * Helper para generar el HTML del Stepper
   * @param currentStep 1: Registro, 2: Verificación, 3: Estudio Asignado
   */
  private getStepperHtml(currentStep: number): string {
    const steps = [
      { num: 1, label: 'Registro' },
      { num: 2, label: 'Verificación' },
      { num: 3, label: 'Estudio Asignado' }
    ];

    let stepsHtml = '';
    
    // Calcular el porcentaje de progreso para la línea de fondo
    // Paso 1: 0% (inicio) a 0%
    // Paso 2: 0% a 50%
    // Paso 3: 0% a 100%
    let progressWidth = '0%';
    if (currentStep === 2) progressWidth = '35%'; // Mitad del camino visualmente
    if (currentStep === 3) progressWidth = '70%'; // Camino completo visualmente (ajustado al diseño)
    if (currentStep >= 3) progressWidth = '70%'; // Mantener lleno si es el último o más

    steps.forEach((step, index) => {
      const isCompleted = step.num <= currentStep;
      const isCurrent = step.num === currentStep;
      
      const circleColor = isCompleted ? '#005f73' : '#e0e0e0';
      const textColor = isCompleted ? '#005f73' : '#999999';
      const fontWeight = isCurrent ? 'bold' : 'normal';
      const border = isCompleted ? '2px solid #ffffff' : '2px solid #ffffff'; // Borde blanco para separar de la línea
      
      // Círculo del paso
      stepsHtml += `
        <div style="display: inline-block; text-align: center; width: 30%; vertical-align: top; position: relative; z-index: 2;">
          <div style="
            width: 30px; 
            height: 30px; 
            background-color: ${circleColor}; 
            color: #ffffff; 
            border-radius: 50%; 
            line-height: 30px; 
            margin: 0 auto 10px; 
            font-weight: bold;
            font-size: 14px;
            border: ${border};">
            ${step.num}
          </div>
          <div style="color: ${textColor}; font-size: 12px; font-weight: ${fontWeight};">
            ${step.label}
          </div>
        </div>
      `;
    });

    return `
      <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eeeeee; margin-bottom: 25px; position: relative;">
        <!-- Línea conectora de fondo (Gris) -->
        <div style="position: absolute; top: 35px; left: 15%; right: 15%; height: 2px; background-color: #e0e0e0; z-index: 1;"></div>
        
        <!-- Línea de progreso (Color) -->
        <div style="position: absolute; top: 35px; left: 15%; width: ${progressWidth}; height: 2px; background-color: #005f73; z-index: 1;"></div>

        ${stepsHtml}
      </div>
    `;
  }

  /**
   * Plantilla HTML para correo de paciente verificado (Paso 2)
   */
  private getPatientVerifiedEmailTemplate(patientName: string): string {
    const stepper = this.getStepperHtml(2);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Perfil Verificado</title>
</head>
<body style="background-color: #ffffff; font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 0; width: 100%;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #005f73;">
            <tr>
                <td align="center" style="padding: 0px 20px;">
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 300px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            ${stepper}
            
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">¡Tu perfil ha sido verificado!</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Nos complace informarte que nuestro equipo médico ha revisado y verificado exitosamente tus antecedentes.</p>

            <h3 style="color: #005f73; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #00bcd4; padding-bottom: 5px;">📝 Estado de tu proceso</h3>

            <div style="margin-top: 20px;">
                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 1. Registro</strong><br>
                <span style="color: #666;">Formulario recibido.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 2. Verificación Médica (COMPLETADO)</strong><br>
                <span style="color: #666;">Hemos validado tus antecedentes clínicos correctamente. Ahora eres parte de nuestra base de pacientes validados.</span></p>

                <p style="margin-bottom: 10px; color: #005f73; background-color: #e0f7fa; padding: 10px; border-radius: 4px;"><strong>📍 3. Búsqueda de estudios (EN CURSO)</strong><br>
                <span style="color: #333;">Tu perfil ya está activo en nuestro sistema. Estamos cruzando tu información con los estudios clínicos disponibles para encontrar el mejor "match" para ti.</span></p>

                <p style="margin-bottom: 10px; color: #888;"><strong>⏳ 4. Invitación formal</strong><br>
                <span style="color: #999;">Te contactaremos solo cuando encontremos una oportunidad compatible.</span></p>
            </div>

            <p style="margin-top: 20px; margin-bottom: 15px; color: #555555; font-size: 16px;">No necesitas hacer nada más por ahora. Te avisaremos apenas tengamos noticias.</p>
            
            <br>
            <p style="margin-bottom: 15px; color: #888888; font-size: 14px;"><em>Atentamente,<br>El equipo de Gestión de Ensayos Clínicos YoParticipo.</em></p>
        </div>

        <!-- FOOTER -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
            <p>Este es un correo automático, por favor no responder a esta dirección.</p>
            <p>© 2025 YoParticipo. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Plantilla HTML para correo de confirmación de postulación (Paso 1)
   */
  private getConfirmationEmailTemplate(patientName: string): string {
    const stepper = this.getStepperHtml(1);
    
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
                <td align="center" style="padding: 0px 20px;">
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 300px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            ${stepper}
            
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">Registro recibido exitosamente</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Queremos confirmarte que tu registro ha sido recibido correctamente y que la información ingresada ya forma parte de nuestra base de datos segura de participantes.</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">A continuación, te explicamos de forma clara en qué etapa del proceso te encuentras y cuáles son los pasos siguientes:</p>

            <h3 style="color: #005f73; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #00bcd4; padding-bottom: 5px;">📝 Etapas del proceso en Yo Participo</h3>

            <div style="margin-top: 20px;">
                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 1. Registro de formulario completado</strong><br>
                <span style="color: #666;">Hemos recibido exitosamente el formulario con tus datos iniciales y antecedentes de salud.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>🔍 2. Revisión y recopilación de antecedentes médicos (si corresponde)</strong><br>
                <span style="color: #666;">En caso de ser necesario, uno de nuestros profesionales de salud podría contactarte para solicitar o aclarar información médica adicional, siempre con tu autorización.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>📍 3. Búsqueda de estudios clínicos disponibles</strong><br>
                <span style="color: #666;">Nuestro equipo experto evaluará si existen ensayos clínicos activos que se ajusten a tu condición de salud, intereses y que se desarrollen en tu ciudad o en la zona más cercana a tu domicilio.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>📞 4. Invitación formal a participar</strong><br>
                <span style="color: #666;">Si identificamos un estudio adecuado, nos pondremos en contacto contigo para explicarte en detalle de qué se trata el estudio, resolver tus dudas y preguntarte si deseas participar.<br>
                La decisión de participar será siempre voluntaria.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>🤝 5. Seguimiento y acompañamiento</strong><br>
                <span style="color: #666;">En caso de que decidas participar, nuestro equipo realizará un seguimiento y acompañamiento durante el proceso, manteniéndote informado y resguardando en todo momento tu bienestar y confidencialidad.</span></p>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #555;">Es importante que sepas que solo te contactaremos si identificamos una oportunidad real y adecuada para ti. Si no existen estudios compatibles en este momento, no recibirás comunicaciones innecesarias.</p>
                <br>
                <p style="margin: 0; font-size: 14px; color: #555;">Toda tu información será tratada con estricta confidencialidad y utilizada únicamente para fines relacionados con la evaluación y gestión de oportunidades de participación en estudios clínicos.</p>
            </div>

            <h3 style="color: #005f73; font-size: 16px; margin-top: 20px;">📩 ¿Tienes dudas o necesitas contactarnos?</h3>
            <p style="color: #555;">Puedes escribirnos en cualquier momento a: <a href="mailto:contacto@yoparticipo.cl" style="color: #00bcd4; text-decoration: none;">contacto@yoparticipo.cl</a></p>
            
            <p style="margin-top: 25px; color: #555555; font-size: 16px;">Agradecemos tu confianza y tu interés en contribuir al avance de la investigación clínica.</p>
            
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
   * Plantilla HTML para correo de match encontrado (Paso 3)
   */
  private getMatchFoundEmailTemplate(patientName: string, dashboardLink?: string): string {
    const stepper = this.getStepperHtml(3);
    
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
                <td align="center" style="padding: 0px 20px;">
                    <img src="cid:logo_yoparticipo" alt="YoParticipo" style="max-width: 300px; height: auto; display: block;" />
                </td>
            </tr>
        </table>

        <!-- CONTENIDO -->
        <div style="padding: 30px 25px;">
            ${stepper}
            
            <h1 style="color: #005f73; font-size: 22px; margin-bottom: 20px; font-weight: 600;">¡Buenas noticias! Hemos encontrado una oportunidad</h1>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Hola <strong>${patientName}</strong>,</p>
            
            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Nuestro sistema ha detectado que tu perfil es compatible con un nuevo <strong>Ensayo Clínico Activo</strong>.</p>

            <h3 style="color: #005f73; font-size: 18px; margin-top: 25px; border-bottom: 2px solid #00bcd4; padding-bottom: 5px;">📝 Estado de tu proceso</h3>

            <div style="margin-top: 20px;">
                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 1. Registro</strong><br>
                <span style="color: #666;">Completado.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 2. Verificación Médica</strong><br>
                <span style="color: #666;">Completado.</span></p>

                <p style="margin-bottom: 10px; color: #333;"><strong>✅ 3. Búsqueda de estudios (¡ÉXITO!)</strong><br>
                <span style="color: #666;">Hemos encontrado un estudio que coincide con tu perfil.</span></p>

                <p style="margin-bottom: 10px; color: #005f73; background-color: #f0fff4; padding: 10px; border-radius: 4px; border-left: 4px solid #38a169;"><strong>📍 4. Invitación Formal (PRÓXIMO PASO)</strong><br>
                <span style="color: #333;">Un coordinador clínico se pondrá en contacto contigo en las próximas <strong>48 horas hábiles</strong> para explicarte los detalles y requisitos.</span></p>
            </div>

            <p style="margin-bottom: 15px; color: #555555; font-size: 16px;">Por favor, mantente atento a tu teléfono o correo electrónico.${dashboardLink ? ' Si deseas ver los detalles preliminares, puedes ingresar a tu perfil:' : ''}</p>
            
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
}
