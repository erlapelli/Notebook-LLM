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
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Learning Artifacts
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Generate and review AI-powered learning materials.
        </p>
      </div>

      {/* Create Artifact */}
      <Card className="mb-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create an Artifact
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Choose the type of learning material you want to generate.
          </p>
        </div>

        {/* Artifact type selection */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {artifactTypes.map((artifact) => {
            const isSelected = selectedType === artifact.type;

            return (
              <button
                key={artifact.type}
                type="button"
                onClick={() => setSelectedType(artifact.type)}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200 dark:border-purple-400 dark:bg-purple-950/30 dark:ring-purple-900"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-purple-800 dark:hover:bg-purple-950/20"
                }`}
              >
                <div className="text-2xl">{artifact.icon}</div>

                <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {artifact.title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                  {artifact.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Source selection */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Select Sources
          </h3>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Choose the sources you want to use for this artifact.
          </p>

          {sources.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              No sources available in this workspace.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {sources.map((source) => {
                const isSelected = selectedSourceIds.includes(source.id);

                return (
                  <label
                    key={source.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/30"
                        : "border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedSourceIds((currentIds) => {
                          if (currentIds.includes(source.id)) {
                            return currentIds.filter((id) => id !== source.id);
                          }

                          return [...currentIds, source.id];
                        });
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
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

        {/* Create button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleCreateArtifact}
            disabled={creating}
            className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Artifact"}
          </button>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loading artifacts...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && artifacts.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 text-4xl">📚</div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            No artifacts yet
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Choose an artifact type above to create your first one.
          </p>
        </div>
      )}

      {/* Artifacts */}
      {!loading && artifacts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Your Artifacts
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((artifact) => (
              <Card
                key={artifact.id}
                onClick={() => handleArtifactClick(artifact.id)}
                className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="text-3xl">
                    {artifact.type === "SUMMARY" && "📝"}
                    {artifact.type === "TAKEAWAYS" && "💡"}
                    {artifact.type === "FLASHCARDS" && "🧠"}
                    {artifact.type === "QUIZ" && "❓"}
                    {artifact.type === "MINDMAP" && "🗺️"}
                    {artifact.type === "REPORT" && "📊"}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
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

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {artifact.title}
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {artifact.type}
                </p>

                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                  Created {new Date(artifact.createdAt).toLocaleDateString()}
                </p>

                <p className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400">
                  View artifact →
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Artifacts;
