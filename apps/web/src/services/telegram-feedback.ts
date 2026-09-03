const BOT_TOKEN = ''
const CHAT_ID = ''

export async function sendTelegramFeedback(
  type: string,
  message: string,
  experimentId?: string,
  experimentName?: string,
  rating?: number,
): Promise<{ success: boolean }> {
  const stars = rating ? '⭐'.repeat(rating) : ''
  const typeEmoji = type === 'complaint' ? '🚨' : type === 'rating' ? '⭐' : '💡'
  const typeLabel = type === 'complaint' ? 'شكوى/عطل' : type === 'rating' ? 'تقييم' : 'اقتراح'

  const text = [
    `${typeEmoji} ${typeLabel}`,
    experimentName ? `📚 التجربة: ${experimentName}` : '',
    experimentId ? `🆔 ID: ${experimentId}` : '',
    stars ? `التقييم: ${stars} (${rating}/5)` : '',
    '',
    `💬 الرسالة:`,
    message,
  ].filter(Boolean).join('\n')

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })

    if (!res.ok) {
      throw new Error(`Telegram API error: ${res.status}`)
    }

    return { success: true }
  } catch (err) {
    if (import.meta.env.DEV) console.error('Telegram feedback error:', err)
    throw err
  }
}
