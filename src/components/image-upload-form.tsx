import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { formatAspectRatio } from "@/lib/utils";

export interface UploadedImageData {
  title: string;
  previewUrl: string;
  sizeKb: number;
  format: string;
  height: number;
  width: number;
  aspectRatio: number;
  raw: boolean;
  folder: string;
}

interface UploadFormData {
  title: string;
  bucket: string;
  folder: string;
}

interface ImageUploadFormProps {
  image: UploadedImageData;
  onFormChange: (data: UploadFormData) => void;
}

const ImageUploadForm = ({ image, onFormChange }: ImageUploadFormProps) => {
  const { control, watch } = useForm<UploadFormData>({
    defaultValues: {
      title: (image.title || "").replace(/\.[^/.]+$/, `.${image.format}`),
      bucket: image.raw ? "storage" : "server",
      folder: image.folder || "",
    },
  });

  const selectedBucket = watch("bucket");

  useEffect(() => {
    const subscription = watch((value) => {
      // Ensure that all values are strings
      onFormChange({
        title: value.title ?? "",
        bucket: value.bucket ?? "server",
        folder: value.folder ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const aspectRatio = formatAspectRatio(Number(image.aspectRatio.toFixed(2)));

  return (
    <div className="h-[470px] w-[700px] rounded border border-primary bg-primary p-6 text-primary">
      <div className="flex h-full space-x-6">
        {/* Image Preview */}
        <div className="flex w-[300px] flex-shrink-0 rounded-lg bg-secondary p-5">
          <img
            src={image.previewUrl}
            alt={`Preview ${image.title}`}
            className="h-auto w-full rounded object-contain"
          />
        </div>

        {/* Form Section */}
        <div className="flex-1">
          <Controller
            name="bucket"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm">S3 Bucket</label>
                <select
                  {...field}
                  className="bg-input mt-2 w-full rounded border border-primary p-2 text-primary"
                >
                  <option value="server">
                    {process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}
                  </option>
                  {/* NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME is optional */}
                  {process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME && (
                    <option value="storage">
                      {process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME}
                    </option>
                  )}
                </select>
              </div>
            )}
          />

          <Controller
            name="folder"
            control={control}
            render={({ field }) => (
              <div className="mt-5">
                <label className="block text-sm">Folder</label>
                <input
                  {...field}
                  placeholder={`Will be prefixed with ${
                    selectedBucket === "server" ? "assets/" : "images/assets/"
                  }`}
                  type="text"
                  className="bg-input mt-2 w-full rounded border border-primary p-2 text-primary"
                />
              </div>
            )}
          />

          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <div className="mt-5">
                <label className="block text-sm">Title</label>
                <input
                  {...field}
                  type="text"
                  placeholder="Title"
                  className="bg-input mt-2 w-full rounded border border-primary p-2 text-primary"
                />
              </div>
            )}
          />

          {/* Height, Width, Size, Aspect Ratio, Format */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Height</label>
              <span className="font-bold">{image.height}px</span>
            </div>

            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Width</label>
              <span className="font-bold">{image.width}px</span>
            </div>

            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Aspect Ratio</label>
              <span className="font-bold">
                {aspectRatio} ({image.aspectRatio.toFixed(2)})
              </span>
            </div>

            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Size</label>
              <span className="font-bold">{image.sizeKb.toFixed(0)} KB</span>
            </div>

            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Format</label>
              <span className="font-bold">{image.format}</span>
            </div>

            <div className="flex min-h-[40px] flex-col justify-between">
              <label className="block text-sm">Modified</label>
              <span className="font-bold">{image.raw ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadForm;
