import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cliente Cloudflare R2
 * Compatível com S3 API
 */

// Configuração do cliente R2
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Endpoint do R2 (formato: https://<account_id>.r2.cloudflarestorage.com)
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Cliente S3 configurado para R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Faz upload de um arquivo para o R2
 */
export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder?: string
): Promise<string> {
  const key = folder ? `${folder}/${fileName}` : fileName;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return key;
}

/**
 * Obtém uma URL assinada para download (válida por 1 hora)
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return url;
}

/**
 * Obtém uma URL assinada para upload (válida por 15 minutos)
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 900 });
  return url;
}

/**
 * Deleta um arquivo do R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Lista arquivos em uma pasta
 */
export async function listFilesInR2(
  folder?: string
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    Prefix: folder,
  });

  const response = await r2Client.send(command);

  return (
    response.Contents?.map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    })) || []
  );
}

/**
 * Obtém a URL pública de um arquivo (se o bucket for público)
 * Para produção, recomenda-se usar um domínio personalizado
 */
export function getPublicUrl(key: string): string {
  // Se você tiver um domínio personalizado configurado no R2:
  // return `https://seu-dominio.com/${key}`;

  // Caso contrário, use a URL padrão do R2 (se o bucket for público):
  return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}
