"use client";

import { useState, type ChangeEvent, useEffect } from "react";
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
  const [inputFileKey, setInputFileKey] = useState(0);
  useEffect(() => {
    if (processedImages.length > 0 && uploadForms.length === 0) {
      const initialForms = processedImages.map((processedImage) => ({
        title: processedImage.title || "",
        bucket: processedImage.raw ? "storage" : "server",
        folder: processedImage.folder || "",
      }));
      setUploadForms(initialForms);
    }
  }, [processedImages, uploadForms.length]);

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

    const clonedFile = imageFiles[originalFileIndex]!;

    setImageFiles((prevFiles) => [...prevFiles, clonedFile]);
    setImageMetas((prevMetas) => [...prevMetas, clonedImage]);

    setModifications((prevModifications) => [...prevModifications, data]);
  };

  const handleRemove = (index: number) => {
    const dt = new DataTransfer();

    const inputElement = document.getElementById(
      "image-selection",
    ) as HTMLInputElement;

    if (inputElement?.files) {
      const { files } = inputElement;

      for (let i = 0; i < files.length; i++) {
        if (i !== index) {
          dt.items.add(files[i]!);
        }
      }

      inputElement.files = dt.files;

      setImageFiles(Array.from(dt.files));

      setImageMetas((prevMetas) => {
        const newMetas = [...prevMetas];
        newMetas.splice(index, 1);
        return newMetas;
      });

      setModifications((prevModifications) => {
        const newModifications = [...prevModifications];
        newModifications.splice(index, 1);
        return newModifications;
      });

      if (dt.files.length === 0) {
        setInputFileKey((prev) => prev + 1);
      }
    }
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
      toast.success("Images processed successfully! Now upload them.");
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
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(((await res.json()) as { error: string }).error);
        } else {
          throw new Error("Error uploading images");
        }
      }
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

  const handleDownload = () => {
    processedImages.forEach((image: UploadedImageData) => {
      const url: string = image.previewUrl;

      const link = document.createElement("a");
      link.href = url;
      link.download = image.title || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleUploadFormChange = (index: number, formData: UploadFormData) => {
    setUploadForms((prevForms) => {
      const newForms = [...prevForms];
      newForms[index] = formData;
      return newForms;
    });
  };

  const resetForms = () => {
    setInputFileKey((prev) => prev + 1);
    setStep(1);
    setImageFiles([]);
    setImageMetas([]);
    setProcessedImages([]);
    setModifications([]);
    setUploadForms([]);
  };

  return (
    <div className="min-h-screen">
      <Header step={step} />
      <main className="container mx-auto max-w-container space-y-6 p-5 pt-[6.5rem]">
        {step === 1 ? (
          <div className="space-y-6">
            <input
              key={inputFileKey}
              id="image-selection"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelection}
              className="w-full rounded border border-primary bg-input p-2 text-primary"
            />
            <div className="flex-start flex flex-wrap gap-10">
              {imageMetas.map((meta, index) => (
                <ImageModifyForm
                  key={index}
                  imageData={meta}
                  index={index}
                  onClone={handleClone}
                  onRemove={handleRemove}
                  onChange={(data) => handleModificationChange(index, data)}
                />
              ))}
            </div>
            {imageFiles.length > 0 && (
              <div className="flex">
                <button
                  className="ml-auto mt-4 flex h-[40px] items-center rounded bg-gradient-button px-10 font-bold text-primary transition disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                  onClick={resetForms}
                >
                  Reset
                </button>
                <button
                  className="text-md ml-5 mt-4 flex h-[40px] items-center rounded bg-gradient-button px-10 font-bold text-primary transition disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
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
            <div className="h-48px space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 flex h-[40px] w-[200px] items-center justify-center rounded-md bg-gradient-button text-primary"
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
                className="mt-4 flex h-[40px] items-center rounded bg-gradient-button px-10 font-bold text-primary transition disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                onClick={resetForms}
              >
                Reset
              </button>
              <button
                className="ml-auto mt-4 flex h-[40px] items-center rounded bg-gradient-button px-10 font-bold text-primary transition disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                onClick={handleDownload}
              >
                Download
              </button>
              <button
                className="ml-5 mt-4 flex h-[40px] items-center rounded bg-gradient-button px-10 font-bold text-primary transition disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                onClick={handleUploadSubmit}
              >
                Upload
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
