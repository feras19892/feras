-- Additional subscription notification templates (i18n)
INSERT OR IGNORE INTO notification_templates (key, role, event, days_before, hour, minute, is_active, channel, ar_title, ar_body, en_title, en_body, es_title, es_body) VALUES
  ('trial_started', 'all', 'trial_started', 0, 0, 0, 1, 'in_app',
   'بدأت فترتك التجريبية', 'مرحباً {{name}}، بدأت فترتك التجريبية وتنتهي في {{date}}. استمتع بالوصول الكامل.',
   'Your trial has started', 'Hi {{name}}, your trial has started and ends on {{date}}. Enjoy full access.',
   'Tu prueba ha comenzado', 'Hola {{name}}, tu prueba ha comenzado y termina el {{date}}. Disfruta del acceso completo.'),

  ('trial_ended', 'all', 'trial_ended', 0, 0, 0, 1, 'in_app',
   'انتهت فترتك التجريبية', 'مرحباً {{name}}، انتهت فترتك التجريبية. يمكنك الاشتراك من قسم الاشتراكات للاستمرار.',
   'Your trial has ended', 'Hi {{name}}, your trial has ended. You can subscribe from the subscriptions section to continue.',
   'Tu prueba ha terminado', 'Hola {{name}}, tu prueba ha terminado. Puedes suscribirte en la sección de suscripciones para continuar.'),

  ('subscription_expired', 'all', 'subscription_expired', 0, 0, 0, 1, 'in_app',
   'انتهى اشتراكك', 'مرحباً {{name}}، انتهى اشتراكك في {{date}}. يمكنك إعادة الاشتراك للحفاظ على الوصول.',
   'Your subscription has expired', 'Hi {{name}}, your subscription expired on {{date}}. Resubscribe to keep access.',
   'Tu suscripción ha expirado', 'Hola {{name}}, tu suscripción expiró el {{date}}. Vuelve a suscribirte para mantener el acceso.'),

  ('subscription_cancelled', 'all', 'subscription_cancelled', 0, 0, 0, 1, 'in_app',
   'تم إلغاء اشتراكك', 'مرحباً {{name}}، تم إلغاء اشتراكك. ستستمر الخدمة حتى {{date}}.',
   'Your subscription has been cancelled', 'Hi {{name}}, your subscription has been cancelled. Service will continue until {{date}}.',
   'Tu suscripción ha sido cancelada', 'Hola {{name}}, tu suscripción ha sido cancelada. El servicio continuará hasta el {{date}}.'),

  ('subscription_renewed', 'all', 'subscription_renewed', 0, 0, 0, 1, 'in_app',
   'تم تجديد اشتراكك', 'مرحباً {{name}}، تم تجديد اشتراكك بنجاح. موعد الدفع القادم {{date}}.',
   'Your subscription has been renewed', 'Hi {{name}}, your subscription has been renewed successfully. Your next payment is on {{date}}.',
   'Tu suscripción ha sido renovada', 'Hola {{name}}, tu suscripción se ha renovado correctamente. El próximo pago es el {{date}}.'),

  ('payment_failed', 'all', 'payment_failed', 0, 0, 0, 1, 'in_app',
   'فشل دفع الاشتراك', 'مرحباً {{name}}، فشل دفع اشتراكك. يرجى تحديث طريقة الدفع لتجنب انقطاع الخدمة.',
   'Subscription payment failed', 'Hi {{name}}, your subscription payment failed. Please update your payment method to avoid service interruption.',
   'Pago de suscripción fallido', 'Hola {{name}}, el pago de tu suscripción falló. Actualiza tu método de pago para evitar interrupciones.'),

  ('payment_due_7', 'all', 'payment_due', 7, 9, 0, 1, 'in_app',
   'موعد دفع قادم خلال 7 أيام', 'مرحباً {{name}}، موعد دفع اشتراكك القادم خلال 7 أيام ({{date}}).',
   'Payment due in 7 days', 'Hi {{name}}, your next subscription payment is in 7 days ({{date}}).',
   'Pago en 7 días', 'Hola {{name}}, tu próximo pago es en 7 días ({{date}}).'),

  ('payment_due_3', 'all', 'payment_due', 3, 9, 0, 1, 'in_app',
   'موعد دفع قادم خلال 3 أيام', 'مرحباً {{name}}، موعد دفع اشتراكك القادم خلال 3 أيام ({{date}}).',
   'Payment due in 3 days', 'Hi {{name}}, your next subscription payment is in 3 days ({{date}}).',
   'Pago en 3 días', 'Hola {{name}}, tu próximo pago es en 3 días ({{date}}).'),

  ('payment_due_2', 'all', 'payment_due', 2, 9, 0, 1, 'in_app',
   'موعد دفع قادم خلال يومين', 'مرحباً {{name}}، موعد دفع اشتراكك القادم خلال يومين ({{date}}).',
   'Payment due in 2 days', 'Hi {{name}}, your next subscription payment is in 2 days ({{date}}).',
   'Pago en 2 días', 'Hola {{name}}, tu próximo pago es en 2 días ({{date}}).'),

  ('payment_due_1', 'all', 'payment_due', 1, 9, 0, 1, 'in_app',
   'موعد دفع غداً', 'مرحباً {{name}}، موعد دفع اشتراكك غداً ({{date}}).',
   'Payment due tomorrow', 'Hi {{name}}, your subscription payment is due tomorrow ({{date}}).',
   'Pago mañana', 'Hola {{name}}, tu pago es mañana ({{date}}).'),

  ('payment_due_today', 'all', 'payment_due', 0, 9, 0, 1, 'in_app',
   'موعد الدفع اليوم', 'مرحباً {{name}}، موعد دفع اشتراكك اليوم الساعة {{time}} ({{date}}).',
   'Payment due today', 'Hi {{name}}, your subscription payment is due today at {{time}} ({{date}}).',
   'Pago hoy', 'Hola {{name}}, tu pago vence hoy a las {{time}} ({{date}}).');

-- Deactivate old yearly-renewal-only templates to avoid duplicate payment reminders
UPDATE notification_templates SET is_active = 0 WHERE event = 'yearly_renewal';
