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
  const fileBuffer = await imageFile.arrayBuffer();

  const raw = imageInfo.raw;
  const outputTitle = imageInfo.title;
  let outputWidth;
  let outputHeight;
  let outputFormat;
  let quality;
  let imageBuffer;
  let modifiedInfo;

  if (raw) {
    imageBuffer = fileBuffer;
    outputHeight = imageInfo.height!;
    outputWidth = imageInfo.width!;
    outputFormat = imageInfo.format;
  } else {
    const image = sharp(Buffer.from(fileBuffer), { animated: false });
    const metadata = await image.metadata();

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

  const buffer = Buffer.from(imageBuffer).toString("base64");

  return {
    title: outputTitle,
    previewUrl: `data:image/${outputFormat};base64,${buffer}`,
    sizeKb: imageBuffer.byteLength / 1024,
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
