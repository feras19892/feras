-- User language preference
ALTER TABLE users ADD COLUMN lang TEXT DEFAULT 'ar';

-- Notification templates (i18n)
CREATE TABLE IF NOT EXISTS notification_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'all',
  event TEXT NOT NULL,
  days_before INTEGER DEFAULT 0,
  hour INTEGER DEFAULT 9,
  minute INTEGER DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  ar_title TEXT NOT NULL,
  ar_body TEXT NOT NULL,
  en_title TEXT NOT NULL,
  en_body TEXT NOT NULL,
  es_title TEXT NOT NULL,
  es_body TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tracks which notifications were already sent to avoid duplicates
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,
  event_date TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, template_key, event_date)
);

CREATE INDEX IF NOT EXISTS idx_scheduled_user ON scheduled_notifications(user_id, template_key, event_date);

-- Default templates
INSERT OR IGNORE INTO notification_templates (key, role, event, days_before, hour, minute, ar_title, ar_body, en_title, en_body, es_title, es_body) VALUES
  ('trial_ends_3', 'all', 'trial_ends', 3, 9, 0,
   'تنتهي تجربتك بعد 3 أيام', 'مرحباً {{name}}، تنتهي فترتك التجريبية بعد 3 أيام. اشترك الآن للحفاظ على الوصول.', 'Your trial ends in 3 days', 'Hi {{name}}, your trial ends in 3 days. Subscribe now to keep access.', 'Tu prueba termina en 3 días', 'Hola {{name}}, tu periodo de prueba termina en 3 días. Suscríbete ahora para mantener el acceso.'),
  ('trial_ends_2', 'all', 'trial_ends', 2, 9, 0,
   'تنتهي تجربتك بعد يومين', 'مرحباً {{name}}، تبقى يومان على انتهاء فترتك التجريبية. لا تفوّت الفرصة.', 'Your trial ends in 2 days', 'Hi {{name}}, only 2 days left in your trial.', 'Tu prueba termina en 2 días', 'Hola {{name}}, quedan 2 días en tu prueba.'),
  ('trial_ends_1', 'all', 'trial_ends', 1, 9, 0,
   'تنتهي تجربتك غداً', 'مرحباً {{name}}، تنتهي فترتك التجريبية غداً. اشترك لتجنب قطع الخدمة.', 'Your trial ends tomorrow', 'Hi {{name}}, your trial ends tomorrow. Subscribe to avoid interruption.', 'Tu prueba termina mañana', 'Hola {{name}}, tu prueba termina mañana. Suscríbete para evitar interrupciones.'),
  ('yearly_renewal_7', 'all', 'yearly_renewal', 7, 9, 0,
   'تجديد قادم خلال 7 أيام', 'مرحباً {{name}}، سيتم تجديد اشتراكك السنوي تلقائياً في {{date}}. يمكنك الإلغاء قبل ذلك.', 'Yearly renewal in 7 days', 'Hi {{name}}, your yearly subscription will renew on {{date}}. You may cancel before then.', 'Renovación anual en 7 días', 'Hola {{name}}, tu suscripción anual se renovará el {{date}}. Puedes cancelar antes.'),
  ('yearly_renewal_due', 'all', 'yearly_renewal', 0, 9, 0,
   'سيتم خصم المبلغ اليوم', 'مرحباً {{name}}، سيتم خصم مبلغ الاشتراك اليوم الساعة {{time}} ({{date}}).', 'Payment due today', 'Hi {{name}}, your subscription payment will be charged today at {{time}} ({{date}}).', 'Pago hoy', 'Hola {{name}}, el pago de tu suscripción se cargará hoy a las {{time}} ({{date}}).');
