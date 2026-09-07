import { toPng } from 'html-to-image';

/**
 * يلتقط صورة لعنصر HTML/SVG/Canvas كـ data URL.
 * يستخدم html-to-image للعناصر العامة، و toDataURL للـ Canvas.
 */
export async function captureElement(target: HTMLElement | null): Promise<string | null> {
  if (!target) return null;

  if (target instanceof HTMLCanvasElement) {
    return target.toDataURL('image/png');
  }

  const canvas = target.querySelector('canvas');
  if (canvas) {
    return canvas.toDataURL('image/png');
  }

  try {
    const dataUrl = await toPng(target, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0f172a' });
    return dataUrl;
  } catch (err) {
    console.error('[captureElement] failed:', err);
    return null;
  }
}
