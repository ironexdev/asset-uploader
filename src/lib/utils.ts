import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAspectRatio(ratio: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const width = Math.round(ratio * 10000);
  const height = 10000;
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

export function getFileFormat(file: File): string {
  const mimeType = file.type;

  if (!mimeType) {
    throw new Error("File does not have a valid MIME type.");
  }

  const format = mimeType.split("/")[1]; // Extract the format part from MIME type
  if (format) {
    return format;
  }

  throw new Error("Unable to determine file format from MIME type.");
}

export function base64ToFile(base64: string, filename: string): File {
  const base64Parts = base64.split(",");

  if (base64Parts.length < 2) {
    throw new Error("Invalid base64 string");
  }

  const byteString = atob(base64Parts[1]!);

  const mimeParts = base64Parts[0]!.split(":");
  if (mimeParts.length < 2) {
    throw new Error("Invalid MIME type in base64 string");
  }

  const mimeString = mimeParts[1]!.split(";")[0];

  const byteNumbers = new Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeString });
  return new File([blob], filename, { type: mimeString });
}
