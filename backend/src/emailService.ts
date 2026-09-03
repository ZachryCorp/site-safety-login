// backend/src/emailService.ts - Email notifications via Microsoft Graph
//
// All exported send functions are guaranteed to never throw/reject: every
// failure is caught and logged inside safeSend, so callers can fire-and-forget
// without risking the API request or an unhandled rejection.
//
// Transport and its GRAPH_* env vars live in ./graphMailer.
//
// Env vars:
//   EMAIL_OVERRIDE_TO - dev only: reroutes ALL mail to this address, prefixing
//                       the subject with the intended recipient
//   EMAIL_DISABLED    - set to 'true' to skip sending entirely (logs only)

import { generateCertificatePdf, CertificateData } from './certificate';
import { GraphMailOptions, sendGraphMail, testGraphConnection } from './graphMailer';

// Staff directory, keyed by normalized name (lowercased, title stripped).
// Synced to the meetingWith dropdown lists in src/pages/Home.tsx. Where the
// two frontend lists disagree on spelling, both variants are mapped to the
// same address.
const staffEmails: { [key: string]: string } = {
  'jacob ackerman': 'jacob.ackerman@zachrycorp.com',
  'william aiken': 'william.aiken@zachrycorp.com',
  'robert allison': 'robert.allison@zachrycorp.com',
  'robert alvarado': 'robert.alvarado@zachrycorp.com',
  'julio avila': 'julio.avila@zachrycorp.com',
  'benjamin caccamo': 'benjamin.caccamo@zachrycorp.com',
  'ben caccamo': 'benjamin.caccamo@zachrycorp.com',
  'michael castillo': 'michael.castillo@zachrycorp.com',
  'jose cedeno': 'jose.cedeno@zachrycorp.com',
  'diane christensen': 'diane.christensen@zachrycorp.com',
  'daniel davis': 'daniel.davis@zachrycorp.com',
  'james davis': 'james.davis@zachrycorp.com',
  'elda espinoza': 'elda.espinoza@zachrycorp.com',
  'jesse gallegos': 'jesse.gallegos@zachrycorp.com',
  'keith gilson': 'keith.gilson@zachrycorp.com',
  'jose gonzalez': 'jose.gonzalez@zachrycorp.com',
  'craig hernandez': 'craig.hernandez@zachrycorp.com',
  'joseph hernandez': 'joseph.hernandez@zachrycorp.com',
  'brittney hill': 'brittney.hill@zachrycorp.com',
  'richard jarzombek': 'richard.jarzombek@zachrycorp.com',
  'robert kerr': 'robert.kerr@zachrycorp.com',
  'erik kottke': 'erik.kottke@zachrycorp.com',
  'eric kottke': 'erik.kottke@zachrycorp.com',
  'mario lira': 'mario.lira@zachrycorp.com',
  'patrick mcmahan': 'patrick.mcmahan@zachrycorp.com',
  'zachary mcmahon': 'zachary.mcmahon@zachrycorp.com',
  'zach mcmahon': 'zachary.mcmahon@zachrycorp.com',
  'alexis navarro': 'alexis.navarro@zachrycorp.com',
  'jimmy rabon': 'jimmy.rabon@zachrycorp.com',
  'ramon riviera': 'ramon.riviera@zachrycorp.com',
  'ramon rivera': 'ramon.riviera@zachrycorp.com',
  'victor saucedo': 'victor.saucedo@zachrycorp.com',
  'jason stehle': 'jason.stehle@zachrycorp.com',
  'jagger tieman': 'jagger.tieman@zachrycorp.com',
  'jagger tiemann': 'jagger.tieman@zachrycorp.com',
  'arnie tovar': 'arnie.tovar@zachrycorp.com',
  'violeta vega-gomez': 'violeta.vega-gomez@zachrycorp.com',
  'tony ward': 'tony.ward@zachrycorp.com',
  'mike watson': 'mike.watson@zachrycorp.com',
  'hernan williams': 'hernan.williams@zachrycorp.com',
  'scott wolston': 'scott.wolston@zachrycorp.com',
  'adam ybarra': 'adam.ybarra@zachrycorp.com',
};

// Matches the Prisma User row shape, so DB rows can be passed straight in.
export interface VisitorInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plant: string | null;
  company?: string | null;
  meetingWith?: string | null;
  createdAt: Date;
  signedOutAt?: Date | null;
}

// 'Eric Kottke - Production Manager' -> 'eric kottke'
function normalizeName(raw: string): string {
  return raw.split(' - ')[0].trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveStaffEmail(meetingWith: string | null | undefined): string | null {
  if (!meetingWith || !meetingWith.trim()) {
    return null;
  }

  const key = normalizeName(meetingWith);
  if (staffEmails[key]) {
    return staffEmails[key];
  }

  // Fallback for staff not yet in the map: derive first.last@zachrycorp.com
  const parts = key.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[parts.length - 1]}@zachrycorp.com`;
  }

  console.warn(`Could not resolve staff email for meetingWith="${meetingWith}"`);
  return null;
}

function formatCentral(date: Date): string {
  return date.toLocaleString('en-US', { timeZone: 'America/Chicago' });
}

function renderEmailHtml(
  headerColor: string,
  title: string,
  intro: string,
  rows: [string, string][],
  alertHtml?: string
): string {
  const rowsHtml = rows
    .map(
      ([label, value]) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6; font-weight: bold; width: 40%; background-color: #f8f9fa;">${label}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${value}</td>
                </tr>`
    )
    .join('');

  return `
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${headerColor}; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">${title}</h2>
              <p style="margin: 5px 0 0 0;">Site Safety System</p>
            </div>
            <div style="padding: 20px; background-color: #f8f9fa;">
              <h3 style="color: #333;">${intro}</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white;">
                ${rowsHtml}
              </table>
              ${alertHtml || ''}
            </div>
            <div style="background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
              Automated message from Zachrycorp Site Safety System
            </div>
          </div>
        </body>
        </html>
      `;
}

