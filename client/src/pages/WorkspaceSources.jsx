import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import { apiRequest } from "../services/api";

function WorkspaceSources() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(`/api/workspaces/${workspaceId}/sources`);

      setSources(data);
    } catch (error) {
      console.error("Sources fetch error:", error);
      setError("Failed to load sources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [workspaceId]);

  const handleUploadPdf = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/sources/upload`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.error("Backend upload error:", errorData);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Upload failed: ${response.status}`,
        );
      }

      const uploadedSource = await response.json();

      setSources((currentSources) => [uploadedSource, ...currentSources]);

      event.target.value = "";
    } catch (error) {
      console.error("PDF upload error:", error);
      setError("Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Sources
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
            Manage the learning materials in this workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUploadPdf}
            className="hidden"
          />

          <Button onClick={() => fileInputRef.current?.click()}>
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/workspaces/${workspaceId}`)}
          >
            ← Back
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loading sources...
          </p>
        </Card>
      )}

      {!loading && sources.length === 0 && (
        <Card>
          <div className="px-2 py-8 text-center sm:px-6 sm:py-10">
            <div className="mb-4 text-4xl">📚</div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              No sources yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
              Upload a PDF to start learning.
            </p>
          </div>
        </Card>
      )}

      {!loading && sources.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {source.title || "Untitled Source"}
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Type: {source.type}
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Status: {source.status}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkspaceSources;
