import { NextResponse } from "next/server";
import sharp, { type Sharp, type ResizeOptions } from "sharp";

interface ProcessedFile {
  buffer: Buffer;
  contentType: string;
  originalName: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const files = formData.getAll("image") as Blob[];
  const quality = parseNumber(formData.get("quality"));
  const width = parseNumber(formData.get("width"));
  const height = parseNumber(formData.get("height"));
  const format = formData.get("format") as string | null;

  const processedFiles: ProcessedFile[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFormat = file.type;
    const originalName = (file as unknown as { name: string }).name; // Type assertion to get the file name

    // Determine if processing is necessary
    const shouldProcessImage =
      !width &&
      !height &&
      !quality &&
      (format === "preserve" ||
        format === getFormatFromMimeType(originalFormat));

    if (shouldProcessImage) {
      processedFiles.push({
        buffer,
        contentType: originalFormat,
        originalName,
      });
      continue;
    }

    let optimizedImage = sharp(buffer);

    // Apply resizing if needed
    if (width || height) {
      const resizeOptions: ResizeOptions = { width, height };
      optimizedImage = optimizedImage.resize(resizeOptions);
    }

    // Apply format and quality adjustments
    optimizedImage = applyFormatAndQuality(
      optimizedImage,
      format,
      quality,
      originalFormat,
    );

    const finalBuffer = await optimizedImage.toBuffer();
    const contentType = determineContentType(format, originalFormat);
    const finalName =
      format === "preserve" || format === getFormatFromMimeType(originalFormat)
        ? originalName
        : originalName.replace(/\.[^/.]+$/, `.${contentType.split("/")[1]}`);

    processedFiles.push({
      buffer: finalBuffer,
      contentType,
      originalName: finalName,
    });
  }

  return NextResponse.json(
    processedFiles.map((file) => ({
      buffer: file.buffer.toString("base64"), // Convert buffer to base64 for transmission
      contentType: file.contentType,
      originalName: file.originalName,
    })),
  );
}

function parseNumber(value: FormDataEntryValue | null): number | undefined {
  return value ? Number(value) : undefined;
}

function applyFormatAndQuality(
  image: Sharp,
  format: string | null,
  quality: number | undefined,
  originalFormat: string,
): Sharp {
  if (
    format === "preserve" ||
    format === getFormatFromMimeType(originalFormat)
  ) {
    switch (originalFormat) {
      case "image/webp":
        return image.webp({ quality });
      case "image/jpeg":
        return image.jpeg({ quality });
      case "image/png":
        return image.png({ quality });
      default:
        return image;
    }
  }

  switch (format) {
    case "webp":
      return image.webp({ quality });
    case "jpg":
      return image.jpeg({ quality });
    case "png":
      return image.png({ quality });
    default:
      return image;
  }
}

function determineContentType(
  format: string | null,
  originalType: string,
): string {
  if (format === "preserve") {
    return originalType;
  }

  switch (format) {
    case "webp":
      return "image/webp";
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return originalType;
  }
}

function getFormatFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "unknown";
  }
}
