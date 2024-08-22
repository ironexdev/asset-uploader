import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

interface ImageInfo {
  title: string;
  width: number | null;
  height: number | null;
  quality: number;
  format: string;
  raw: boolean;
}

interface ProcessedImage {
  title: string;
  previewUrl: string;
  sizeKb: number;
  format: string;
  height: number;
  width: number;
  aspectRatio: number;
  raw: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const processedImages: ProcessedImage[] = [];

    // Iterate through formData entries
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image")) {
        const index = key.replace("image", "");
        const imageFile = value as File;
        const imageInfo: ImageInfo = parseWithReviver(
          formData.get(`modification${index}`) as string,
        ) as ImageInfo;

        const processedImage = await processImage(imageFile, imageInfo);
        processedImages.push(processedImage);
      }
    }

    return NextResponse.json(processedImages);
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 },
    );
  }
}

async function processImage(
  imageFile: File,
  imageInfo: ImageInfo,
): Promise<ProcessedImage> {
  const fileBuffer = await imageFile.arrayBuffer();
  const image = sharp(Buffer.from(fileBuffer), { animated: false });

  const metadata = await image.metadata();
  const raw = imageInfo.raw;
  const outputTitle = imageInfo.title;
  let outputWidth;
  let outputHeight;
  let outputFormat;
  let quality;

  if (raw) {
    outputHeight = metadata.height;
    outputWidth = metadata.width;
    outputFormat = metadata.format;
    quality = 100;
  } else {
    if (!imageInfo.height && !imageInfo.width) {
      outputHeight = metadata.height;
      outputWidth = metadata.width;
    } else {
      outputHeight =
        imageInfo.height && imageInfo.height > 0 ? imageInfo.height : undefined;
      outputWidth =
        imageInfo.width && imageInfo.width > 0 ? imageInfo.width : undefined;
    }

    outputFormat = imageInfo.format ?? metadata.format;
    quality = imageInfo.quality;
  }

  if (!raw) {
    image
      .resize(outputWidth, outputHeight)
      .toFormat(outputFormat as keyof sharp.FormatEnum, {
        quality,
      });
  }

  const { data: processedImageBuffer, info } = await image.toBuffer({
    resolveWithObject: true,
  });

  outputHeight = info.height;
  outputWidth = info.width;
  outputFormat = info.format;

  return {
    title: outputTitle,
    previewUrl: `data:image/${outputFormat};base64,${processedImageBuffer.toString("base64")}`,
    sizeKb: processedImageBuffer.length / 1024,
    format: outputFormat,
    height: outputHeight,
    width: outputWidth,
    aspectRatio: outputWidth / outputHeight,
    raw,
  };
}

function parseWithReviver(jsonString: string) {
  return JSON.parse(jsonString, (key, value) => {
    if (key === "quality" || key === "width" || key === "height") {
      return value !== null ? Number(value) : null;
    }

    return value as unknown;
  }) as unknown;
}
