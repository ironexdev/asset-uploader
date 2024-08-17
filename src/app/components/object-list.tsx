import { useState, useEffect } from "react";
import { toast } from "sonner";

interface S3Object {
  url: string;
  key: string;
  sizeInKB: string;
  lastModified: string;
}

interface S3ObjectData {
  objects: S3Object[];
}

export default function ObjectList() {
  const [objects, setObjects] = useState<S3Object[]>([]);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        const res = await fetch("/api/objects");
        if (!res.ok) {
          const errorMessage = `Error: ${res.status} ${res.statusText}`;
          throw new Error(errorMessage);
        }
        const data = (await res.json()) as S3ObjectData;
        setObjects(data.objects);
      } catch (err) {
        const message = (err as Error).message;
        toast.error(message);
      }
    };

    // Call the async function and catch any unhandled errors
    fetchObjects().catch((err) => {
      toast.error(`Unexpected error: ${(err as Error).message}`);
    });
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <h2 className="text-lg font-bold">S3 Object List</h2>
      {objects.length > 0 ? (
        <table className="mt-4 w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-700">
              <th className="pb-2">Name</th>
              <th className="pb-2">Size</th>
              <th className="pb-2">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((object, index) => (
              <tr key={index} className="text-sm text-gray-700">
                <td className="border-t py-2">
                  <a
                    href={object.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {object.key}
                  </a>
                </td>
                <td className="border-t py-2">{object.sizeInKB} KB</td>
                <td className="border-t py-2">{object.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No objects found.</p>
      )}
    </div>
  );
}
