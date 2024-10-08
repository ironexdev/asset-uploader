"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface S3Object {
  url: string;
  key: string;
  sizeInKB: number;
  lastModified: string;
}

interface S3ObjectData {
  objects: S3Object[];
}

export default function ObjectList({
  className = "",
  type = "server", // default to "server"
}: {
  className?: string;
  type?: "server" | "storage";
}) {
  // NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME is optional
  if (!process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME) {
    type = "server";
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<{
    column: "s3Object" | "cloudfrontUrl" | "size" | "lastModified";
    order: "asc" | "desc";
  }>({ column: "lastModified", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const itemsPerPage = 100;
  const s3Region = process.env.NEXT_PUBLIC_AWS_S3_REGION;
  const queryClient = useQueryClient();
  const bucket =
    type === "server"
      ? process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
      : process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME;
  const folderPrefix = type === "server" ? "assets/" : "images/assets/";

  const { data, error, isLoading } = useQuery<S3ObjectData, Error>({
    queryKey: ["objects", type],
    queryFn: async () => {
      const res = await fetch(`/api/objects?type=${type}`);
      if (!res.ok) {
        const errorMessage = `Error: ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
      }
      return res.json() as Promise<S3ObjectData>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      const res = await fetch("/api/delete-objects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keys }),
      });

      if (!res.ok) {
        const errorMessage = `Error deleting objects: ${res.status} ${res.statusText}`;
        throw new Error(errorMessage);
      }

      return keys;
    },
    onSuccess: (deletedKeys) => {
      queryClient.setQueryData<S3ObjectData>(["objects", type], (oldData) => {
        if (!oldData) {
          return { objects: [] };
        }

        return {
          ...oldData,
          objects: oldData.objects.filter(
            (object) => !deletedKeys.includes(object.key),
          ),
        };
      });
      toast.success("Selected objects deleted successfully!");
      setSelectedObjects([]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolder(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (
    column: "s3Object" | "cloudfrontUrl" | "size" | "lastModified",
  ) => {
    setSortOrder((prevOrder) => ({
      column,
      order:
        prevOrder.column === column && prevOrder.order === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleCheckboxChange = (key: string) => {
    setSelectedObjects((prevSelected) =>
      prevSelected.includes(key)
        ? prevSelected.filter((k) => k !== key)
        : [...prevSelected, key],
    );
  };

  const handleDeleteSelected = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the selected objects? This action cannot be undone.",
    );

    if (confirmDelete) {
      deleteMutation.mutate(selectedObjects);
    }
  };

  if (isLoading)
    return (
      <Loader
        className="fixed bottom-[-100%] left-[-100%] right-[-100%] top-[-100%] m-auto animate-spin text-primary"
        size={48}
      />
    );

  if (error) return <p>Error: {error.message}</p>;

  const objects = data?.objects ?? [];

  const filteredObjects = objects.filter((object) => {
    const matchesFolder = selectedFolder
      ? object.key.startsWith(selectedFolder)
      : true;
    const matchesSearch = object.key
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const sortedObjects = [...filteredObjects].sort((a, b) => {
    if (sortOrder.column === "s3Object") {
      return sortOrder.order === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key);
    } else if (sortOrder.column === "cloudfrontUrl") {
      return sortOrder.order === "asc"
        ? a.url.localeCompare(b.url)
        : b.url.localeCompare(a.url);
    } else if (sortOrder.column === "size") {
      return sortOrder.order === "asc"
        ? a.sizeInKB - b.sizeInKB
        : b.sizeInKB - a.sizeInKB;
    } else {
      return sortOrder.order === "asc"
        ? new Date(a.lastModified).getTime() -
            new Date(b.lastModified).getTime()
        : new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime();
    }
  });

  const paginatedObjects = sortedObjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredObjects.length / itemsPerPage) || 1;

  const folders = filterObjectsByPrefix(objects, folderPrefix);

  const extractPath = (url: string): string => {
    const match = /https?:\/\/[^\/]+(\/.*)$/.exec(url);
    return match ? match[1]! : url;
  };

  const generateS3Link = (key: string) => {
    return `https://${s3Region}.console.aws.amazon.com/s3/object/${bucket}?region=${s3Region}&bucketType=general&prefix=${key}`;
  };

  return (
    <div className={cn("", className)}>
      <div className="mt-4 flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-[250px] rounded border border-primary bg-input p-2 text-primary"
        />
        <select
          value={selectedFolder ?? ""}
          onChange={handleFolderChange}
          className="ml-2 w-[250px] cursor-pointer rounded border border-primary bg-input p-2 text-primary"
        >
          {folders.map((folder, index) => (
            <option key={index} value={folder}>
              {folder}
            </option>
          ))}
        </select>
      </div>
      {paginatedObjects.length > 0 ? (
        <>
          <table className="mt-4 w-full table-auto border-collapse">
            <thead>
              <tr className="text-left font-medium text-gray-700">
                <th className="w-[30px] pb-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedObjects(
                        e.target.checked
                          ? paginatedObjects.map((object) => object.key)
                          : [],
                      )
                    }
                    checked={
                      selectedObjects.length === paginatedObjects.length &&
                      paginatedObjects.length > 0
                    }
                  />
                </th>
                <th
                  className="cursor-pointer pb-2 text-primary"
                  onClick={() => handleSort("s3Object")}
                >
                  S3 Object{" "}
                  {sortOrder.column === "s3Object"
                    ? sortOrder.order === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                {type === "server" && (
                  <th
                    className="cursor-pointer pb-2 text-primary"
                    onClick={() => handleSort("cloudfrontUrl")}
                  >
                    Cloudfront URL{" "}
                    {sortOrder.column === "cloudfrontUrl"
                      ? sortOrder.order === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                )}
                <th
                  className="w-[80px] cursor-pointer pb-2 text-primary"
                  onClick={() => handleSort("size")}
                >
                  Size{" "}
                  {sortOrder.column === "size"
                    ? sortOrder.order === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th
                  className="w-[150px] cursor-pointer pb-2 text-right text-primary"
                  onClick={() => handleSort("lastModified")}
                >
                  Last Modified{" "}
                  {sortOrder.column === "lastModified"
                    ? sortOrder.order === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedObjects.map((object, index) => (
                <tr
                  key={index}
                  className="cursor-pointer text-gray-700 hover:bg-secondary"
                  onClick={() => handleCheckboxChange(object.key)}
                >
                  <td className="border-t border-primary py-2">
                    <input
                      type="checkbox"
                      checked={selectedObjects.includes(object.key)}
                      onChange={() => handleCheckboxChange(object.key)}
                    />
                  </td>
                  <td className="border-t border-primary py-2">
                    <a
                      href={generateS3Link(object.key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline"
                    >
                      {object.key}
                    </a>
                  </td>
                  {type === "server" && (
                    <td className="border-t border-primary py-2">
                      <a
                        href={object.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        {extractPath(object.url).split("/").pop()}
                      </a>
                    </td>
                  )}
                  <td className="border-t border-primary py-2 text-primary">
                    {object.sizeInKB} KB
                  </td>
                  <td className="border-t border-primary py-2 text-right text-primary">
                    {object.lastModified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedObjects.length === 0}
            className="ml-auto mt-4 flex rounded bg-button-destroy px-4 py-2 font-bold text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
          >
            Delete Selected
          </button>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() =>
                setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
              }
              disabled={currentPage === 1}
              className="w-[120px] rounded bg-gradient-button px-4 py-2 font-bold text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
            >
              Previous
            </button>
            <div className="w-[200px] text-center text-primary">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="w-[120px] rounded bg-gradient-button px-4 py-2 font-bold text-primary disabled:bg-gradient-button-disabled disabled:text-disabled disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="my-20 text-center text-primary">
          No objects{" "}
          {searchQuery ? (
            <>
              matching <b className="text-secondary">{searchQuery}</b> found in{" "}
            </>
          ) : (
            "found in "
          )}
          <b className="text-secondary">{`${bucket}/${folderPrefix}`}</b>{" "}
          bucket.
        </p>
      )}
    </div>
  );
}

function filterObjectsByPrefix(objects: S3Object[], prefix: string): string[] {
  // Ensure uniqueness
  return objects
    .filter((obj) => obj.key.startsWith(prefix))
    .map((obj) => {
      // Remove prefix
      const path = obj.key;
      // Remove the file name (anything after the last '/')
      const lastSlashIndex = path.lastIndexOf("/");
      if (lastSlashIndex === -1) {
        return ""; // Return empty string if no folder structure exists
      }
      return path.substring(0, lastSlashIndex);
    })
    .filter((folder) => folder !== "") // Remove empty strings
    .filter((folder, index, self) => self.indexOf(folder) === index);
}
