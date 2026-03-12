import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const GET = async ({ request }) => {
  try {
    const url = new URL(request.url);
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
      Bucket: import.meta.env.R2_BUCKET_NAME,
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

  } catch (error) {
    console.error("API Route R2 Error:", error); 
    return new Response(JSON.stringify({ error: "Failed to generate secure URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
