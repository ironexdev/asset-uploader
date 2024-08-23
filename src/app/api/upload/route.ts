import { type NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

interface Info {
  title: string;
  format: string;
  bucket: string;
  folder: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const uploadResults: Array<{ imageName: string; imageUrl: string }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("info")) {
        const index = key.replace("info", "");

        const info = JSON.parse(value as string) as Info;
        const image = formData.get(`image${index}`) as File;

        const uploadResult = await uploadImageToS3(image, info);

        uploadResults.push(uploadResult);
      }
    }

    if (!uploadResults.length) {
      return NextResponse.json(
        { error: "No images provided!" },
        { status: 400 },
      );
    }

    return NextResponse.json({ uploadedFiles: uploadResults }, { status: 201 });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 },
    );
  }
}

async function uploadImageToS3(
  imageFile: File,
  info: Info,
): Promise<{ imageName: string; imageUrl: string }> {
  let bucketName;
  let key;

  // NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME is optional
  if (
    !process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME ||
    info.bucket === "server"
  ) {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
    key = `assets/${info.folder}/${info.title}`.replace(/\/\//g, "/");
  } else {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME;
    key = `images/assets/${info.folder}/${info.title}`.replace(/\/\//g, "/");
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(await imageFile.arrayBuffer()),
    ContentType: `image/${info.format}`,
    CacheControl: "max-age=31536000",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const imageUrl = `https://${process.env.AWS_CLOUDFRONT_DISTRIBUTION}.cloudfront.net/${key}`;

  return {
    imageName: key,
    imageUrl,
  };
}
