export async function sendEmail(payload) {
    // TODO: integrate with SendGrid / AWS SES / Nodemailer
    console.log(`Sending email to ${payload.to}: ${payload.subject}`);
    return { success: true };
}
