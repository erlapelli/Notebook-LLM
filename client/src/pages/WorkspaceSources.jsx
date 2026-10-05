import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";
import Button from "../components/Button";
import { apiRequest, bulkDeleteSources, deleteSource } from "../services/api";

function WorkspaceSources() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceType, setSourceType] = useState("PDF");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadSources = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(`/api/workspaces/${workspaceId}/sources`);

        if (!cancelled) {
          setSources(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Sources fetch error:", error);
          setError("Failed to load sources.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSources();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    const hasProcessingSources = sources.some(
      (source) => source.status === "PENDING" || source.status === "PROCESSING",
    );

    if (!hasProcessingSources) {
      return;
    }

    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      if (cancelled) {
        return;
      }

      try {
        const data = await apiRequest(`/api/workspaces/${workspaceId}/sources`);

        if (!cancelled) {
          setSources(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Source status refresh error:", error);
        }
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [workspaceId, sources]);

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
      setShowAddSource(false);
    } catch (error) {
      console.error("PDF upload error:", error);
      setError(error.message || "Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSource = async (event) => {
    event.preventDefault();

    try {
      setUploading(true);
      setError("");

      let createdSource;

      if (sourceType === "WEBSITE") {
        if (!url.trim()) {
          setError("Please enter a website URL.");
          setUploading(false);
          return;
        }

        createdSource = await apiRequest(
          `/api/workspaces/${workspaceId}/sources/import/website`,
          {
            method: "POST",
            body: JSON.stringify({
              url: url.trim(),
              title: title.trim() || undefined,
            }),
          },
        );
      }

      if (sourceType === "YOUTUBE") {
        if (!url.trim()) {
          setError("Please enter a YouTube URL.");
          setUploading(false);
          return;
        }

        createdSource = await apiRequest(
          `/api/workspaces/${workspaceId}/sources/import/youtube`,
          {
            method: "POST",
            body: JSON.stringify({
              url: url.trim(),
              title: title.trim() || undefined,
            }),
          },
        );
      }

      if (sourceType === "TEXT" || sourceType === "MARKDOWN") {
        if (!title.trim()) {
          setError("Please enter a title.");
          setUploading(false);
          return;
        }

        if (!content.trim()) {
          setError("Please enter some content.");
          setUploading(false);
          return;
        }

        createdSource = await apiRequest(
          `/api/workspaces/${workspaceId}/sources`,
          {
            method: "POST",
            body: JSON.stringify({
              type: sourceType,
              title: title.trim(),
              content,
            }),
          },
        );
      }

      if (createdSource) {
        setSources((currentSources) => [createdSource, ...currentSources]);
      }

      setTitle("");
      setUrl("");
      setContent("");
      setShowAddSource(false);
    } catch (error) {
      console.error("Source creation error:", error);
      setError(error.message || "Failed to create source.");
    } finally {
      setUploading(false);
    }
  };

  const handleSourceTypeChange = (type) => {
    setSourceType(type);
    setTitle("");
    setUrl("");
    setContent("");
    setError("");
  };

  const handleToggleSource = (sourceId) => {
    setSelectedSourceIds((currentIds) =>
      currentIds.includes(sourceId)
        ? currentIds.filter((id) => id !== sourceId)
        : [...currentIds, sourceId],
    );
  };

  const handleSelectAll = () => {
    if (selectedSourceIds.length === sources.length) {
      setSelectedSourceIds([]);
      return;
    }

    setSelectedSourceIds(sources.map((source) => source.id));
  };

  const handleDeleteSource = async (sourceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this source?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteSource(workspaceId, sourceId);

      setSources((currentSources) =>
        currentSources.filter((source) => source.id !== sourceId),
      );

      setSelectedSourceIds((currentIds) =>
        currentIds.filter((id) => id !== sourceId),
      );
    } catch (error) {
      console.error("Source delete error:", error);
      setError("Failed to delete source.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSourceIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSourceIds.length} selected source${
        selectedSourceIds.length > 1 ? "s" : ""
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await bulkDeleteSources(workspaceId, selectedSourceIds);

      setSources((currentSources) =>
        currentSources.filter(
          (source) => !selectedSourceIds.includes(source.id),
        ),
      );

      setSelectedSourceIds([]);
    } catch (error) {
      console.error("Bulk source delete error:", error);
      setError("Failed to delete selected sources.");
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
          <Button onClick={() => setShowAddSource((value) => !value)}>
            {showAddSource ? "Close" : "+ Add Source"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/workspaces/${workspaceId}`)}
          >
            ← Back
          </Button>
        </div>
      </div>

      {showAddSource && (
        <Card className="mb-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Source
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose how you want to add learning material.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <button
              type="button"
              onClick={() => handleSourceTypeChange("PDF")}
              className={`rounded-lg border p-4 text-left transition ${
                sourceType === "PDF"
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="text-2xl">📄</div>
              <div className="mt-2 font-medium text-gray-900 dark:text-white">
                PDF
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload a PDF
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTypeChange("WEBSITE")}
              className={`rounded-lg border p-4 text-left transition ${
                sourceType === "WEBSITE"
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="text-2xl">🌐</div>
              <div className="mt-2 font-medium text-gray-900 dark:text-white">
                Website
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Import a webpage
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTypeChange("YOUTUBE")}
              className={`rounded-lg border p-4 text-left transition ${
                sourceType === "YOUTUBE"
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="text-2xl">▶️</div>
              <div className="mt-2 font-medium text-gray-900 dark:text-white">
                YouTube
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Import a video transcript
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTypeChange("TEXT")}
              className={`rounded-lg border p-4 text-left transition ${
                sourceType === "TEXT"
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="text-2xl">📝</div>
              <div className="mt-2 font-medium text-gray-900 dark:text-white">
                Text
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add plain text
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSourceTypeChange("MARKDOWN")}
              className={`rounded-lg border p-4 text-left transition ${
                sourceType === "MARKDOWN"
                  ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                  : "border-gray-200 bg-white hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <div className="text-2xl">📋</div>
              <div className="mt-2 font-medium text-gray-900 dark:text-white">
                Markdown
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add Markdown content
              </div>
            </button>
          </div>

          {sourceType === "PDF" && (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <div className="mb-3 text-4xl">📄</div>

              <h3 className="font-semibold text-gray-900 dark:text-white">
                Upload PDF
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Select a PDF file to add it to this workspace.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleUploadPdf}
                className="hidden"
              />

              <div className="mt-5">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose PDF"}
                </Button>
              </div>
            </div>
          )}

          {(sourceType === "WEBSITE" || sourceType === "YOUTUBE") && (
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {sourceType === "WEBSITE" ? "Website URL" : "YouTube URL"}
                </label>

                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={
                    sourceType === "WEBSITE"
                      ? "https://example.com"
                      : "https://www.youtube.com/watch?v=..."
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter a title"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-900"
                />
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading
                  ? "Importing..."
                  : sourceType === "WEBSITE"
                    ? "Import Website"
                    : "Import YouTube"}
              </Button>
            </form>
          )}

          {(sourceType === "TEXT" || sourceType === "MARKDOWN") && (
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={
                    sourceType === "TEXT" ? "My Notes" : "My Markdown Notes"
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={10}
                  placeholder={
                    sourceType === "TEXT"
                      ? "Paste your text here..."
                      : "# Heading\n\nWrite your Markdown content here..."
                  }
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <Button type="submit" disabled={uploading}>
                {uploading
                  ? "Creating..."
                  : sourceType === "TEXT"
                    ? "Create Text Source"
                    : "Create Markdown Source"}
              </Button>
            </form>
          )}
        </Card>
      )}

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

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Add a PDF, website, YouTube video, text, or Markdown source to
              start learning.
            </p>
          </div>
        </Card>
      )}

      {!loading && sources.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={
                  sources.length > 0 &&
                  selectedSourceIds.length === sources.length
                }
                onChange={handleSelectAll}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />

              <span>Select All</span>
            </label>

            {selectedSourceIds.length > 0 && (
              <Button variant="outline" onClick={handleBulkDelete}>
                Delete Selected ({selectedSourceIds.length})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <Card
                key={source.id}
                onClick={() =>
                  navigate(`/workspaces/${workspaceId}/sources/${source.id}`)
                }
                className="cursor-pointer transition hover:border-purple-300 hover:bg-purple-50 hover:shadow-md dark:hover:border-purple-800 dark:hover:bg-purple-950/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {source.title || "Untitled Source"}
                  </h2>

                  <input
                    type="checkbox"
                    checked={selectedSourceIds.includes(source.id)}
                    onChange={() => handleToggleSource(source.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    aria-label={`Select ${source.title || "source"}`}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Type: {source.type}
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Status: {source.status}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    View Source →
                  </span>

                  <Button
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteSource(source.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default WorkspaceSources;
