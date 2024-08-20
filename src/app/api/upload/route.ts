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
  const files = formData.getAll("image") as Blob[];
  const imageNames = formData.getAll("imageName") as string[];
  const folder = formData.get("folder") as string;

  if (!files.length || !imageNames.length || !folder) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const uploadedFiles: { imageName: string; imageUrl: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageName = imageNames[i];

    if (!file || !imageName) {
      continue; // Skip if either file or imageName is undefined
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `assets/${folder}/${imageName}`,
      Body: buffer,
      ContentType: file.type,
      CacheControl: "max-age=31536000",
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${process.env.AWS_CLOUDFRONT_DISTRIBUTION}.cloudfront.net/assets/${folder}/${imageName}`;

    uploadedFiles.push({ imageName: `${folder}/${imageName}`, imageUrl });
  }

  return NextResponse.json(uploadedFiles);
}
