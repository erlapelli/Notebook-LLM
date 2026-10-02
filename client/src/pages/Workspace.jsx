import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

function Workspace() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(`/api/workspaces/${workspaceId}`);

        setWorkspace(data);
      } catch (error) {
        console.error("Workspace fetch error:", error);
        setError("Failed to load workspace.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Loading workspace...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Workspace not found.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {workspace.title}
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          {workspace.description || "Welcome to your learning workspace."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate(`/workspaces/${workspaceId}/sources`)}
          className="text-left"
        >
          <Card className="h-full transition hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-800 dark:hover:bg-purple-950/30">
            <div className="mb-3 text-3xl">📚</div>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sources
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Add documents, websites, and other learning materials.
            </p>

            <p className="mt-4 text-sm font-medium text-purple-600 dark:text-purple-400">
              Open Sources →
            </p>
          </Card>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
          className="text-left"
        >
          <Card className="h-full cursor-pointer transition hover:shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Ask questions about your sources.
            </p>
          </Card>
        </button>

        <Card>
          <div className="mb-3 text-3xl">✨</div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Artifacts
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Generate summaries, quizzes, flashcards, and more.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default Workspace;
