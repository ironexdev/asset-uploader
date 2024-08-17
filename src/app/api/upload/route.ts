import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image") as Blob;
  const imageName = formData.get("imageName") as string;

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: `assets/images/${imageName}`,
    Body: buffer,
    ContentType: "image/webp",
    CacheControl: "max-age=31536000",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const imageUrl = `https://${process.env.AWS_CLOUDFRONT_DISTRIBUTION}.cloudfront.net/assets/images/${imageName}`;

  return NextResponse.json({
    imageName: `assets/images/${imageName}`,
    imageUrl,
  });
}
