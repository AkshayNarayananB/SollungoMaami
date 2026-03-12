import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// Add a second parameter to check if the user wants to download
export async function getProtectedUrl(fileKey: string, isDownload = false) {
  const params: any = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey.endsWith('.pdf') ? fileKey : `${fileKey}.pdf`, // Safety check
  };

  // If this link is for the download button, force the browser attachment header
  if (isDownload) {
    params.ResponseContentDisposition = `attachment; filename="${fileKey}"`;
  }

  const command = new GetObjectCommand(params);

  // Link expires in 60 seconds. High security!
  return await getSignedUrl(s3, command, { expiresIn: 60 });
}
