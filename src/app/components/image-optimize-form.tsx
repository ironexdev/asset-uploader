import { useState, useEffect } from "react";
import ImagePreview from "@/app/components/image-preview";
import { toast } from "sonner";

export default function ImageOptimizeForm({
  setPreviewUrl,
  setImageInfo,
}: {
  setPreviewUrl: (url: string) => void;
  setImageInfo: (
    info: {
      width: number;
      height: number;
      size: number;
      format: string;
      aspectRatio: number;
    } | null,
  ) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageInfo, setImageInfoState] = useState<{
    width: number;
    height: number;
    size: number;
    format: string;
    aspectRatio: number;
  } | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const imageInfoData = {
            width: img.width,
            height: img.height,
            size: Math.round(file.size / 1024), // size in KB
            format: file.type,
            aspectRatio: parseFloat(aspectRatio.toFixed(2)),
          };
          setPreview(reader.result as string);
          setImageInfoState(imageInfoData);
          setImageInfo(imageInfoData);
        };
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      setImageInfoState(null);
      setImageInfo(null);
    }
  }, [file, setImageInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("quality", quality.toString());
    if (width !== undefined) formData.append("width", width.toString());
    if (height !== undefined) formData.append("height", height.toString());

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const optimizedImageUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.src = optimizedImageUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const optimizedImageInfo = {
          width: img.width,
          height: img.height,
          size: Math.round(blob.size / 1024), // size in KB
          format: blob.type,
          aspectRatio: parseFloat(aspectRatio.toFixed(2)),
        };
        setPreviewUrl(optimizedImageUrl);
        setImageInfo(optimizedImageInfo);
      };
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while optimizing the image");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg bg-white p-4 shadow-md"
    >
      <h2 className="text-lg font-bold">Optimize Image</h2>
      <input
        type="file"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:text-gray-700 hover:file:bg-gray-100"
      />
      {preview && imageInfo && (
        <>
          <h3 className="text-md font-bold">Raw Image</h3>
          <ImagePreview previewUrl={preview} imageInfo={imageInfo} />
        </>
      )}
      <input
        type="range"
        required
        min="0"
        defaultValue="80"
        max="100"
        onChange={(e) => setQuality(parseInt(e.target.value))}
        className="block w-full rounded border p-2"
      />
      <div className="flex justify-between text-sm text-gray-700">
        <span>Quality: {quality}</span>
        <span>100</span>
      </div>
      <input
        type="number"
        placeholder="Width (px)"
        value={width ?? ""}
        onChange={(e) =>
          setWidth(e.target.value ? parseInt(e.target.value) : undefined)
        }
        className="block w-full rounded border p-2"
      />
      <input
        type="number"
        placeholder="Height (px)"
        value={height ?? ""}
        onChange={(e) =>
          setHeight(e.target.value ? parseInt(e.target.value) : undefined)
        }
        className="block w-full rounded border p-2"
      />
      <button
        type="submit"
        className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
      >
        Optimize
      </button>
    </form>
  );
}
