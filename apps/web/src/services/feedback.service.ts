import { fetchJson } from './http';

export type FeedbackType = 'complaint' | 'rating' | 'suggestion';

export interface CreateFeedbackPayload {
  type: FeedbackType;
  message: string;
  category?: string;
  experimentId?: string;
  experimentName?: string;
  pagePath?: string;
  deviceInfo?: string;
  rating?: number;
}

export async function createFeedback(payload: CreateFeedbackPayload) {
  const res = await fetchJson<{ success: boolean; id?: number; message?: string; details?: string }>('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: payload.type,
      message: payload.message,
      category: payload.category,
      experimentId: payload.experimentId,
      experimentName: payload.experimentName,
      pagePath: payload.pagePath,
      deviceInfo: payload.deviceInfo,
      rating: payload.rating,
    }),
  });
  if (!res.success) {
    throw new Error(res.details || res.message || 'فشل إرسال البلاغ');
  }
  return res;
}
