// src/pages/ThankYou.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const ThankYou: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const existing = new URLSearchParams(location.search).get('existing') === 'true';
  const certificate = location.state?.certificate;

  const generatePDF = () => {
    if (!certificate) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Blue header
    doc.setFillColor(30, 80, 140);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Site Specific Certificate', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Complies with 30 CFR § 46.11', pageWidth / 2, 30, { align: 'center' });

    // Company info
    doc.setFontSize(16);
    doc.text('Capitol Aggregates', pageWidth / 2, 42, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Capitol ${certificate.plant}`, pageWidth / 2, 48, { align: 'center' });

    // Certificate details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    const startY = 70;
    const labelX = 50;
    const valueX = 110;
    const lineHeight = 12;

    const fields = [
      ['First Name', certificate.firstName],
      ['Last Name', certificate.lastName],
      ['Company', certificate.company],
      ['Training Date', certificate.trainingDate],
      ['Expiration Date', certificate.expirationDate],
      ['Training Version', new Date().toISOString()],
      ['Site Contact', certificate.siteContact],
      ['Language', 'English'],
    ];

    fields.forEach((field, index) => {
      const y = startY + index * lineHeight;
      doc.setFont('helvetica', 'bold');
      doc.text(field[0], labelX, y);
      doc.setFont('helvetica', 'normal');
      doc.text(field[1], valueX, y);
    });

    // Version number at bottom
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(certificate.vNumber, pageWidth / 2, 180, { align: 'center' });

    // Border
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(10, 55, pageWidth - 20, 140, 3, 3);

    // Save
    doc.save(`certificate-${certificate.firstName}-${certificate.lastName}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Thank You!</h1>
        {existing ? (
          <p style={styles.message}>You have successfully signed in today.</p>
        ) : (
          <>
            <p style={styles.message}>You have completed your site safety training.</p>
            {certificate && (
              <button onClick={generatePDF} style={styles.downloadButton}>
                Download Certificate (PDF)
              </button>
            )}
          </>
        )}
        <button onClick={() => navigate('/')} style={styles.homeButton}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f4',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: 12,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
  },
  title: {
    color: '#28a745',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  downloadButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1rem',
    width: '100%',
  },
  homeButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: 6,
    backgroundColor: '#6c757d',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
};

export default ThankYou;