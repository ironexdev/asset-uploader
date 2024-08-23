"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X } from "lucide-react";

export interface ImageModificationData {
  title: string;
  width: number | null;
  height: number | null;
  quality: number;
  format: string;
  raw: boolean;
}

interface ImageModifyFormProps {
  imageData: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  index: number;
  onClone: (
    data: ImageModificationData,
    clonedImageData: { name: string; size: number; type: string; url: string },
  ) => void;
  onRemove: (index: number) => void;
  onChange: (data: ImageModificationData) => void;
}

const ImageModifyForm = ({
  imageData,
  index,
  onClone,
  onRemove,
  onChange,
}: ImageModifyFormProps) => {
  const { control, watch, setValue } = useForm<ImageModificationData>({
    defaultValues: {
      title: imageData.name,
      width: null,
      height: null,
      quality: 80,
      format: "webp",
      raw: false,
    },
  });

  const formats = {
    avif: "AVIF",
    jpeg: "JPEG",
    png: "PNG",
    webp: "WEBP",
  };

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [originalHeight, setOriginalHeight] = useState<number | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageData.url;
    img.onload = () => {
      setValue("width", img.width, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValue("height", img.height, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setAspectRatio(img.width / img.height);
    };
  }, [imageData, setValue]);

  useEffect(() => {
    const subscription = watch((data) => {
      const { width, height, raw } = data;

      onChange({
        title: data.title ?? "",
        width: width ?? null,
        height: height ?? null,
        quality: data.quality ?? 80,
        format: data.format ?? "webp",
        raw: raw ?? false,
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleClone = () => {
    const clonedImageData = {
      name: `${imageData.name}-clone-${index}`,
      size: imageData.size,
      type: imageData.type,
      url: imageData.url,
    };

    onClone(
      {
        title: `${imageData.name}-clone`,
        width: originalWidth,
        height: originalHeight,
        quality: watch("quality"),
        format: watch("format"),
        raw: watch("raw"),
      },
      clonedImageData,
    );
  };

  const handleRemove = (index: number) => {
    onRemove(index);
  };

  return (
    <div className="h-[470px] w-[700px] rounded border border-primary bg-primary p-6 text-primary">
      <div className="flex h-full justify-between">
        <div className="flex w-[300px] flex-shrink-0 rounded-lg bg-secondary p-5">
          {imageData.url && (
            <img
              src={imageData.url}
              alt={`Preview ${index + 1}`}
              className="h-auto w-full rounded object-contain"
            />
          )}
        </div>

        <div className="w-[330px]">
          <div className="mb-4 flex items-center justify-between">
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="w-[180px] rounded border border-primary bg-input p-2 text-primary"
                />
              )}
            />
            <button
              onClick={handleClone}
              className="w-[80px] rounded bg-button-secondary p-2 font-bold text-primary transition"
            >
              Clone
            </button>
            <button
              onClick={() => handleRemove(index)}
              className="flex h-[40px] w-[40px] items-center justify-center rounded bg-button-destroy"
            >
              <X size={24} className="cursor-pointer" />
            </button>
          </div>
          <div>
            <Controller
              name="raw"
              control={control}
              render={({ field }) => (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...field}
                    className="mr-2 cursor-pointer"
                    value={field.value ? "true" : "false"}
                  />
                  <label className="text-primary">Don&apos;t modify</label>
                </div>
              )}
            />

            <>
              <div className="form-group mt-5">
                <div className="flex text-sm">
                  <div>Output Height (px)</div>
                  {originalHeight && (
                    <div className="ml-auto">Original: {originalHeight}px</div>
                  )}
                </div>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...field}
                      placeholder="Will be automatically calculated"
                      className="mt-2 w-full rounded border border-primary bg-input p-2 text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                      disabled={watch("raw")}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
              <div className="form-group mt-5">
                <div className="flex text-sm">
                  Output Width (px){" "}
                  {originalWidth && (
                    <div className="ml-auto">Original: {originalWidth}px</div>
                  )}
                </div>
                <Controller
                  name="width"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      {...field}
                      placeholder="Will be automatically calculated"
                      className="mt-2 w-full rounded border border-primary bg-input p-2 text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                      disabled={watch("raw")}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>

              <div className="form-group mt-5">
                <div className="flex justify-between text-sm">
                  Output Quality ({watch("quality")})
                  {imageData.size && (
                    <span className="ml-auto">
                      Original: {`${(imageData.size / 1024).toFixed(2)} KB`}{" "}
                    </span>
                  )}
                </div>
                <Controller
                  name="quality"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="range"
                      min="1"
                      max="100"
                      {...field}
                      className="mt-2 w-full rounded border border-primary bg-input text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                      disabled={watch("raw")}
                    />
                  )}
                />
              </div>

              <div className="form-group mt-5">
                <div className="flex text-sm">
                  <div>Output Format</div>
                </div>
                <Controller
                  name="format"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-2 w-full rounded border border-primary bg-input p-2 text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
                      disabled={watch("raw")}
                    >
                      {Object.entries(formats).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModifyForm;
