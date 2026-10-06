import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
      if (cancelled) return;

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

    if (!file) return;

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

    if (!confirmed) return;

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
    if (selectedSourceIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedSourceIds.length} selected source${
        selectedSourceIds.length > 1 ? "s" : ""
      }?`,
    );

    if (!confirmed) return;

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

  const sourceTypeOptions = [
    {
      type: "PDF",
      label: "PDF",
      description: "Upload a document",
      icon: "PDF",
    },
    {
      type: "WEBSITE",
      label: "Website",
      description: "Import a webpage",
      icon: "WEB",
    },
    {
      type: "YOUTUBE",
      label: "YouTube",
      description: "Import a transcript",
      icon: "YT",
    },
    {
      type: "TEXT",
      label: "Text",
      description: "Add plain text",
      icon: "TXT",
    },
    {
      type: "MARKDOWN",
      label: "Markdown",
      description: "Add Markdown",
      icon: "MD",
    },
  ];

  const getStatusClasses = (status) => {
    if (status === "COMPLETED" || status === "READY") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300";
    }

    if (status === "FAILED" || status === "ERROR") {
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300";
    }

    if (status === "PROCESSING" || status === "PENDING") {
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300";
    }

    return "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  const getSourceIcon = (type) => {
    const normalized = String(type || "").toUpperCase();

    if (normalized === "PDF") return "PDF";
    if (normalized === "WEBSITE") return "WEB";
    if (normalized === "YOUTUBE") return "YT";
    if (normalized === "MARKDOWN") return "MD";
    return "TXT";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-purple-100 blur-3xl dark:bg-purple-950/40" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => navigate(`/workspaces/${workspaceId}`)}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:text-gray-400 dark:hover:text-purple-400"
              >
                <span aria-hidden="true">←</span>
                Workspace
              </button>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  SRC
                </div>

                <div className="min-w-0">
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Learning materials
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                    Sources
                  </h1>

                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
                    Manage the documents, websites, videos, and notes used by
                    this workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
        </section>

        {/* Add source */}
        {showAddSource && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-7">
              <h2 className="text-xl font-semibold text-gray-950 dark:text-white">
                Add a source
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how you want to bring learning material into this
                workspace.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {sourceTypeOptions.map((option) => {
                  const active = sourceType === option.type;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handleSourceTypeChange(option.type)}
                      className={`rounded-xl border p-4 text-left outline-none transition ${
                        active
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/10 dark:border-purple-500 dark:bg-purple-950/30"
                          : "border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-white focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:border-gray-800 dark:bg-gray-800/60 dark:hover:border-purple-900/70 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold tracking-wide ${
                          active
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option.icon}
                      </div>

                      <div className="mt-3 font-semibold text-gray-950 dark:text-white">
                        {option.label}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                {sourceType === "PDF" && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center dark:border-gray-700 dark:bg-gray-800/40">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      PDF
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-950 dark:text-white">
                      Upload a PDF
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
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
                  <form onSubmit={handleCreateSource} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {sourceType === "WEBSITE"
                          ? "Website URL"
                          : "YouTube URL"}
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
                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:bg-gray-800"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Enter a title"
                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:bg-gray-800"
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
                  <form onSubmit={handleCreateSource} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title
                      </label>

                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={
                          sourceType === "TEXT"
                            ? "My Notes"
                            : "My Markdown Notes"
                        }
                        className="min-h-11 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:bg-gray-800"
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
                        className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm leading-6 text-gray-950 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:bg-gray-800"
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
              </div>
            </div>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
                  <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="mt-6 h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="mt-3 h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="mt-8 h-9 w-full rounded-lg bg-gray-100 dark:bg-gray-800/70" />
              </div>
            ))}
          </section>
        )}

        {/* Empty */}
        {!loading && sources.length === 0 && (
          <section className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              SRC
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-950 dark:text-white sm:text-xl">
              No sources yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Add a PDF, website, YouTube video, text, or Markdown source to
              start learning.
            </p>

            <div className="mt-5">
              <Button onClick={() => setShowAddSource(true)}>
                + Add your first source
              </Button>
            </div>
          </section>
        )}

        {/* Sources */}
        {!loading && sources.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
                  Your sources
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {sources.length} {sources.length === 1 ? "source" : "sources"}{" "}
                  in this workspace
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={
                      sources.length > 0 &&
                      selectedSourceIds.length === sources.length
                    }
                    onChange={handleSelectAll}
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                  />
                  <span>Select all</span>
                </label>

                {selectedSourceIds.length > 0 && (
                  <Button variant="outline" onClick={handleBulkDelete}>
                    Delete selected ({selectedSourceIds.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sources.map((source) => (
                <article
                  key={source.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(`/workspaces/${workspaceId}/sources/${source.id}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(
                        `/workspaces/${workspaceId}/sources/${source.id}`,
                      );
                    }
                  }}
                  className="group flex min-h-56 cursor-pointer flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm outline-none transition duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[10px] font-bold tracking-wide text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                        {getSourceIcon(source.type)}
                      </div>

                      <h2 className="truncate font-semibold text-gray-950 dark:text-white">
                        {source.title || "Untitled Source"}
                      </h2>
                    </div>

                    <input
                      type="checkbox"
                      checked={selectedSourceIds.includes(source.id)}
                      onChange={() => handleToggleSource(source.id)}
                      onClick={(event) => event.stopPropagation()}
                      className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      aria-label={`Select ${source.title || "source"}`}
                    />
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Type
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {source.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          source.status,
                        )}`}
                      >
                        {source.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      View source →
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
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default WorkspaceSources;
