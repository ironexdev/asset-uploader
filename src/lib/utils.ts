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
