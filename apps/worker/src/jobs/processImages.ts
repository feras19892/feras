export interface ImagePayload {
  imageUrl: string;
  targetSize: { width: number; height: number };
}

export async function processImages(payload: ImagePayload) {
  // TODO: integrate with Sharp / ImageMagick
  console.log(`Processing image: ${payload.imageUrl}`);
  return { success: true, url: payload.imageUrl };
}
