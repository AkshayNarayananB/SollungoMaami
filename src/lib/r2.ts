import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function getProtectedUrl(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: "your-bucket-name",
    Key: `${fileKey}.pdf`,
  });

  // This link expires in 60 seconds
  return await getSignedUrl(s3, command, { expiresIn: 60 });
}
