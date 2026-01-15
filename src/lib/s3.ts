import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_CONFIG = {
  region: process.env.AWS_REGION || "ap-northeast-2",
  bucket: process.env.AWS_S3_BUCKET || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
} as const;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  cacheControl?: string;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

type ValidationResult = { valid: true } | { valid: false; error: string };

let s3Client: S3Client | null = null;

/** S3 클라이언트 싱글톤 반환 */
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: S3_CONFIG.region,
      credentials: S3_CONFIG.credentials,
    });
  }
  return s3Client;
}

/** 고유한 파일명 생성 */
function generateUniqueFileName(originalName: string): string {
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${extension}`;
}

/** S3 오브젝트 키 생성 */
function generateObjectKey(fileName: string, folder?: string): string {
  const sanitizedFolder = folder?.replace(/^\/|\/$/g, "");
  return sanitizedFolder ? `${sanitizedFolder}/${fileName}` : fileName;
}

/** S3 퍼블릭 URL 생성 */
function getS3Url(key: string): string {
  return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
}

/** 파일의 Content-Type 감지 */
function detectContentType(file: File | Blob): string {
  return file.type || "application/octet-stream";
}

/** 이미지 파일 유효성 검증 */
export function validateImageFile(file: File | Blob): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`,
    };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: `허용되지 않는 파일 형식입니다. (허용: ${ALLOWED_IMAGE_TYPES.join(", ")})`,
    };
  }

  return { valid: true };
}

/** S3 설정 유효성 검증 */
export function validateS3Config(): ValidationResult {
  if (!S3_CONFIG.bucket) {
    return { valid: false, error: "AWS_S3_BUCKET이 설정되지 않았습니다." };
  }
  if (!S3_CONFIG.credentials.accessKeyId) {
    return { valid: false, error: "AWS_ACCESS_KEY_ID가 설정되지 않았습니다." };
  }
  if (!S3_CONFIG.credentials.secretAccessKey) {
    return {
      valid: false,
      error: "AWS_SECRET_ACCESS_KEY가 설정되지 않았습니다.",
    };
  }
  return { valid: true };
}

/** S3에 파일 업로드 */
export async function uploadToS3(
  file: File | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const configValidation = validateS3Config();
  if (!configValidation.valid) {
    throw new Error(configValidation.error);
  }

  const fileValidation = validateImageFile(file);
  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  const originalName = file instanceof File ? file.name : "image.jpg";
  const fileName = options.fileName || generateUniqueFileName(originalName);
  const key = generateObjectKey(fileName, options.folder);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
    Body: buffer,
    ContentType: options.contentType || detectContentType(file),
    CacheControl: options.cacheControl || "max-age=31536000",
  });

  await client.send(command);

  return { url: getS3Url(key), key, size: file.size };
}

/** S3에서 파일 삭제 */
export async function deleteFromS3(keyOrUrl: string): Promise<void> {
  const configValidation = validateS3Config();
  if (!configValidation.valid) {
    throw new Error(configValidation.error);
  }

  const key = keyOrUrl.includes("://")
    ? keyOrUrl.split(".amazonaws.com/")[1]
    : keyOrUrl;

  if (!key) {
    throw new Error("유효하지 않은 S3 키 또는 URL입니다.");
  }

  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
  });

  await client.send(command);
}

/** 업로드용 Presigned URL 생성 */
export async function getPresignedUploadUrl(
  folder: string,
  originalFileName: string,
  expiresIn = 300
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const configValidation = validateS3Config();
  if (!configValidation.valid) {
    throw new Error(configValidation.error);
  }

  const fileName = generateUniqueFileName(originalFileName);
  const key = generateObjectKey(fileName, folder);

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  return { uploadUrl, key, publicUrl: getS3Url(key) };
}

/** 다운로드용 Presigned URL 생성 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const configValidation = validateS3Config();
  if (!configValidation.valid) {
    throw new Error(configValidation.error);
  }

  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
}

/** S3 URL에서 키 추출 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url.includes("amazonaws.com")) return null;
  const parts = url.split(".amazonaws.com/");
  return parts[1] || null;
}

/** 파일 확장자 추출 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/** 이미지 파일 여부 확인 */
export function isImageFile(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension);
}
