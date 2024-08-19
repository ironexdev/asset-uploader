import { useState, useEffect } from "react";
import { toast } from "sonner";

interface S3Object {
  url: string;
  key: string;
  sizeInKB: number;
  lastModified: string;
}

interface S3ObjectData {
  objects: S3Object[];
}

export default function ObjectList() {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<{
    column: "name" | "size" | "lastModified";
    order: "asc" | "desc";
  }>({ column: "lastModified", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

    fetchObjects().catch((err) => {
      toast.error(`Unexpected error: ${(err as Error).message}`);
    });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFolder(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (column: "name" | "size" | "lastModified") => {
    setSortOrder((prevOrder) => ({
      column,
      order:
        prevOrder.column === column && prevOrder.order === "asc"
          ? "desc"
          : "asc",
    }));
  };

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
    if (sortOrder.column === "name") {
      return sortOrder.order === "asc"
        ? a.key.localeCompare(b.key)
        : b.key.localeCompare(a.key);
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

  const totalPages = Math.ceil(filteredObjects.length / itemsPerPage);

  const uniqueFolders = Array.from(
    new Set(
      objects.map((object) => {
        const segments = object.key.split("/");
        if (segments[0] === "assets") {
          if (segments[1] === "images" && segments.length > 2) {
            return `assets/images/${segments[2]}`;
          } else if (segments[1] !== "images") {
            return null; // Skip the "assets" folder itself
          }
        }
        return segments[0];
      }),
    ),
  ).filter((folder) => folder !== null);

  return (
    <div className="rounded-lg border-[1px] border-[#EEEEEE] bg-white p-4">
      <h2 className="text-lg font-bold">S3 Object List</h2>

      <div className="mt-4 flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="rounded border p-2"
        />
        <select
          value={selectedFolder || ""}
          onChange={handleFolderChange}
          className="ml-2 rounded border p-2"
        >
          <option value="">All Folders</option>
          {uniqueFolders.map((folder, index) => (
            <option key={index} value={folder}>
              {folder}
            </option>
          ))}
        </select>
      </div>

      {paginatedObjects.length > 0 ? (
        <table className="mt-4 w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-700">
              <th
                className="cursor-pointer pb-2"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortOrder.column === "name"
                  ? sortOrder.order === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th
                className="w-20 cursor-pointer pb-2"
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
                className="w-32 cursor-pointer pb-2"
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
                <td className="w-20 border-t py-2">{object.sizeInKB} KB</td>
                <td className="w-32 border-t py-2">{object.lastModified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4 text-sm text-gray-500">No objects found.</p>
      )}

      <div className="mt-4 flex justify-between">
        <button
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
          }
          disabled={currentPage === 1}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
