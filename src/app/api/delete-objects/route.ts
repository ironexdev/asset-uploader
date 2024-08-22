import { S3Client, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(request: Request) {
  try {
    type DeleteRequestBody = {
      keys: string[];
    };

    const { keys }: DeleteRequestBody =
      (await request.json()) as DeleteRequestBody;

    if (!keys || keys.length === 0) {
      return new NextResponse("No keys provided", { status: 400 });
    }

    const deleteParams = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    const data = await s3Client.send(deleteCommand);

    if (data.Errors && data.Errors.length > 0) {
      return new NextResponse(
        `Failed to delete some objects: ${data.Errors.map(
          (error) => `${error.Key}: ${error.Message}`,
        ).join(", ")}`,
        { status: 500 },
      );
    }

    return new NextResponse("Objects deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting objects:", error);
    return new NextResponse("An error occurred while deleting objects", {
      status: 500,
    });
  }
}
