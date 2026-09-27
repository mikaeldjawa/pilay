import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// This is the S3-swap seam: put/get/remove are the only functions any
// caller uses, so the backend can move between local disk and R2 here
// without touching document.service.ts, report.service.ts, or either
// download route.
const STORAGE_DIR = process.env.STORAGE_DIR ?? "./storage";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const r2Config =
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME
    ? { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET_NAME }
    : null;

let s3Client: S3Client | null = null;

function getS3Client(config: NonNullable<typeof r2Config>): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return s3Client;
}

function resolveKeyPath(key: string) {
  // Dev-only fallback path (R2 takes over in production) — ignored for
  // Turbopack's file tracing so it doesn't pull the whole project into the
  // deployed function bundle.
  return path.join(/* turbopackIgnore: true */ process.cwd(), STORAGE_DIR, key);
}

async function putLocal(key: string, data: Buffer): Promise<void> {
  const filePath = resolveKeyPath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

async function getLocal(key: string): Promise<Buffer> {
  return readFile(resolveKeyPath(key));
}

async function removeLocal(key: string): Promise<void> {
  await unlink(resolveKeyPath(key)).catch(() => undefined);
}

export async function put(key: string, data: Buffer): Promise<void> {
  if (!r2Config) return putLocal(key, data);

  const client = getS3Client(r2Config);
  await client.send(new PutObjectCommand({ Bucket: r2Config.bucket, Key: key, Body: data }));
}

export async function get(key: string): Promise<Buffer> {
  if (!r2Config) return getLocal(key);

  const client = getS3Client(r2Config);
  const result = await client.send(new GetObjectCommand({ Bucket: r2Config.bucket, Key: key }));
  const bytes = await result.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

export async function remove(key: string): Promise<void> {
  if (!r2Config) return removeLocal(key);

  const client = getS3Client(r2Config);
  await client.send(new DeleteObjectCommand({ Bucket: r2Config.bucket, Key: key }));
}
