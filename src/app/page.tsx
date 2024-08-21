"use client";

import { useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import ImageUploadForm, {
  type UploadedImageData,
} from "@/components/image-upload-form";
import ImageModifyForm, {
  type ImageModificationData,
} from "@/components/image-modify-form";
import { ChevronLeft, Loader } from "lucide-react";
import Header from "@/components/header";

interface UploadFormData {
  title: string;
  bucket: string;
  folder: string;
}

export default function HomePage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageMetas, setImageMetas] = useState<
    { name: string; type: string; size: number; url: string }[]
  >([]);
  const [processedImages, setProcessedImages] = useState<UploadedImageData[]>(
    [],
  );
  const [modifications, setModifications] = useState<ImageModificationData[]>(
    [],
  );
  const [uploadForms, setUploadForms] = useState<UploadFormData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      setImageFiles(filesArray);

      setImageMetas(
        filesArray.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
        })),
      );

      setModifications(
        filesArray.map(() => ({
          title: "",
          width: null,
          height: null,
          quality: 80,
          format: "webp",
          raw: false,
        })),
      );

      setStep(1);
    }
  };

  const handleModificationChange = (
    index: number,
    data: ImageModificationData,
  ) => {
    setModifications((prevModifications) => {
      const newModifications = [...prevModifications];
      newModifications[index] = data;
      return newModifications;
    });
  };

  const handleClone = (
    data: ImageModificationData,
    clonedImage: { name: string; type: string; size: number; url: string },
  ) => {
    const originalFileIndex = imageMetas.findIndex(
      (meta) => meta.name === data.title.replace("-clone", ""),
    );

    // Clone the image file using the found index
    const clonedFile = imageFiles[originalFileIndex]!;

    // Add the cloned image file to imageFiles and imageMetas
    setImageFiles((prevFiles) => [...prevFiles, clonedFile]);
    setImageMetas((prevMetas) => [...prevMetas, clonedImage]);

    // Clone the corresponding modification data
    setModifications((prevModifications) => [...prevModifications, data]);
  };

  const processImagesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/modify", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error processing images");
      return res.json() as Promise<UploadedImageData[]>;
    },
    onSuccess: (data) => {
      setProcessedImages(data);
      setStep(2);
      toast.success("Images processed successfully");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleModificationSubmit = () => {
    setLoading(true);
    const formData = new FormData();

    imageFiles.forEach((file, index) => {
      formData.append(`image${index}`, file);

      const modification = {
        ...modifications[index],
        quality: Number(modifications[index]!.quality),
      };

      formData.append(`modification${index}`, JSON.stringify(modification));
    });

    processImagesMutation.mutate(formData);
  };

  const uploadImagesMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error uploading images");
    },
    onSuccess: () => {
      toast.success("Images uploaded successfully");
      resetForms();
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleUploadSubmit = () => {
    setLoading(true);
    const formData = new FormData();

    // Add processed image data to FormData
    processedImages.forEach((image, index) => {
      const form = uploadForms[index];

      if (form) {
        const requestData = {
          ...image,
          folder: form.folder,
          title: form.title,
          bucket: form.bucket,
        };
        formData.append(`processedImage${index}`, JSON.stringify(requestData));
      }
    });

    uploadImagesMutation.mutate(formData);
  };

  const handleUploadFormChange = (index: number, formData: UploadFormData) => {
    setUploadForms((prevForms) => {
      const newForms = [...prevForms];
      newForms[index] = formData;
      return newForms;
    });
  };

  const resetForms = () => {
    setStep(1);
    setImageFiles([]);
    setImageMetas([]);
    setProcessedImages([]);
    setModifications([]);
    setUploadForms([]);
  };

  return (
    <div className="min-h-screen bg-primary text-textPrimary">
      <Header step={step} />
      <main className="container mx-auto max-w-container space-y-6 p-4 pt-24">
        {step === 1 ? (
          <div className="space-y-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelection}
              className="w-full rounded border border-border bg-inputBg p-2 text-textPrimary"
            />
            <div className="flex-start flex flex-wrap gap-10">
              {imageMetas.map((meta, index) => (
                <ImageModifyForm
                  key={index}
                  imageData={meta}
                  index={index}
                  onClone={handleClone}
                  onChange={(data) => handleModificationChange(index, data)}
                />
              ))}
            </div>
            {imageFiles.length > 0 && (
              <div className="flex">
                <button
                  className="btn btn-secondary ml-auto mt-4 flex h-[48px] items-center rounded bg-accent px-10 font-bold text-textPrimary transition"
                  onClick={resetForms}
                >
                  Reset
                </button>
                <button
                  className="btn text-md ml-5 mt-4 flex h-[48px] items-center rounded bg-highlighted px-10 font-bold text-textPrimary transition disabled:bg-accent"
                  onClick={handleModificationSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="mr-2 animate-spin" size={24} />
                  ) : (
                    "Process Images"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex h-[48px] w-[200px] items-center justify-center rounded-md bg-accent"
              >
                <ChevronLeft size={32} />
              </button>
            </div>
            <div className="flex-start flex flex-wrap gap-10">
              {processedImages.map((image, index) => (
                <ImageUploadForm
                  key={index}
                  image={image}
                  onFormChange={(data) => handleUploadFormChange(index, data)}
                />
              ))}
            </div>
            <div className="flex">
              <button
                className="btn btn-secondary ml-auto mt-4 flex h-[48px] items-center rounded bg-accent px-10 font-bold text-textPrimary transition"
                onClick={resetForms}
              >
                Reset
              </button>
              <button
                className="btn btn-primary ml-5 mt-4 flex h-[48px] items-center rounded bg-highlighted px-10 font-bold text-textPrimary transition"
                onClick={handleUploadSubmit}
              >
                Upload Images
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
