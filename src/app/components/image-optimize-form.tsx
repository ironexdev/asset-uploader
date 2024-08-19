import { useState, useEffect } from "react";
import ImagePreview from "@/app/components/image-preview";
import { toast } from "sonner";

interface OptimizedImageResponse {
  buffer: string;
  contentType: string;
  originalName: string;
}

export default function ImageOptimizeForm({
  setPreviewUrls,
  setImageInfos,
  setOriginalImageNames,
  selectedImageIndex,
  setSelectedImageIndex,
  onResetUploadForm,
}: {
  setPreviewUrls: (urls: string[]) => void;
  setImageInfos: (
    infos: {
      width: number;
      height: number;
      size: number;
      format: string;
      aspectRatio: number;
    }[],
  ) => void;
  setOriginalImageNames: (names: string[]) => void;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  onResetUploadForm: (includeResetKey: boolean) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageInfos, setLocalImageInfos] = useState<
    {
      width: number;
      height: number;
      size: number;
      format: string;
      aspectRatio: number;
    }[]
  >([]);
  const [isQualityEnabled, setIsQualityEnabled] = useState(true);
  const [isResizeEnabled, setIsResizeEnabled] = useState(true);
  const [outputFormat, setOutputFormat] = useState<string>("webp");

  // Updated useEffect to handle files selection
  useEffect(() => {
    if (files.length > 0) {
      const previewsTemp: string[] = [];
      const imageInfosTemp: {
        width: number;
        height: number;
        size: number;
        format: string;
        aspectRatio: number;
      }[] = [];

      files.forEach((file, index) => {
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
            previewsTemp[index] = reader.result as string;
            imageInfosTemp[index] = imageInfoData;

            // Only update state when all files are processed
            if (previewsTemp.length === files.length) {
              setPreviews([...previewsTemp]);
              setLocalImageInfos([...imageInfosTemp]);
            }
          };
        };
        reader.readAsDataURL(file);
      });
    } else {
      setPreviews([]);
      setLocalImageInfos([]);
    }
  }, [files]);

  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSelectedImageIndex(index);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles); // Set the newly selected files
      onResetUploadForm(false); // Reset related states when new files are selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    const previewUrls: string[] = [];
    const processedImageInfos: {
      width: number;
      height: number;
      size: number;
      format: string;
      aspectRatio: number;
    }[] = [];
    const processedImageNames: string[] = [];

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append("image", file);
      }

      if (isQualityEnabled) {
        formData.append("quality", quality.toString());
      }

      if (isResizeEnabled) {
        if (width !== undefined) formData.append("width", width.toString());
        if (height !== undefined) formData.append("height", height.toString());
      }

      formData.append("format", outputFormat);

      const res = await fetch("/api/optimize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const optimizedImages = (await res.json()) as OptimizedImageResponse[];

      for (const optimizedImage of optimizedImages) {
        const buffer = Buffer.from(optimizedImage.buffer, "base64");
        const blob = new Blob([buffer], { type: optimizedImage.contentType });
        const optimizedImageUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.src = optimizedImageUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const optimizedImageInfo = {
              width: img.width,
              height: img.height,
              size: Math.round(blob.size / 1024),
              format: optimizedImage.contentType,
              aspectRatio: parseFloat(aspectRatio.toFixed(2)),
            };
            previewUrls.push(optimizedImageUrl);
            processedImageInfos.push(optimizedImageInfo);
            processedImageNames.push(optimizedImage.originalName);
            resolve();
          };
        });
      }

      setPreviewUrls(previewUrls); // Only set after optimization
      setImageInfos(processedImageInfos); // Only set after optimization
      setOriginalImageNames(processedImageNames); // Only set after optimization
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while optimizing the image(s)");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border-[1px] border-[#EEEEEE] bg-white p-4"
    >
      <h2 className="text-lg font-bold">Optimize Images</h2>
      <input
        type="file"
        multiple
        required
        onChange={handleFileSelection}
        className="block w-full text-sm text-gray-500 file:mr-4 file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:text-gray-700 hover:file:bg-gray-100"
      />

      {files.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Image
          </label>
          <select
            value={selectedImageIndex}
            onChange={handleImageChange}
            className="mt-4 block w-full rounded border p-2"
          >
            {files.map((file, index) => (
              <option key={index} value={index}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {previews[selectedImageIndex] && imageInfos[selectedImageIndex] && (
        <div>
          <h3 className="text-md font-bold">Selected Image</h3>
          <ImagePreview
            previewUrl={previews[selectedImageIndex]}
            imageInfo={imageInfos[selectedImageIndex]}
          />
        </div>
      )}

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={isQualityEnabled}
          onChange={() => setIsQualityEnabled(!isQualityEnabled)}
          className="mr-2"
        />
        Change Quality
      </label>

      <input
        type="range"
        min="1"
        defaultValue="80"
        max="100"
        onChange={(e) => setQuality(parseInt(e.target.value))}
        className="block w-full rounded border p-2"
        disabled={!isQualityEnabled}
      />
      <div className="flex justify-between text-sm text-gray-700">
        <span>Quality: {quality}</span>
        <span>100</span>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={isResizeEnabled}
          onChange={() => setIsResizeEnabled(!isResizeEnabled)}
          className="mr-2"
        />
        Resize
      </label>

      <input
        type="number"
        placeholder="Width (px)"
        value={width ?? ""}
        onChange={(e) =>
          setWidth(e.target.value ? parseInt(e.target.value) : undefined)
        }
        className="block w-full rounded border p-2"
        disabled={!isResizeEnabled}
      />
      <input
        type="number"
        placeholder="Height (px)"
        value={height ?? ""}
        onChange={(e) =>
          setHeight(e.target.value ? parseInt(e.target.value) : undefined)
        }
        className="block w-full rounded border p-2"
        disabled={!isResizeEnabled}
      />

      <label className="block text-sm font-medium text-gray-700">
        Output Format
      </label>
      <select
        value={outputFormat}
        onChange={(e) => setOutputFormat(e.target.value)}
        className="block w-full rounded border p-2"
      >
        <option value="preserve">Preserve Original</option>
        <option value="webp">WEBP</option>
        <option value="png">PNG</option>
        <option value="jpg">JPG</option>
      </select>

      <button
        type="submit"
        className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
      >
        Optimize
      </button>
    </form>
  );
}
