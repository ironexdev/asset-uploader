import { type NextRequest, NextResponse } from "next/server";
import { s3Client } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

interface ImageUploadInfo {
  title: string;
  format: string;
  previewUrl: string;
  bucket: string;
  folder: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const uploadResults: Array<{ imageName: string; imageUrl: string }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("processedImage")) {
        const imageUploadInfo = JSON.parse(value as string) as ImageUploadInfo;
        const uploadResult = await uploadImageToS3(imageUploadInfo);

        uploadResults.push(uploadResult);
      }
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
  imageUploadInfo: ImageUploadInfo,
): Promise<{ imageName: string; imageUrl: string }> {
  const imageFile = base64ToFile(
    imageUploadInfo.previewUrl,
    imageUploadInfo.title,
  );

  let bucketName;
  let key;

  if (imageUploadInfo.bucket === "server") {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
    key = `assets/${imageUploadInfo.folder}/${imageUploadInfo.title}`.replace(
      /\/\//g,
      "/",
    );
  } else {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME;
    key =
      `images/assets/${imageUploadInfo.folder}/${imageUploadInfo.title}`.replace(
        /\/\//g,
        "/",
      );
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(await imageFile.arrayBuffer()),
    ContentType: `image/${imageUploadInfo.format}`,
    CacheControl: "max-age=31536000",
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  const imageUrl = `https://${process.env.AWS_CLOUDFRONT_DISTRIBUTION}.cloudfront.net/${key}`;

  return {
    imageName: key,
    imageUrl,
  };
}

function base64ToFile(base64String: string, fileName: string): File {
  const [mimePart, dataPart] = base64String.split(",");

  if (!mimePart || !dataPart) {
    throw new Error("Invalid base64 string");
  }

  const mimeTypeMatch = /:(.*?);/.exec(mimePart);

  if (!mimeTypeMatch?.[1]) {
    throw new Error("Invalid MIME type");
  }

  const mimeType = mimeTypeMatch[1];

  const byteCharacters = atob(dataPart);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return new File([blob], fileName, { type: mimeType });
}
