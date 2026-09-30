import Card from "../components/Card";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();

    if (!workspaceTitle.trim()) {
      setError("Workspace title is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const workspace = await apiRequest("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({
          title: workspaceTitle.trim(),
        }),
      });

      setWorkspaces((currentWorkspaces) => [...currentWorkspaces, workspace]);

      setWorkspaceTitle("");
    } catch (error) {
      console.error("Create workspace error:", error);
      setError("Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiRequest("/api/workspaces")
      .then((data) => {
        setWorkspaces(data);
      })
      .catch((error) => {
        console.error("API Error:", error);
      });
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Welcome */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Welcome back 👋
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Continue your learning journey with NotebookLLM.
        </p>
      </div>

      {/* Create Workspace */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create a Workspace
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Create a workspace to organize your learning sources and
          conversations.
        </p>

        <form
          onSubmit={handleCreateWorkspace}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={workspaceTitle}
            onChange={(event) => setWorkspaceTitle(event.target.value)}
            placeholder="Enter workspace title"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
          />

          <Button type="submit">
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Add Sources */}
        <Card>
          <div className="mb-4 text-3xl">📚</div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Sources
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Upload documents or add learning materials to your workspace.
          </p>

          <div className="mt-4">
            <Button>Add Source</Button>
          </div>
        </Card>

        {/* Chat */}
        <Card>
          <div className="mb-4 text-3xl">💬</div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ask NotebookLLM
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Ask questions and learn from your saved sources.
          </p>

          <div className="mt-4">
            <Button>Start Chat</Button>
          </div>
        </Card>

        {/* Create Artifact */}
        <Card>
          <div className="mb-4 text-3xl">✨</div>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Artifact
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Generate summaries, flashcards, quizzes, and more.
          </p>

          <div className="mt-4">
            <Button>Create</Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          Recent Activity
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Your recent learning activity will appear here.
        </p>
      </Card>

      {/* Your Workspaces */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Workspaces
        </h2>

        {workspaces.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No workspaces yet. Create your first workspace above.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {workspaces.map((workspace) => (
              <button
                type="button"
                key={workspace.id}
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
                className="w-full rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-800 dark:hover:bg-purple-950/30"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {workspace.title}
                </h3>

                {workspace.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {workspace.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                  Open workspace →
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
