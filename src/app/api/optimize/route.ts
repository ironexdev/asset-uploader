import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image") as Blob;
  const quality = Number(formData.get("quality"));
  const width = formData.get("width") ? Number(formData.get("width")) : null;
  const height = formData.get("height") ? Number(formData.get("height")) : null;

  // Ensure at least one of width or height is provided
  if (!width && !height) {
    return new NextResponse("Either width or height must be provided", {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const resizeOptions: sharp.ResizeOptions = {};
  if (width) resizeOptions.width = width;
  if (height) resizeOptions.height = height;

  const optimizedImage = await sharp(buffer)
    .resize(resizeOptions)
    .webp({ quality })
    .toBuffer();

  return new NextResponse(optimizedImage, {
    headers: { "Content-Type": "image/webp" },
  });
}
