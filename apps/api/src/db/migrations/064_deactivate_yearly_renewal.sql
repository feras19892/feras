-- Deactivate old yearly-renewal-only templates to avoid duplicate payment reminders
UPDATE notification_templates SET is_active = 0 WHERE event = 'yearly_renewal';

-- Cancel any existing pending yearly-renewal queue items
UPDATE subscription_notification_queue SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE event = 'yearly_renewal' AND status = 'pending';
