// backend/src/certificate.ts - Server-side certificate PDF generation
// Mirrors the jsPDF certificate layout in src/pages/ThankYou.tsx so the
// emailed copy matches what the visitor can download from the browser.

import PDFDocument from 'pdfkit';

export interface CertificateData {
  vNumber: string;
  firstName: string;
  lastName: string;
  company: string;
  plant: string;
  trainingDate: string;
  expirationDate: string;
  siteContact: string;
}

export function generateCertificatePdf(cert: CertificateData): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 0 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const center = { align: 'center' as const, width: pageWidth };

    // Blue header band
    doc.rect(0, 0, pageWidth, 140).fill('#1E508C');

    doc.fillColor('#FFFFFF');
    doc.font('Helvetica-Bold').fontSize(24).text('Site Specific Certificate', 0, 40, center);
    doc.font('Helvetica').fontSize(12).text('Complies with 30 CFR § 46.11', 0, 72, center);
    doc.fontSize(16).text('Capitol Aggregates', 0, 96, center);
    doc.fontSize(12).text(`Capitol ${cert.plant}`, 0, 118, center);

    // Border around the details section
    doc.roundedRect(28, 156, pageWidth - 56, 396, 8).stroke('#C8C8C8');

    // Certificate details
    const fields: [string, string][] = [
      ['First Name', cert.firstName],
      ['Last Name', cert.lastName],
      ['Company', cert.company],
      ['Training Date', cert.trainingDate],
      ['Expiration Date', cert.expirationDate],
      ['Training Version', new Date().toISOString()],
      ['Site Contact', cert.siteContact],
      ['Language', 'English'],
    ];

    const startY = 196;
    const labelX = 100;
    const valueX = 280;
    const lineHeight = 34;

    doc.fillColor('#000000').fontSize(12);
    fields.forEach(([label, value], index) => {
      const y = startY + index * lineHeight;
      doc.font('Helvetica-Bold').text(label, labelX, y);
      doc.font('Helvetica').text(value, valueX, y);
    });

    // Version number at bottom
    doc.font('Helvetica').fontSize(10).fillColor('#646464');
    doc.text(cert.vNumber, 0, 524, center);

    doc.end();
  });
}
