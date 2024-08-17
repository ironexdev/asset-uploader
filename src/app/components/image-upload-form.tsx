import { useState } from "react";
import { toast } from "sonner";
import ImagePreview from "@/app/components/image-preview";

interface UploadResponse {
  imageUrl: string;
}

export default function ImageUploadForm({
  previewUrl,
  imageInfo,
  onReset,
}: {
  previewUrl: string;
  imageInfo: {
    width: number;
    height: number;
    size: number;
    format: string;
    aspectRatio: number;
  } | null;
  onReset: () => void;
}) {
  const [imageName, setImageName] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !imageName) return;

    const res = await fetch(previewUrl);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("image", blob, "optimized-image.webp");
    formData.append("imageName", imageName);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result: UploadResponse = (await response.json()) as UploadResponse;

    toast.success(`Image ${imageName} uploaded!`);
    setUploadedImageUrl(result.imageUrl);
    setUploadedImageName(imageName);
    onReset();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-white p-4 shadow-md"
      >
        <h2 className="text-lg font-bold">Upload Image to S3</h2>
        {previewUrl && imageInfo && (
          <>
            <button className="h-[36px]" onClick={onReset}>
              Reset
            </button>
            <h3 className="text-md font-bold">Optimized Image</h3>
            <ImagePreview previewUrl={previewUrl} imageInfo={imageInfo} />
          </>
        )}
        <input
          type="text"
          placeholder="Namespace (fixed prefix assets/images/)"
          value={imageName}
          required
          onChange={(e) => setImageName(e.target.value)}
          className="block w-full rounded border p-2"
        />
        <button
          type="submit"
          className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600"
        >
          Upload
        </button>
      </form>

      {uploadedImageUrl && uploadedImageName && (
        <div className="mt-4 rounded border bg-gray-100 p-4">
          <h3 className="text-md font-bold">Latest uploaded image:</h3>
          <a
            href={uploadedImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {uploadedImageName}
          </a>
        </div>
      )}
    </>
  );
}
