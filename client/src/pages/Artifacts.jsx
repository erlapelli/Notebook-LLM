import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";

import {
  getArtifacts,
  createArtifact,
  getWorkspaceSources,
} from "../services/api";

function Artifacts() {
  const { workspaceId } = useParams();

  const navigate = useNavigate();

  const [artifacts, setArtifacts] = useState([]);

  const [sources, setSources] = useState([]);

  const [selectedSourceIds, setSelectedSourceIds] = useState([]);

  const [selectedType, setSelectedType] = useState("SUMMARY");

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const artifactTypes = [
    {
      type: "SUMMARY",

      icon: "📝",

      title: "Summary",

      description: "Create a concise summary of your learning sources.",
    },

    {
      type: "TAKEAWAYS",

      icon: "💡",

      title: "Takeaways",

      description: "Extract the most important points from your sources.",
    },

    {
      type: "FLASHCARDS",

      icon: "🧠",

      title: "Flashcards",

      description: "Create flashcards to reinforce your learning.",
    },

    {
      type: "QUIZ",

      icon: "❓",

      title: "Quiz",

      description: "Test your understanding with AI-generated questions.",
    },

    {
      type: "MINDMAP",

      icon: "🗺️",

      title: "Mind Map",

      description: "Visualize relationships between important concepts.",
    },

    {
      type: "REPORT",

      icon: "📊",

      title: "Report",

      description: "Generate a detailed report from your sources.",
    },
  ];

  const loadArtifacts = async () => {
    if (!workspaceId) {
      setError("Workspace not found.");

      return;
    }

    try {
      const data = await getArtifacts(workspaceId);

      setArtifacts(data);
    } catch (error) {
      console.error("Failed to load artifacts:", error);

      setError("Failed to load artifacts.");
    }
  };

  // Initial artifact and source loading

  useEffect(() => {
    const loadInitialData = async () => {
      if (!workspaceId) {
        setError("Workspace not found.");

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError("");

        const [artifactData, sourceData] = await Promise.all([
          getArtifacts(workspaceId),

          getWorkspaceSources(workspaceId),
        ]);

        setArtifacts(artifactData);

        setSources(sourceData);
      } catch (error) {
        console.error("Failed to load artifacts and sources:", error);

        setError("Failed to load artifacts and sources.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [workspaceId]);

  // Automatically check artifact status

  useEffect(() => {
    const hasProcessingArtifacts = artifacts.some(
      (artifact) =>
        artifact.status === "PENDING" || artifact.status === "PROCESSING",
    );

    if (!hasProcessingArtifacts) {
      return;
    }

    const intervalId = setInterval(() => {
      loadArtifacts();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [artifacts, workspaceId]);

  const handleCreateArtifact = async () => {
    if (!workspaceId) {
      setError("Workspace not found.");

      return;
    }

    try {
      setCreating(true);

      setError("");

      const newArtifact = await createArtifact(workspaceId, {
        type: selectedType,

        sourceIds: selectedSourceIds,
      });

      setArtifacts((currentArtifacts) => [newArtifact, ...currentArtifacts]);

      // Clear selected sources after creating the artifact

      setSelectedSourceIds([]);
    } catch (error) {
      console.error("Failed to create artifact:", error);

      setError("Failed to create artifact.");
    } finally {
      setCreating(false);
    }
  };

  const handleArtifactClick = (artifactId) => {
    navigate(`/workspaces/${workspaceId}/artifacts/${artifactId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-3 pb-8 pt-6 dark:bg-gray-950 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(`/workspaces/${workspaceId}`)}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Back to Workspace
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                Learning Artifacts
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
                Generate and review AI-powered learning materials.
              </p>
            </div>

            <div className="hidden shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 sm:block">
              {artifacts.length}{" "}
              {artifacts.length === 1 ? "artifact" : "artifacts"}
            </div>
          </div>
        </div>

        {/* Create Artifact */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
              Create an Artifact
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Choose the learning material you want to generate.
            </p>
          </div>

          {/* Artifact types */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artifactTypes.map((artifact) => {
              const isSelected = selectedType === artifact.type;

              return (
                <button
                  key={artifact.type}
                  type="button"
                  onClick={() => setSelectedType(artifact.type)}
                  className={`group rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100 dark:border-purple-400 dark:bg-purple-950/30 dark:ring-purple-950"
                      : "border-gray-200 bg-gray-50/70 hover:border-purple-300 hover:bg-purple-50/70 dark:border-gray-800 dark:bg-gray-950/50 dark:hover:border-purple-800 dark:hover:bg-purple-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                        isSelected
                          ? "bg-purple-100 dark:bg-purple-950/70"
                          : "bg-white dark:bg-gray-900"
                      }`}
                    >
                      {artifact.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-950 dark:text-white">
                        {artifact.title}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                        {artifact.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      {artifact.type}
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Source selection */}
          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-800">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h3 className="text-sm font-semibold text-gray-950 dark:text-white">
                  Select Sources
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose the sources you want to use for this artifact.
                </p>
              </div>

              {selectedSourceIds.length > 0 && (
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  {selectedSourceIds.length} source
                  {selectedSourceIds.length === 1 ? "" : "s"} selected
                </span>
              )}
            </div>

            {sources.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-950/50">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  No sources available
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Add sources to this workspace before creating an artifact.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sources.map((source) => {
                  const isSelected = selectedSourceIds.includes(source.id);

                  return (
                    <label
                      key={source.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                          : "border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-purple-800 dark:hover:bg-gray-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedSourceIds((currentIds) => {
                            if (currentIds.includes(source.id)) {
                              return currentIds.filter(
                                (id) => id !== source.id,
                              );
                            }

                            return [...currentIds, source.id];
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {source.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {source.type}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedSourceIds.length === 0
                ? "No specific sources selected."
                : "The selected sources will be used to generate your artifact."}
            </p>

            <button
              type="button"
              onClick={handleCreateArtifact}
              disabled={creating}
              className="w-full rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {creating ? "Creating..." : "Create Artifact"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && artifacts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl text-purple-600 dark:bg-purple-950/50 dark:text-purple-300">
              ✦
            </div>

            <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
              No artifacts yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
              Choose an artifact type above and create your first learning
              material.
            </p>
          </div>
        )}

        {/* Artifacts */}
        {!loading && artifacts.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Your Artifacts
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Open an artifact to view its generated content.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {artifacts.map((artifact) => {
                const artifactMeta = artifactTypes.find(
                  (item) => item.type === artifact.type,
                );

                return (
                  <button
                    key={artifact.id}
                    type="button"
                    onClick={() => handleArtifactClick(artifact.id)}
                    className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl dark:bg-purple-950/40">
                        {artifactMeta?.icon || "✦"}
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          artifact.status === "READY"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : artifact.status === "FAILED"
                              ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                        }`}
                      >
                        {artifact.status}
                      </span>
                    </div>

                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-950 dark:text-white">
                      {artifact.title}
                    </h2>

                    <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {artifactMeta?.title || artifact.type}
                    </p>

                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      Created{" "}
                      {new Date(artifact.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        View artifact
                      </span>
                      <span className="text-purple-500 transition-transform group-hover:translate-x-1 dark:text-purple-400">
                        →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Artifacts;
