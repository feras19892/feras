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

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'تقني', academic: 'أكاديمي', behavioral: 'سلوكي', other: 'أخرى',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفضة', normal: 'عادية', high: 'عالية', urgent: 'عاجلة',
};

export async function sendTelegramMessage(text: string, parseMode?: 'HTML' | 'Markdown'): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — would send:', text.slice(0, 120));
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, ...(parseMode ? { parse_mode: parseMode } : {}) }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[telegram] sendMessage error ${res.status}:`, errText);
    } else {
      console.log(`[telegram] sent to chat ${TELEGRAM_CHAT_ID}:`, text.slice(0, 80));
    }
  } catch (err) {
    console.error('[telegram] sendMessage exception:', err);
  }
}

export async function sendComplaintAlert(data: {
  id: number; fromName: string; fromRole: string;
  category: string; subject: string; body: string; priority: string;
}): Promise<void> {
  const cat = CATEGORY_LABELS[data.category] || data.category;
  const pri = PRIORITY_LABELS[data.priority] || data.priority;
  const roleLabel = data.fromRole === 'student' ? 'طالب' : data.fromRole === 'teacher' ? 'مدرس' : data.fromRole;

  // Telegram
  const text = [
    `🚨 شكوى جديدة #${data.id}`,
    `👤 من: ${data.fromName} (${roleLabel})`,
    `📋 التصنيف: ${cat}`,
    `⚡ الأولوية: ${pri}`,
    `📝 الموضوع: ${data.subject}`,
    '',
    `💬 النص:`,
    data.body,
  ].join('\n');

  await sendTelegramMessage(text, 'HTML');

  if (!ADMIN_EMAIL) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[email] ADMIN_EMAIL not set — would send complaint alert to admin');
    }
    return;
  }

  // Email
  const html = `
    <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
      <h2 style="color: #dc2626;">🚨 شكوى جديدة #${data.id}</h2>
      <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
        <tr><td style="padding:6px; color:#64748b;">المُرسِل</td><td style="padding:6px; font-weight:600;">${data.fromName} (${roleLabel})</td></tr>
        <tr><td style="padding:6px; color:#64748b;">التصنيف</td><td style="padding:6px;">${cat}</td></tr>
        <tr><td style="padding:6px; color:#64748b;">الأولوية</td><td style="padding:6px; color:${data.priority === 'urgent' ? '#dc2626' : '#f59e0b'}; font-weight:700;">${pri}</td></tr>
        <tr><td style="padding:6px; color:#64748b;">الموضوع</td><td style="padding:6px; font-weight:600;">${data.subject}</td></tr>
      </table>
      <div style="background:#f8fafc; padding:1rem; border-radius:0.5rem; border:1px solid #e2e8f0;">
        <p style="margin:0; white-space:pre-wrap;">${data.body}</p>
      </div>
      <p style="color:#94a3b8; font-size:0.8rem; margin-top:1rem;">${APP_NAME} — نظام الشكاوى</p>
    </div>
  `;
  sendEmail(ADMIN_EMAIL, `🚨 شكوى جديدة #${data.id}: ${data.subject}`, html).catch((err) => {
    console.error('[email] sendComplaintAlert failed:', err);
  });
}

export async function sendComplaintToTarget(data: {
  id: number;
  fromName: string;
  fromRole: string;
  targetName: string;
  targetEmail: string;
  category: string;
  subject: string;
  body: string;
  priority: string;
}): Promise<void> {
  const cat = CATEGORY_LABELS[data.category] || data.category;
  const pri = PRIORITY_LABELS[data.priority] || data.priority;
  const roleLabel = data.fromRole === 'student' ? 'طالب' : data.fromRole === 'teacher' ? 'مدرس' : data.fromRole;

  const html = `
    <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 2rem;">
      <h2 style="color: #6366f1;">📝 شكوى واردة</h2>
      <p>مرحباً ${data.targetName}،</p>
      <p>وصلتك شكوى جديدة عبر منصة العلوم:</p>
      <table style="width:100%; border-collapse:collapse; margin:1rem 0;">
        <tr><td style="padding:6px; color:#64748b;">المُرسِل</td><td style="padding:6px; font-weight:600;">${data.fromName} (${roleLabel})</td></tr>
        <tr><td style="padding:6px; color:#64748b;">التصنيف</td><td style="padding:6px;">${cat}</td></tr>
        <tr><td style="padding:6px; color:#64748b;">الأولوية</td><td style="padding:6px; color:${data.priority === 'urgent' ? '#dc2626' : '#f59e0b'}; font-weight:700;">${pri}</td></tr>
        <tr><td style="padding:6px; color:#64748b;">الموضوع</td><td style="padding:6px; font-weight:600;">${data.subject}</td></tr>
      </table>
      <div style="background:#f8fafc; padding:1rem; border-radius:0.5rem; border:1px solid #e2e8f0;">
        <p style="margin:0; white-space:pre-wrap;">${data.body}</p>
      </div>
      <p style="color:#94a3b8; font-size:0.8rem; margin-top:1rem;">لمراجعة الشكوى، سجل دخولك إلى ${APP_URL}</p>
    </div>
  `;
  sendEmail(data.targetEmail, `📝 شكوى واردة: ${data.subject}`, html).catch((err) => {
    console.error('[email] sendComplaintToTarget failed:', err);
  });
}
