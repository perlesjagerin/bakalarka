import { generateTicketPDF, TicketData } from '../ticketGenerator';

describe('Ticket Generator', () => {
  const validTicketData: TicketData = {
    reservationCode: 'TEST-2025-001',
    eventTitle: 'Test Koncert 2025',
    eventDate: '31. prosince 2025 v 20:00',
    eventLocation: 'O2 Arena, Praha',
    userName: 'Jan Novák',
    userEmail: 'jan.novak@example.com',
    ticketCount: 2,
    totalPrice: 1000,
    paymentStatus: 'COMPLETED',
  };

  it('should generate PDF buffer for valid ticket data', async () => {
    const pdfBuffer = await generateTicketPDF(validTicketData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    
    // Check PDF header
    expect(pdfBuffer.toString('ascii', 0, 4)).toBe('%PDF');
  });

  it('should generate PDF with QR code for reservation code', async () => {
    const pdfBuffer = await generateTicketPDF(validTicketData);
    
    // PDF should contain QR code data (PNG image)
    expect(pdfBuffer.length).toBeGreaterThan(1000); // QR code adds significant size
  });

  it('should handle free events (totalPrice = 0)', async () => {
    const freeTicketData: TicketData = {
      ...validTicketData,
      totalPrice: 0,
      paymentStatus: 'FREE',
    };
    
    const pdfBuffer = await generateTicketPDF(freeTicketData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle single ticket', async () => {
    const singleTicketData: TicketData = {
      ...validTicketData,
      ticketCount: 1,
      totalPrice: 500,
    };
    
    const pdfBuffer = await generateTicketPDF(singleTicketData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle multiple tickets', async () => {
    const multiTicketData: TicketData = {
      ...validTicketData,
      ticketCount: 5,
      totalPrice: 2500,
    };
    
    const pdfBuffer = await generateTicketPDF(multiTicketData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle long event titles', async () => {
    const longTitleData: TicketData = {
      ...validTicketData,
      eventTitle: 'Velký Vánoční Charitativní Koncert Pro Podporu Dětských Domovů 2025',
    };
    
    const pdfBuffer = await generateTicketPDF(longTitleData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle long location names', async () => {
    const longLocationData: TicketData = {
      ...validTicketData,
      eventLocation: 'Kongresové centrum O2 Universum, Českomoravská 2345/17a, 190 00 Praha 9 - Libeň',
    };
    
    const pdfBuffer = await generateTicketPDF(longLocationData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle special characters in user name', async () => {
    const specialCharData: TicketData = {
      ...validTicketData,
      userName: 'Lukáš Dvořák',
      userEmail: 'lukas.dvorak@seznam.cz',
    };
    
    const pdfBuffer = await generateTicketPDF(specialCharData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle different payment statuses', async () => {
    const statuses = ['COMPLETED', 'PENDING', 'FREE', 'REFUNDED'] as const;
    
    for (const status of statuses) {
      const ticketData: TicketData = {
        ...validTicketData,
        paymentStatus: status,
      };
      
      const pdfBuffer = await generateTicketPDF(ticketData);
      
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    }
  });

  it('should handle high ticket counts', async () => {
    const highCountData: TicketData = {
      ...validTicketData,
      ticketCount: 100,
      totalPrice: 50000,
    };
    
    const pdfBuffer = await generateTicketPDF(highCountData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle decimal prices', async () => {
    const decimalPriceData: TicketData = {
      ...validTicketData,
      totalPrice: 1234.56,
    };
    
    const pdfBuffer = await generateTicketPDF(decimalPriceData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate different PDFs for different reservation codes', async () => {
    const data1: TicketData = {
      ...validTicketData,
      reservationCode: 'TEST-001',
    };
    
    const data2: TicketData = {
      ...validTicketData,
      reservationCode: 'TEST-002',
    };
    
    const pdf1 = await generateTicketPDF(data1);
    const pdf2 = await generateTicketPDF(data2);
    
    // PDFs should be different (different QR codes)
    expect(pdf1.equals(pdf2)).toBe(false);
  });

  it('should handle Czech date formats', async () => {
    const czechDateData: TicketData = {
      ...validTicketData,
      eventDate: '1. ledna 2026 v 15:30',
    };
    
    const pdfBuffer = await generateTicketPDF(czechDateData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should handle very long reservation codes', async () => {
    const longCodeData: TicketData = {
      ...validTicketData,
      reservationCode: 'VERY-LONG-RESERVATION-CODE-2025-12-31-ABCDEFGH',
    };
    
    const pdfBuffer = await generateTicketPDF(longCodeData);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
