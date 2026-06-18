export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(payload: EmailPayload) {
  // TODO: integrate with SendGrid / AWS SES / Nodemailer
  console.log(`Sending email to ${payload.to}: ${payload.subject}`);
  return { success: true };
}
