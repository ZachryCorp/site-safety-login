// backend/src/graphMailer.ts - Microsoft Graph sendMail transport (app-only auth)
//
// Replaces SMTP/nodemailer. The tenant blocks basic SMTP AUTH, so mail goes out
// through an app registration with the Mail.Send application permission,
// authenticated with a client certificate.
//
// Env vars:
//   GRAPH_TENANT_ID        - directory (tenant) ID
//   GRAPH_CLIENT_ID        - application (client) ID
//   GRAPH_CERT_THUMBPRINT  - SHA-1 thumbprint of the registered certificate
//   GRAPH_PRIVATE_KEY      - the certificate private key: either a literal PEM
//                            (with -----BEGIN----- header) or that PEM base64-
//                            encoded, which is what App Service settings want
//                            since they cannot hold newlines
//   GRAPH_PRIVATE_KEY_PATH - alternative to the above: path to a .pem file
//   GRAPH_SENDER           - mailbox to send as, e.g. SiteSafetyTrack@zachrycorp.com

import { ConfidentialClientApplication } from '@azure/msal-node';
import fs from 'fs';

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

export interface GraphAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface GraphMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: GraphAttachment[];
}

// Graph rejects a sendMail body over 4MB; leave headroom for the JSON envelope.
// Anything larger needs a draft + upload session, which no current caller sends.
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

function loadPrivateKey(): string {
  const inline = process.env.GRAPH_PRIVATE_KEY;
  if (inline && inline.trim()) {
    const trimmed = inline.trim();
    if (trimmed.includes('-----BEGIN')) {
      // App Service strips real newlines from settings; accept the \n-escaped form too.
      return trimmed.replace(/\n/g, '\n');
    }
    return Buffer.from(trimmed, 'base64').toString('utf8');
  }

  const path = process.env.GRAPH_PRIVATE_KEY_PATH;
  if (path && path.trim()) {
    return fs.readFileSync(path.trim(), 'utf8');
  }

  throw new Error('Set GRAPH_PRIVATE_KEY or GRAPH_PRIVATE_KEY_PATH');
}

let client: ConfidentialClientApplication | null = null;

function getClient(): ConfidentialClientApplication {
  if (client) {
    return client;
  }

  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const thumbprint = process.env.GRAPH_CERT_THUMBPRINT;

  if (!tenantId || !clientId || !thumbprint) {
    throw new Error('Set GRAPH_TENANT_ID, GRAPH_CLIENT_ID and GRAPH_CERT_THUMBPRINT');
  }

  client = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientCertificate: {
        thumbprint: thumbprint.replace(/[\s:]/g, '').toUpperCase(),
        privateKey: loadPrivateKey(),
      },
    },
  });

  return client;
}

// MSAL keeps its own in-memory cache and only hits the token endpoint when the
// cached token is near expiry, so this is cheap to call per send.
async function getAccessToken(): Promise<string> {
  const result = await getClient().acquireTokenByClientCredential({
    scopes: [GRAPH_SCOPE],
  });

  if (!result?.accessToken) {
    throw new Error('Graph token request returned no access token');
  }

  return result.accessToken;
}

export function getSender(): string {
  const sender = process.env.GRAPH_SENDER;
  if (!sender || !sender.trim()) {
    throw new Error('Set GRAPH_SENDER to the sending mailbox address');
  }
  return sender.trim();
}

export async function sendGraphMail(opts: GraphMailOptions): Promise<void> {
  const sender = getSender();
  const token = await getAccessToken();

  const attachments = (opts.attachments || []).map((a) => {
    if (a.content.length > MAX_ATTACHMENT_BYTES) {
      throw new Error(
        `Attachment ${a.filename} is ${a.content.length} bytes, over the ${MAX_ATTACHMENT_BYTES} byte sendMail limit`
      );
    }
    return {
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: a.filename,
      contentType: a.contentType,
      contentBytes: a.content.toString('base64'),
    };
  });

  const body = {
    message: {
      subject: opts.subject,
      body: { contentType: 'HTML', content: opts.html },
      toRecipients: [{ emailAddress: { address: opts.to } }],
      ...(attachments.length ? { attachments } : {}),
    },
    // Keep a record in the shared mailbox so sends are auditable.
    saveToSentItems: true,
  };

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  // A successful sendMail is 202 Accepted with an empty body.
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Graph sendMail failed: ${response.status} ${response.statusText} ${detail}`);
  }
}

// Verifies the app registration, certificate and mailbox without sending mail.
export async function testGraphConnection(): Promise<boolean> {
  try {
    const sender = getSender();
    const token = await getAccessToken();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}?$select=mail,userPrincipalName`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`Graph mailbox check failed: ${response.status} ${detail}`);
      return false;
    }

    console.log(`Graph connection successful, sending as ${sender}`);
    return true;
  } catch (error) {
    console.error('Graph connection failed:', error);
    return false;
  }
}
