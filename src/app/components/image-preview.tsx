export default function ImagePreview({
  previewUrl,
  imageInfo,
}: {
  previewUrl: string;
  imageInfo: {
    width: number;
    height: number;
    size: number;
    format: string;
    aspectRatio: number;
  };
}) {
  return (
    <div className="bg-color-[#ddd] rounded-lg">
      <img
        src={previewUrl}
        alt="Preview"
        className="mt-4 h-auto w-full rounded"
      />
      {imageInfo && (
        <div className="mt-2 text-sm text-gray-700">
          <p>Width: {imageInfo.width}px</p>
          <p>Height: {imageInfo.height}px</p>
          <p>Size: {imageInfo.size} KB</p>
          <p>Format: {imageInfo.format}</p>
          <p>Aspect Ratio: {imageInfo.aspectRatio}</p>
        </div>
      )}
    </div>
  );
}
