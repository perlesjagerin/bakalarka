import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';

export interface TicketData {
  reservationCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  userEmail: string;
  ticketCount: number;
  totalPrice: number;
  paymentStatus: string;
}

/**
 * Generates a PDF ticket with QR code
 */
export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data.reservationCode, {
        width: 200,
        margin: 1,
      });

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Try to use system fonts with better Unicode support
      // Fallback to standard fonts if not available
      let regularFont = 'Helvetica';
      let boldFont = 'Helvetica-Bold';
      
      // Check for macOS system fonts
      const macFonts = [
        '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        '/Library/Fonts/Arial.ttf',
        '/Library/Fonts/Arial Bold.ttf'
      ];
      
      try {
        if (fs.existsSync(macFonts[0]) && fs.existsSync(macFonts[1])) {
          doc.registerFont('CustomRegular', macFonts[0]);
          doc.registerFont('CustomBold', macFonts[1]);
          regularFont = 'CustomRegular';
          boldFont = 'CustomBold';
        }
      } catch (error) {
        // Use standard fonts as fallback
        console.log('Using standard PDF fonts');
      }

      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header with gradient effect (simulated with rectangles)
      doc.rect(0, 0, 595, 150).fill('#6366f1');
      
      // Title
      doc.fillColor('#ffffff')
         .fontSize(32)
         .font(boldFont)
         .text('VSTUPENKA', 50, 50, { align: 'center' });

      doc.fontSize(16)
         .font(regularFont)
         .text('Rezervace vstupenek na studentské akce', 50, 90, { align: 'center' });

      // Main content area
      doc.fillColor('#000000')
         .fontSize(24)
         .font(boldFont)
         .text(data.eventTitle, 50, 180);

      // Event details
      const detailsY = 230;
      doc.fontSize(12)
         .font(regularFont)
         .fillColor('#374151');

      doc.text('Datum a čas:', 50, detailsY);
      doc.font(boldFont)
         .fillColor('#000000')
         .text(data.eventDate, 180, detailsY);

      doc.font(regularFont)
         .fillColor('#374151')
         .text('Místo:', 50, detailsY + 25);
      doc.font(boldFont)
         .fillColor('#000000')
         .text(data.eventLocation, 180, detailsY + 25);

      doc.font(regularFont)
         .fillColor('#374151')
         .text('Jméno:', 50, detailsY + 50);
      doc.font(boldFont)
         .fillColor('#000000')
         .text(data.userName, 180, detailsY + 50);

      doc.font(regularFont)
         .fillColor('#374151')
         .text('Email:', 50, detailsY + 75);
      doc.font(boldFont)
         .fillColor('#000000')
         .text(data.userEmail, 180, detailsY + 75);

      doc.font(regularFont)
         .fillColor('#374151')
         .text('Počet vstupenek:', 50, detailsY + 100);
      doc.font(boldFont)
         .fillColor('#000000')
         .text(`${data.ticketCount}x`, 180, detailsY + 100);

      if (data.totalPrice > 0) {
        doc.font(regularFont)
           .fillColor('#374151')
           .text('Celková cena:', 50, detailsY + 125);
        doc.font(boldFont)
           .fillColor('#000000')
           .text(`${data.totalPrice.toLocaleString('cs-CZ')} Kč`, 180, detailsY + 125);

        doc.font(regularFont)
           .fillColor('#374151')
           .text('Stav platby:', 50, detailsY + 150);
        doc.font(boldFont)
           .fillColor(data.paymentStatus === 'COMPLETED' ? '#10b981' : '#f59e0b')
           .text(data.paymentStatus === 'COMPLETED' ? 'Zaplaceno' : 'Čeká na platbu', 180, detailsY + 150);
      } else {
        doc.font(boldFont)
           .fillColor('#10b981')
           .text('Akce zdarma', 50, detailsY + 125);
      }

      // QR Code section
      const qrY = detailsY + 200;
      
      // Draw border around QR section
      doc.rect(50, qrY, 495, 240)
         .lineWidth(2)
         .strokeColor('#e5e7eb')
         .stroke();

      doc.fillColor('#6366f1')
         .fontSize(18)
         .font(boldFont)
         .text('Rezervační kód', 50, qrY + 20, { align: 'center' });

      // QR Code
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, 222.5, qrY + 50, { width: 150, height: 150 });

      // Reservation code
      doc.fontSize(24)
         .font(boldFont)
         .fillColor('#000000')
         .text(data.reservationCode, 50, qrY + 210, { align: 'center' });

      // Footer instructions
      const footerY = 750;
      doc.fontSize(10)
         .font(regularFont)
         .fillColor('#6b7280')
         .text('Předložte tuto vstupenku při vstupu na akci. QR kód bude naskenován.', 50, footerY, {
           align: 'center',
           width: 495
         });

      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text('© 2024 Rezervace vstupenek na studentské akce', 50, footerY + 20, {
           align: 'center',
           width: 495
         });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
