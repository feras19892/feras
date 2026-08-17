const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@resend.dev';
const APP_NAME = process.env.APP_NAME || 'منصة العلوم';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email] No RESEND_API_KEY — would send to ${to}: ${subject}`);
    }
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[email] Resend API error ${res.status}: ${errText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] sendEmail error:', err);
    return false;
  }
}

export async function sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
  const html = `
    <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
      <h2 style="color: #6366f1;">${APP_NAME}</h2>
      <p>مرحباً ${name}،</p>
      <p>رمز تأكيد بريدك الإلكتروني هو:</p>
      <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem; text-align: center; background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 0.85rem;">الرمز صالح لمدة 15 دقيقة. إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
    </div>
  `;
  return sendEmail(email, `رمز تأكيد البريد - ${APP_NAME}`, html);
}

export async function sendPasswordResetEmail(email: string, name: string, code: string): Promise<boolean> {
  const html = `
    <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
      <h2 style="color: #6366f1;">${APP_NAME}</h2>
      <p>مرحباً ${name}،</p>
      <p>تلقينا طلباً لإعادة تعيين كلمة مرورك. رمز إعادة التعيين هو:</p>
      <div style="font-size: 2rem; font-weight: bold; letter-spacing: 0.5rem; text-align: center; background: #f1f5f9; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
        ${code}
      </div>
      <p style="color: #64748b; font-size: 0.85rem;">الرمز صالح لمدة 15 دقيقة. إذا لم تطلب إعادة التعيين، تجاهل هذه الرسالة.</p>
    </div>
  `;
  return sendEmail(email, `إعادة تعيين كلمة المرور - ${APP_NAME}`, html);
}
