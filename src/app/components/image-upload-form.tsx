import { useState, useEffect } from "react";
import { toast } from "sonner";
import ImagePreview from "@/app/components/image-preview";

interface UploadResponse {
  imageUrl: string;
  imageName: string;
}

export default function ImageUploadForm({
  previewUrls,
  imageInfos,
  selectedImageIndex,
  setSelectedImageIndex,
  originalImageNames,
  onReset,
}: {
  previewUrls: string[];
  imageInfos: {
    width: number;
    height: number;
    size: number;
    format: string;
    aspectRatio: number;
  }[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  originalImageNames: string[];
  onReset: (includeResetKey: boolean) => void;
}) {
  const [folderName, setFolderName] = useState<string>("");
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [uploadedImageNames, setUploadedImageNames] = useState<string[]>([]);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);

  useEffect(() => {
    setImageNames([...originalImageNames]); // Update image names after optimization
    setIsFormVisible(originalImageNames.length > 0);
  }, [originalImageNames]);

  const handleImageNameChange = (index: number, newName: string) => {
    const updatedImageNames = [...imageNames];
    updatedImageNames[index] = newName;
    setImageNames(updatedImageNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrls.length || !folderName) return;

    const formData = new FormData();
    formData.append("folder", folderName);

    for (let index = 0; index < previewUrls.length; index++) {
      const url = previewUrls[index];
      const currentImageName = imageNames[index];

      if (!url || !currentImageName) continue;

      const res = await fetch(url);
      const blob = await res.blob();

      if (blob && currentImageName) {
        formData.append("image", blob, currentImageName);
        formData.append("imageName", currentImageName);
      }
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadedImages = (await response.json()) as UploadResponse[];

    const imageUrls = uploadedImages.map((image) => image.imageUrl);
    const uploadedNames = uploadedImages.map((image) => image.imageName);

    toast.success(`Images uploaded successfully!`);
    setUploadedImageUrls(imageUrls);
    setUploadedImageNames(uploadedNames);
    onReset(true);
    setIsFormVisible(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    setSelectedImageIndex(index);
  };

  return (
    <>
      {isFormVisible && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border-[1px] border-[#EEEEEE] bg-white p-4"
        >
          <h2 className="text-lg font-bold">Upload Images to S3</h2>
          <button
            type="button"
            className="h-[36px]"
            onClick={() => onReset(true)}
          >
            Reset
          </button>
          {originalImageNames.length > 0 && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Select Image to Upload
              </label>
              <select
                value={selectedImageIndex}
                onChange={handleImageChange}
                className="block w-full rounded border p-2"
              >
                {originalImageNames.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          )}
          <h3 className="text-md font-bold">Selected Image</h3>
          {previewUrls[selectedImageIndex] &&
            imageInfos[selectedImageIndex] && (
              <ImagePreview
                previewUrl={previewUrls[selectedImageIndex]}
                imageInfo={imageInfos[selectedImageIndex]}
              />
            )}
          <input
            type="text"
            placeholder="Folder (S3 namespace after assets/)"
            value={folderName}
            required
            onChange={(e) => setFolderName(e.target.value)}
            className="block w-full rounded border p-2"
          />
          {imageNames[selectedImageIndex] && (
            <input
              type="text"
              value={imageNames[selectedImageIndex] ?? ""}
              onChange={(e) =>
                handleImageNameChange(selectedImageIndex, e.target.value)
              }
              className="mt-2 block w-full rounded border p-2"
            />
          )}
          <button
            type="submit"
            className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600"
          >
            Upload
          </button>
        </form>
      )}

      {uploadedImageUrls.length > 0 && (
        <div className="rounded border bg-gray-100 p-4">
          <h3 className="text-md font-bold">Latest uploaded images:</h3>
          <ul>
            {uploadedImageUrls.map((url, index) => (
              <li key={index}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {uploadedImageNames[index]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
