import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');

    // Check if email is configured
    if (!emailUser || !emailPass) {
      console.warn('⚠️  Email credentials not configured. Email notifications will be disabled.');
      console.warn('   To enable emails, set EMAIL_USER and EMAIL_PASS in .env file');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true for 465, false for other ports
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      this.isConfigured = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 Email would be sent to ${options.to}: ${options.subject}`);
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Rezervační Systém" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      });

      console.log(`✅ Email sent to ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  // Email templates
  async sendWelcomeEmail(email: string, firstName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vítejte v Rezervačním Systému!</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Děkujeme za registraci! Tvůj účet byl úspěšně vytvořen.</p>
            <p>Nyní můžeš procházet akce, vytvářet rezervace a užívat si všechny funkce našeho systému.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events" class="button">Prohlédnout akce</a>
            <p>Pokud máš jakékoliv otázky, neváhej nás kontaktovat.</p>
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Vítej v Rezervačním Systému!',
      html,
      text: `Ahoj ${firstName}, děkujeme za registraci! Tvůj účet byl úspěšně vytvořen.`,
    });
  }

  async sendReservationConfirmation(
    email: string,
    firstName: string,
    eventTitle: string,
    reservationCode: string,
    ticketCount: number,
    totalAmount: number,
    eventDate: string,
    eventLocation: string
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reservation-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .code { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 5px; letter-spacing: 2px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Rezervace potvrzena!</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Tvoje rezervace byla úspěšně vytvořena. Těšíme se na viděnou!</p>
            
            <div class="reservation-details">
              <h2>Detail rezervace</h2>
              <div class="detail-row">
                <span class="detail-label">Akce:</span>
                <span>${eventTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Datum:</span>
                <span>${eventDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Místo:</span>
                <span>${eventLocation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Počet vstupenek:</span>
                <span>${ticketCount}×</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Celková cena:</span>
                <span>${totalAmount} Kč</span>
              </div>
            </div>

            <p><strong>Rezervační kód:</strong></p>
            <div class="code">${reservationCode}</div>
            
            <p>Tento kód si ulož - budeš ho potřebovat při vstupu na akci.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reservations" class="button">Zobrazit moje rezervace</a>
            
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `✅ Rezervace potvrzena - ${eventTitle}`,
      html,
      text: `Ahoj ${firstName}, tvoje rezervace (kód: ${reservationCode}) pro akci "${eventTitle}" byla úspěšně vytvořena.`,
    });
  }

  async sendPaymentConfirmation(
    email: string,
    firstName: string,
    eventTitle: string,
    reservationCode: string,
    amount: number
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Platba potvrzena!</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Tvoje platba byla úspěšně zpracována.</p>
            
            <div class="amount">${amount} Kč</div>
            
            <p><strong>Akce:</strong> ${eventTitle}</p>
            <p><strong>Rezervační kód:</strong> ${reservationCode}</p>
            
            <p>Vstupenky si můžeš stáhnout z tvého profilu.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reservations" class="button">Stáhnout vstupenky</a>
            
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `💳 Platba potvrzena - ${eventTitle}`,
      html,
      text: `Ahoj ${firstName}, tvoje platba ${amount} Kč pro rezervaci ${reservationCode} byla úspěšně zpracována.`,
    });
  }

  async sendReservationCancellation(
    email: string,
    firstName: string,
    eventTitle: string,
    reservationCode: string,
    refundAmount?: number
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Rezervace zrušena</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Tvoje rezervace byla zrušena.</p>
            
            <p><strong>Akce:</strong> ${eventTitle}</p>
            <p><strong>Rezervační kód:</strong> ${reservationCode}</p>
            
            ${refundAmount ? `<p>💰 <strong>Refundace:</strong> ${refundAmount} Kč bude vrácena na tvůj účet do 5-10 pracovních dnů.</p>` : ''}
            
            <p>Děkujeme za pochopení.</p>
            
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `❌ Rezervace zrušena - ${eventTitle}`,
      html,
      text: `Ahoj ${firstName}, tvoje rezervace ${reservationCode} pro akci "${eventTitle}" byla zrušena.${refundAmount ? ` Refundace ${refundAmount} Kč bude vrácena.` : ''}`,
    });
  }

  async sendEventStatusChange(
    email: string,
    firstName: string,
    eventTitle: string,
    newStatus: string,
    message: string
  ) {
    const statusColors = {
      PUBLISHED: '#10b981',
      CANCELLED: '#ef4444',
      COMPLETED: '#6366f1',
      DRAFT: '#f59e0b',
    };

    const color = statusColors[newStatus as keyof typeof statusColors] || '#667eea';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Změna stavu akce</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Stav tvé akce <strong>"${eventTitle}"</strong> byl změněn.</p>
            
            <p><strong>Nový stav:</strong> ${message}</p>
            
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📢 Změna stavu akce - ${eventTitle}`,
      html,
      text: `Ahoj ${firstName}, stav tvé akce "${eventTitle}" byl změněn na: ${message}`,
    });
  }

  async sendComplaintResponse(
    email: string,
    firstName: string,
    eventTitle: string,
    status: string,
    adminResponse: string,
    refundAmount?: number
  ) {
    const statusText = {
      RESOLVED: 'Vyřešena',
      REJECTED: 'Zamítnuta',
      IN_REVIEW: 'V řešení',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .response-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Odpověď na reklamaci</h1>
          </div>
          <div class="content">
            <p>Ahoj ${firstName},</p>
            <p>Tvoje reklamace k akci <strong>"${eventTitle}"</strong> byla zpracována.</p>
            
            <p><strong>Stav:</strong> ${statusText[status as keyof typeof statusText] || status}</p>
            
            <div class="response-box">
              <strong>Odpověď administrátora:</strong>
              <p>${adminResponse}</p>
            </div>
            
            ${refundAmount ? `<p>💰 <strong>Refundace:</strong> ${refundAmount} Kč bude vrácena na tvůj účet do 5-10 pracovních dnů.</p>` : ''}
            
            <p>S pozdravem,<br>Tým Rezervačního Systému</p>
          </div>
          <div class="footer">
            <p>Tento email byl odeslán automaticky. Prosím neodpovídej na něj.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `📝 Odpověď na reklamaci - ${eventTitle}`,
      html,
      text: `Ahoj ${firstName}, tvoje reklamace k akci "${eventTitle}" byla zpracována. Stav: ${statusText[status as keyof typeof statusText]}. Odpověď: ${adminResponse}`,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
