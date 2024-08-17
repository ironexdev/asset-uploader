"use client";

import React, { useState } from "react";
import ImageOptimizeForm from "@/app/components/image-optimize-form";
import ImageUploadForm from "@/app/components/image-upload-form";
import ObjectList from "@/app/components/object-list";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
    format: string;
    aspectRatio: number;
  } | null>(null);
  const [resetKey, setResetKey] = useState<number>(0); // Key to trigger reset

  const handleReset = () => {
    setPreviewUrl("");
    setImageInfo(null);
    setResetKey((prevKey) => prevKey + 1); // Trigger reset by changing key
  };

  return (
    <main className="flex w-full justify-center py-[20px]">
      <div className="flex w-[1680px] justify-between">
        <div className="w-[400px]">
          <ImageOptimizeForm
            key={resetKey} // Reset form when key changes
            setPreviewUrl={setPreviewUrl}
            setImageInfo={setImageInfo}
          />
        </div>
        <div className="w-[400px]">
          <ImageUploadForm
            previewUrl={previewUrl}
            imageInfo={imageInfo}
            onReset={handleReset} // Call handleReset after upload
          />
        </div>
        <div className="w-[800px]">
          <ObjectList />
        </div>
      </div>
    </main>
  );
}
