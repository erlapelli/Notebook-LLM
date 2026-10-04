import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";
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

        if (cancelled) {
          return;
        }

        setSource(data);
        setError("");
        setLoading(false);

        // Continue polling only while the source
        // is still being processed.
        if (data.status === "PENDING" || data.status === "PROCESSING") {
          timeoutId = setTimeout(() => {
            fetchSource();
          }, 3000);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Source details error:", error);

        setError("Failed to load source.");
        setLoading(false);
      }
    }

    // Initial request
    fetchSource();

    // Cleanup when leaving the page
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

    if (!confirmed) {
      return;
    }

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
            "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-400",
          icon: "🟡",
        };

      case "PROCESSING":
        return {
          label: "Processing",
          description: "This source is currently being processed for AI.",
          className:
            "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400",
          icon: "🔵",
        };

      case "READY":
        return {
          label: "Ready",
          description: "This source has been processed and is ready for AI.",
          className:
            "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400",
          icon: "🟢",
        };

      case "FAILED":
        return {
          label: "Failed",
          description: "Processing failed for this source.",
          className:
            "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400",
          icon: "🔴",
        };

      default:
        return {
          label: status || "Unknown",
          description: "The source status is currently unavailable.",
          className:
            "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400",
          icon: "⚪",
        };
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading source...</p>
      </div>
    );
  }

  if (error && !source) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
        >
          ← Back to Sources
        </Button>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400">Source not found.</p>
      </div>
    );
  }

  const statusDetails = getStatusDetails(source.status);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
            className="mb-3 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            ← Back to Sources
          </button>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {source.title || "Untitled Source"}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Source details and content
          </p>
        </div>

        <Button variant="outline" onClick={handleDelete}>
          Delete Source
        </Button>
      </div>

      {/* Source Information */}
      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Source Information
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Type */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>

            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {source.type || "N/A"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${statusDetails.className}`}
            >
              <span>{statusDetails.icon}</span>

              <span>{statusDetails.label}</span>
            </div>
          </div>

          {/* Created */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>

            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {source.createdAt
                ? new Date(source.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`mt-5 rounded-lg border p-4 ${statusDetails.className}`}
        >
          <p className="text-sm font-medium">{statusDetails.description}</p>
        </div>

        {/* URL */}
        {source.url && (
          <div className="mt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Source URL
            </p>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-sm text-purple-600 hover:underline dark:text-purple-400"
            >
              {source.url}
            </a>
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Source Content */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Source Content
        </h2>

        {source.content ? (
          <div className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-gray-700 dark:text-gray-300">
              {source.content}
            </pre>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No source content is available yet.
          </p>
        )}
      </Card>
    </div>
  );
}

export default SourceDetails;
