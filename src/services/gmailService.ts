/**
 * Gmail Integration Service
 * Uses Google Workspace Gmail API v1 to send stock market analysis reports.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
}

/**
 * Encodes string to base64url format required by Gmail API
 */
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Creates raw RFC 822 email payload
 */
function createRawEmail({ to, subject, bodyText, bodyHtml }: EmailPayload): string {
  const boundary = '==_MarketPulse_Boundary_' + Date.now();
  
  let mail = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(new TextEncoder().encode(subject).reduce((data, byte) => data + String.fromCharCode(byte), ''))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ];

  if (bodyHtml) {
    mail = mail.concat([
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      bodyHtml,
    ]);
  }

  mail.push(`--${boundary}--`);
  return mail.join('\r\n');
}

/**
 * Sends email via Gmail API v1
 */
export async function sendEmailViaGmail(
  accessToken: string,
  payload: EmailPayload
): Promise<{ id: string; threadId: string }> {
  const rawEmail = createRawEmail(payload);
  const encodedRaw = base64UrlEncode(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedRaw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Erro ao enviar e-mail via Gmail (${response.status})`
    );
  }

  return await response.json();
}

/**
 * Gets user Gmail profile details
 */
export async function getGmailProfile(accessToken: string): Promise<GmailProfile> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Não foi possível obter perfil do Gmail.');
  }

  return await response.json();
}
