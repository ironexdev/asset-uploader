"use client";

import React, { useState } from "react";
import ImageOptimizeForm from "@/app/components/image-optimize-form";
import ImageUploadForm from "@/app/components/image-upload-form";
import ObjectList from "@/app/components/object-list";

export default function Home() {
  const [processedPreviewUrls, setProcessedPreviewUrls] = useState<string[]>(
    [],
  );
  const [processedImageInfos, setProcessedImageInfos] = useState<
    {
      width: number;
      height: number;
      size: number;
      format: string;
      aspectRatio: number;
    }[]
  >([]);
  const [originalImageNames, setOriginalImageNames] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);

  const [optimizeSelectedImageIndex, setOptimizeSelectedImageIndex] =
    useState<number>(0);
  const [uploadSelectedImageIndex, setUploadSelectedImageIndex] =
    useState<number>(0);

  const handleReset = (includeResetKey = true) => {
    setProcessedPreviewUrls([]);
    setProcessedImageInfos([]);
    setOriginalImageNames([]);
    setOptimizeSelectedImageIndex(0);
    setUploadSelectedImageIndex(0);

    if (includeResetKey) {
      setResetKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <>
      <main className="flex w-full justify-center py-[20px]">
        <div className="flex w-full max-w-[860px] flex-col justify-center px-[20px]">
          <div className="mt-[20px] flex w-full max-w-[1640px] gap-[20px]">
            <div className="w-[400px] flex-shrink-0">
              <ImageOptimizeForm
                key={resetKey}
                setPreviewUrls={setProcessedPreviewUrls}
                setImageInfos={setProcessedImageInfos}
                setOriginalImageNames={setOriginalImageNames}
                selectedImageIndex={optimizeSelectedImageIndex}
                setSelectedImageIndex={setOptimizeSelectedImageIndex}
                onResetUploadForm={handleReset}
              />
            </div>
            <div className="w-[400px] flex-shrink-0">
              <ImageUploadForm
                previewUrls={processedPreviewUrls}
                imageInfos={processedImageInfos}
                selectedImageIndex={uploadSelectedImageIndex}
                setSelectedImageIndex={setUploadSelectedImageIndex}
                originalImageNames={originalImageNames}
                onReset={handleReset}
              />
            </div>
          </div>
          <div className="w-[820px] py-[60px]">
            <ObjectList />
          </div>
        </div>
      </main>
    </>
  );
}
