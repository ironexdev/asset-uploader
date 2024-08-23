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

interface ModifiedImage {
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
    const modifiedImages: ModifiedImage[] = [];

    // Iterate through formData entries
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image")) {
        const index = key.replace("image", "");
        const imageFile = value as File;
        const imageInfo: ImageInfo = parseWithReviver(
          formData.get(`modification${index}`) as string,
        ) as ImageInfo;

        const modifiedImage = await modifyImage(imageFile, imageInfo);
        modifiedImages.push(modifiedImage);
      }
    }

    return NextResponse.json(modifiedImages);
  } catch (error) {
    console.error("Error modifying images:", error);
    return NextResponse.json(
      { error: "Failed to modify images" },
      { status: 500 },
    );
  }
}

async function modifyImage(
  imageFile: File,
  imageInfo: ImageInfo,
): Promise<ModifiedImage> {
  let fileBuffer: ArrayBuffer | string = await imageFile.arrayBuffer();
  const outputTitle = imageInfo.title;
  const image = sharp(Buffer.from(fileBuffer), { animated: false });
  const metadata = await image.metadata();
  const raw = imageInfo.raw;

  if (raw && metadata.format === "svg") {
    fileBuffer = await imageFile.text();
  }

  let outputWidth;
  let outputHeight;
  let outputFormat;
  let quality;
  let imageBuffer;
  let modifiedInfo;

  if (raw) {
    imageBuffer = fileBuffer;
    outputHeight = metadata.height!;
    outputWidth = metadata.width!;
    outputFormat = metadata.format!;
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

    image
      .resize(outputWidth, outputHeight)
      .toFormat(outputFormat as keyof sharp.FormatEnum, {
        quality,
      });

    const {
      data,
      info,
    }: {
      data: Buffer;
      info: { height: number; width: number; format: string };
    } = await image.toBuffer({
      resolveWithObject: true,
    });

    modifiedInfo = info;
    imageBuffer = data;

    outputHeight = modifiedInfo.height;
    outputWidth = modifiedInfo.width;
    outputFormat = modifiedInfo.format;
  }

  let buffer, sizeKB, base64Format;
  if (typeof imageBuffer === "string") {
    sizeKB = imageBuffer.length / 1024;
    buffer = btoa(imageBuffer);
    base64Format = "data:image/svg+xml;base64,";
  } else {
    sizeKB = imageBuffer.byteLength / 1024;
    buffer = Buffer.from(imageBuffer).toString("base64");
    base64Format = `data:image/${outputFormat};base64,`;
  }

  return {
    title: outputTitle,
    previewUrl: `${base64Format}${buffer}`,
    sizeKb: sizeKB,
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