async function safeSend(opts: GraphMailOptions, context: string): Promise<void> {
  try {
    if (process.env.EMAIL_DISABLED === 'true') {
      console.log(`[email disabled] Skipped ${context} email to ${opts.to}`);
      return;
    }
    if (process.env.EMAIL_OVERRIDE_TO) {
      opts.subject = `[TEST → ${opts.to}] ${opts.subject}`;
      opts.to = process.env.EMAIL_OVERRIDE_TO;
    }
    await sendGraphMail(opts);
    console.log(`Email sent (${context}) to ${opts.to}`);
  } catch (err) {
    console.error(`Email failed (${context}):`, err);
  }
}

export async function sendSignInEmail(v: VisitorInfo): Promise<void> {
  const recipient = resolveStaffEmail(v.meetingWith);
  if (!recipient) {
    console.log('No meeting contact for sign-in email, skipping');
    return;
  }

  await safeSend(
    {
      to: recipient,
      subject: `Visitor Sign-In: ${v.firstName} ${v.lastName}`,
      html: renderEmailHtml(
        '#0078d4',
        'Visitor Sign-In Notification',
        'A visitor has signed in to meet with you',
        [
          ['Visitor Name', `${v.firstName} ${v.lastName}`],
          ['Company', v.company || 'N/A'],
          ['Plant', v.plant ?? ''],
          ['Email', v.email],
          ['Phone', v.phone],
          ['Sign-in Time', formatCentral(v.createdAt)],
        ],
        `<div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
          <strong>Action Required:</strong> Please be aware that your visitor has arrived.
        </div>`
      ),
    },
    'sign-in'
  );
}

export async function sendSignOutEmail(v: VisitorInfo): Promise<void> {
  const recipient = resolveStaffEmail(v.meetingWith);
  if (!recipient) {
    console.log('No meeting contact for sign-out email, skipping');
    return;
  }

  await safeSend(
    {
      to: recipient,
      subject: `Visitor Sign-Out: ${v.firstName} ${v.lastName}`,
      html: renderEmailHtml(
        '#d83b3b',
        'Visitor Sign-Out Notification',
        'Your visitor has signed out',
        [
          ['Visitor Name', `${v.firstName} ${v.lastName}`],
          ['Plant', v.plant ?? ''],
          ['Sign-in Time', formatCentral(v.createdAt)],
          ['Sign-out Time', formatCentral(v.signedOutAt ?? new Date())],
        ]
      ),
    },
    'sign-out'
  );
}

export async function sendStillOnSiteEmail(v: VisitorInfo): Promise<void> {
  const recipient = resolveStaffEmail(v.meetingWith);
  if (!recipient) {
    console.log('No meeting contact for still-on-site email, skipping');
    return;
  }

  await safeSend(
    {
      to: recipient,
      subject: `Late Visitor Alert: ${v.firstName} ${v.lastName}`,
      html: renderEmailHtml(
        '#e8a317',
        'Late Visitor Alert',
        'Your visitor is still on-site past 5:00 PM Central',
        [
          ['Visitor Name', `${v.firstName} ${v.lastName}`],
          ['Plant', v.plant ?? ''],
          ['Email', v.email],
          ['Phone', v.phone],
          ['Sign-in Time', formatCentral(v.createdAt)],
        ],
        `<div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 5px;">
          <strong>Action Required:</strong> Please check if they need to sign out or extend their visit.
        </div>`
      ),
    },
    'still-on-site'
  );
}

export async function sendTrainingCompletionEmail(
  v: VisitorInfo,
  cert: CertificateData
): Promise<void> {
  const recipient = resolveStaffEmail(v.meetingWith);
  if (!recipient) {
    console.log('No meeting contact for training-completion email, skipping');
    return;
  }

  let attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  try {
    const pdfBuffer = await generateCertificatePdf(cert);
    attachments = [
      {
        filename: `certificate-${v.firstName}-${v.lastName}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  } catch (err) {
    console.error('Certificate PDF generation failed, sending email without attachment:', err);
  }

  await safeSend(
    {
      to: recipient,
      subject: `Training Completed: ${v.firstName} ${v.lastName}`,
      html: renderEmailHtml(
        '#2e8540',
        'Training Completion Notification',
        'Your visitor has completed site-specific safety training',
        [
          ['Visitor Name', `${v.firstName} ${v.lastName}`],
          ['Company', cert.company],
          ['Plant', cert.plant],
          ['Email', v.email],
          ['Phone', v.phone],
          ['Training Date', cert.trainingDate],
          ['Expiration Date', cert.expirationDate],
          ['Certificate #', cert.vNumber],
        ],
        attachments.length
          ? `<div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
              The training certificate is attached to this email.
            </div>`
          : undefined
      ),
      attachments,
    },
    'training-completion'
  );
}

export async function testEmailConnection(): Promise<boolean> {
  return testGraphConnection();
}
