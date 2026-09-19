import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const client = new S3Client({ region: process.env.STORAGE_REGION });
const bucket = process.env.STORAGE_BUCKET;

export async function createUploadUrl(folder, contentType) {
  const key = `${folder}/${nanoid()}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
  const fileUrl = `https://${bucket}.s3.${process.env.STORAGE_REGION}.amazonaws.com/${key}`;
  return { uploadUrl, fileUrl, key, expiresInSeconds: UPLOAD_URL_TTL_SECONDS };
}
