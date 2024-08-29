import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION, // Ensure this is set in your environment variables
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  // NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME is optional
  const type = !process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME
    ? "server"
    : (url.searchParams.get("type") ?? "server");

  let bucketName;
  let prefix;

  if (type === "server") {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
    prefix = "assets/";
  } else {
    bucketName = process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME;
    prefix = "images/assets/";
  }

  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));
    const objects = data.Contents
      ? data.Contents.map((item) => {
          const sizeInKB =
            item.Size !== undefined
              ? (item.Size / 1024).toFixed(2)
              : "Unknown size";
          const lastModified = item.LastModified
            ? new Date(item.LastModified).toLocaleString("cs-CZ", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Unknown date";

          return {
            url:
              type === "server"
                ? `https://${process.env.AWS_CLOUDFRONT_DISTRIBUTION}/${item.Key}`
                : "",
            key: item.Key,
            sizeInKB,
            lastModified,
          };
        })
      : [];

    return NextResponse.json({
      message: "S3 objects retrieved successfully!",
      objects,
    });
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    return NextResponse.json(
      { message: "Failed to retrieve S3 objects." },
      { status: 500 },
    );
  }
}
