import { readFile } from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

function getClient(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

  if (!accessKey || !secretKey || !endpoint) return null;

  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }
  return s3Client;
}

export function isCloudBackupEnabled(): boolean {
  return getClient() !== null;
}

export async function uploadToCloud(backupPath: string, backupName: string): Promise<boolean> {
  const client = getClient();
  const bucket = process.env.R2_BUCKET || 'db-backups';
  if (!client) return false;

  try {
    const fileBuffer = await readFile(backupPath);
    const key = `backups/${backupName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/octet-stream',
      })
    );

    console.log(`[cloud-backup] Uploaded ${backupName} to ${bucket}/${key}`);
    return true;
  } catch (err) {
    console.error('[cloud-backup] Upload failed:', err);
    return false;
  }
}
