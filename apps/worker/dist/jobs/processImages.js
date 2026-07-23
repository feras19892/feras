export async function processImages(payload) {
    // TODO: integrate with Sharp / ImageMagick
    console.log(`Processing image: ${payload.imageUrl}`);
    return { success: true, url: payload.imageUrl };
}
