import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const GET = async ({ request }) => {
  try {
    const accountId = process.env.R2_ACCOUNT_ID || import.meta.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || import.meta.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || import.meta.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || import.meta.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Missing one or more R2 environment variables in Vercel.");
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // THE FIX: Added a fallback base URL so Vercel's relative paths don't crash Node.js
    const url = new URL(request.url, "http://localhost");
    
    const fileName = url.searchParams.get('file');
    const isDownload = url.searchParams.get('download') === 'true';

    if (!fileName) {
      return new Response(JSON.stringify({ error: "Missing file parameter" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const cleanKey = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    const params: any = {
      Bucket: bucketName,
      Key: cleanKey,
    };

    if (isDownload) {
      params.ResponseContentDisposition = `attachment; filename="${cleanKey}"`;
    }

    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return new Response(JSON.stringify({ url: signedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("API Route R2 Error:", error.message || error); 
    return new Response(JSON.stringify({ error: error.message || "Failed to generate secure URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
