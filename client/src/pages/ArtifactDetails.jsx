import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";
import { getArtifact, deleteArtifact } from "../services/api";

function ArtifactDetails() {
  const { workspaceId, artifactId } = useParams();
  const navigate = useNavigate();

  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadArtifact = async () => {
      if (!workspaceId || !artifactId) {
        setError("Artifact not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getArtifact(workspaceId, artifactId);

        setArtifact(data);
      } catch (error) {
        console.error("Failed to load artifact:", error);
        setError("Failed to load artifact.");
      } finally {
        setLoading(false);
      }
    };

    loadArtifact();
  }, [workspaceId, artifactId]);

  const handleDeleteArtifact = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this artifact?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteArtifact(workspaceId, artifactId);

      navigate(`/workspaces/${workspaceId}/artifacts`);
    } catch (error) {
      console.error("Failed to delete artifact:", error);
      setError("Failed to delete artifact.");
      setDeleting(false);
    }
  };

  const getArtifactIcon = (type) => {
    switch (type) {
      case "SUMMARY":
        return "📝";
      case "TAKEAWAYS":
        return "💡";
      case "FLASHCARDS":
        return "🧠";
      case "QUIZ":
        return "❓";
      case "MINDMAP":
        return "🗺️";
      case "REPORT":
        return "📊";
      default:
        return "📚";
    }
  };

  const renderContent = () => {
    if (!artifact?.content) {
      return (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No generated content available yet.
        </p>
      );
    }

    const content = artifact.content;

    switch (artifact.type) {
      case "SUMMARY":
        return (
          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
            {content.markdown}
          </div>
        );

      case "TAKEAWAYS":
        return (
          <ul className="space-y-3">
            {content.items?.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-gray-700 dark:text-gray-300"
              >
                <span className="font-semibold text-purple-600">
                  {index + 1}.
                </span>

                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case "FLASHCARDS":
        return (
          <div className="space-y-4">
            {content.cards?.map((card, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Question {index + 1}
                </p>

                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {card.front}
                </p>

                <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Answer
                </p>

                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {card.back}
                </p>
              </div>
            ))}
          </div>
        );

      case "QUIZ":
        return (
          <div className="space-y-6">
            {content.questions?.map((question, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-5 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {index + 1}. {question.question}
                </h3>

                <div className="mt-4 space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`rounded-lg border p-3 text-sm ${
                        optionIndex === question.correctIndex
                          ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
                          : "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Explanation:</span>{" "}
                    {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case "MINDMAP":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Concepts
              </h3>

              <div className="flex flex-wrap gap-3">
                {content.nodes?.map((node) => (
                  <div
                    key={node.id}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300"
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Relationships
              </h3>

              <div className="space-y-2">
                {content.edges?.map((edge) => {
                  const sourceNode = content.nodes?.find(
                    (node) => node.id === edge.source,
                  );

                  const targetNode = content.nodes?.find(
                    (node) => node.id === edge.target,
                  );

                  return (
                    <div
                      key={edge.id}
                      className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300"
                    >
                      {sourceNode?.label || edge.source}

                      <span className="mx-2 text-gray-400">→</span>

                      {targetNode?.label || edge.target}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "REPORT":
        return (
          <div className="space-y-6">
            {content.markdown && (
              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
                {content.markdown}
              </div>
            )}

            {content.sections?.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <pre className="overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
            {JSON.stringify(content, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Back button + Delete button */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`/workspaces/${workspaceId}/artifacts`)}
          className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
        >
          ← Back to Artifacts
        </button>

        <button
          type="button"
          onClick={handleDeleteArtifact}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {deleting ? "Deleting..." : "Delete Artifact"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loading artifact...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Artifact */}
      {!loading && !error && artifact && (
        <>
          {/* Header */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="text-4xl">{getArtifactIcon(artifact.type)}</div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {artifact.title}
                  </h1>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {artifact.type}
                  </p>

                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    Created {new Date(artifact.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
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
          </Card>

          {/* Content */}
          <div className="mt-6">
            <Card>
              <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
                Generated Content
              </h2>

              {artifact.status === "READY" ? (
                renderContent()
              ) : artifact.status === "PROCESSING" ||
                artifact.status === "PENDING" ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your artifact is still being generated. Please check again
                  shortly.
                </p>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Artifact generation failed.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default ArtifactDetails;
