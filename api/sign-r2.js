// api/sign-r2.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(request, response) {
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file');
  const isDownload = url.searchParams.get('download') === 'true'; // Check the flag
  
  // Pass both to your function
  const signedUrl = await getProtectedUrl(fileName, isDownload);
  
  return Response.json({ url: signedUrl });

  // if (!file) {
  //   return response.status(400).json({ error: "Missing file parameter" });
  // }

  // const s3 = new S3Client({
  //   region: "auto",
  //   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  //   credentials: {
  //     accessKeyId: process.env.R2_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  //   },
  // });

  // try {
  //   const command = new GetObjectCommand({
  //     Bucket: process.env.R2_BUCKET_NAME,
  //     Key: `${file}.pdf`,
  //   });

  //   // Generate a 60-second signed URL
  //   const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    
  //   return response.status(200).json({ url });
  // } catch (error) {
  //   console.error("R2 Signing Error:", error);
  //   return response.status(500).json({ error: "Failed to sign URL" });
  // }
}
