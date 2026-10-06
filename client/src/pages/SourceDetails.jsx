import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/Button";
import { deleteSource, getSource } from "../services/api";

function SourceDetails() {
  const { workspaceId, sourceId } = useParams();
  const navigate = useNavigate();

  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    async function fetchSource() {
      try {
        const data = await getSource(workspaceId, sourceId);

        if (cancelled) return;

        setSource(data);
        setError("");
        setLoading(false);

        if (data.status === "PENDING" || data.status === "PROCESSING") {
          timeoutId = setTimeout(() => {
            fetchSource();
          }, 3000);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Source details error:", error);
        setError("Failed to load source.");
        setLoading(false);
      }
    }

    fetchSource();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [workspaceId, sourceId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this source?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteSource(workspaceId, sourceId);

      navigate(`/workspaces/${workspaceId}/sources`);
    } catch (error) {
      console.error("Source delete error:", error);
      setError("Failed to delete source.");
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          description: "This source is waiting to be processed.",
          className:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
          dotClass: "bg-amber-500",
        };

      case "PROCESSING":
        return {
          label: "Processing",
          description: "This source is currently being processed for AI.",
          className:
            "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
          dotClass: "bg-blue-500",
        };

      case "READY":
        return {
          label: "Ready",
          description: "This source has been processed and is ready for AI.",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
          dotClass: "bg-emerald-500",
        };

      case "FAILED":
        return {
          label: "Failed",
          description: "Processing failed for this source.",
          className:
            "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300",
          dotClass: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          description: "The source status is currently unavailable.",
          className:
            "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
          dotClass: "bg-gray-400",
        };
    }
  };

  const getSourceIcon = (type) => {
    const normalized = String(type || "").toUpperCase();

    if (normalized === "PDF") return "PDF";
    if (normalized === "WEBSITE") return "WEB";
    if (normalized === "YOUTUBE") return "YT";
    if (normalized === "MARKDOWN") return "MD";
    return "TXT";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-6 sm:p-8">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-8 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="mt-3 h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-800/70" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-64 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" />
            <div className="h-64 rounded-2xl border border-gray-200 bg-white lg:col-span-2 dark:border-gray-800 dark:bg-gray-900" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !source) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h1 className="font-semibold text-red-900 dark:text-red-200">
                  Unable to load source
                </h1>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
                  className="mt-4 text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
                >
                  Back to Sources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              SRC
            </div>

            <h1 className="mt-4 text-lg font-semibold text-gray-950 dark:text-white">
              Source not found
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This source may have been deleted or is no longer available.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
              className="mt-5 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              ← Back to Sources
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(source.status);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-purple-100 blur-3xl dark:bg-purple-950/40" />

          <div className="relative p-5 sm:p-7">
            <button
              type="button"
              onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:text-gray-400 dark:hover:text-purple-400"
            >
              <span aria-hidden="true">←</span>
              Back to Sources
            </button>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-xs font-bold tracking-wide text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  {getSourceIcon(source.type)}
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                    {source.title || "Untitled Source"}
                  </h1>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Source details and content
                  </p>
                </div>
              </div>

              <Button variant="outline" onClick={handleDelete}>
                Delete Source
              </Button>
            </div>
          </div>
        </section>

        {/* Information */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
              Source information
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Details about this learning source and its processing state.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Type
              </p>
              <p className="mt-2 font-semibold text-gray-950 dark:text-white">
                {source.type || "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Status
              </p>

              <div
                className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusDetails.className}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusDetails.dotClass}`}
                />
                {statusDetails.label}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Created
              </p>
              <p className="mt-2 font-semibold text-gray-950 dark:text-white">
                {source.createdAt
                  ? new Date(source.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div
            className={`mt-5 rounded-xl border p-4 ${statusDetails.className}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusDetails.dotClass}`}
              />
              <div>
                <p className="text-sm font-semibold">{statusDetails.label}</p>
                <p className="mt-1 text-sm leading-6 opacity-90">
                  {statusDetails.description}
                </p>
              </div>
            </div>
          </div>

          {source.url && (
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Source URL
              </p>

              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-purple-600 transition hover:border-purple-200 hover:bg-purple-50 hover:underline dark:border-gray-800 dark:bg-gray-800/50 dark:text-purple-400 dark:hover:border-purple-900/70 dark:hover:bg-purple-950/20"
              >
                {source.url}
              </a>
            </div>
          )}
        </section>

        {/* Inline error */}
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

        {/* Content */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
              Source content
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The content currently stored for this source.
            </p>
          </div>

          {source.content ? (
            <div className="max-h-[600px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950 sm:p-5">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-gray-700 dark:text-gray-300">
                {source.content}
              </pre>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center dark:border-gray-700 dark:bg-gray-800/40">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                —
              </div>

              <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                No source content is available yet.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Content may become available after processing is complete.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SourceDetails;
