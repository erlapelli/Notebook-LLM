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
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [error, setError] = useState("");
  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editingWorkspaceTitle, setEditingWorkspaceTitle] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingWorkspaceId, setDeletingWorkspaceId] = useState(null);

  const loadWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      setError("");
      const data = await apiRequest("/api/workspaces");
      setWorkspaces(data);
    } catch (error) {
      console.error("Load workspaces error:", error);
      setError("Failed to load workspaces.");
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

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
        body: JSON.stringify({ title: workspaceTitle.trim() }),
      });

      setWorkspaces((current) => [workspace, ...current]);
      setWorkspaceTitle("");
    } catch (error) {
      console.error("Create workspace error:", error);
      setError("Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (event, workspace) => {
    event.stopPropagation();
    setError("");
    setEditingWorkspaceId(workspace.id);
    setEditingWorkspaceTitle(workspace.title || "");
  };

  const handleCancelEdit = (event) => {
    event.stopPropagation();
    setEditingWorkspaceId(null);
    setEditingWorkspaceTitle("");
  };

  const handleUpdateWorkspace = async (event, workspaceId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editingWorkspaceTitle.trim()) {
      setError("Workspace title is required.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updatedWorkspace = await apiRequest(
        `/api/workspaces/${workspaceId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ title: editingWorkspaceTitle.trim() }),
        },
      );

      setWorkspaces((current) =>
        current.map((workspace) =>
          workspace.id === workspaceId ? updatedWorkspace : workspace,
        ),
      );

      setEditingWorkspaceId(null);
      setEditingWorkspaceTitle("");
    } catch (error) {
      console.error("Update workspace error:", error);
      setError("Failed to update workspace.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteWorkspace = async (event, workspaceId) => {
    event.stopPropagation();

    if (deletingWorkspaceId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this workspace? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeletingWorkspaceId(workspaceId);
      setError("");

      await apiRequest(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      setWorkspaces((current) =>
        current.filter((workspace) => workspace.id !== workspaceId),
      );

      if (editingWorkspaceId === workspaceId) {
        setEditingWorkspaceId(null);
        setEditingWorkspaceTitle("");
      }
    } catch (error) {
      console.error("Delete workspace error:", error);
      setError("Failed to delete workspace.");
    } finally {
      setDeletingWorkspaceId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Welcome back 👋
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Continue your learning journey with NotebookLLM.
        </p>
      </div>

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
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          Recent Activity
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Your recent learning activity will appear here.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Workspaces
        </h2>

        {loadingWorkspaces ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Loading workspaces...
          </p>
        ) : workspaces.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No workspaces yet. Create your first workspace above.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                {editingWorkspaceId === workspace.id ? (
                  <form
                    onSubmit={(event) =>
                      handleUpdateWorkspace(event, workspace.id)
                    }
                    onClick={(event) => event.stopPropagation()}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={editingWorkspaceTitle}
                      onChange={(event) =>
                        setEditingWorkspaceTitle(event.target.value)
                      }
                      autoFocus
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
                    />

                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={savingEdit}>
                        {savingEdit ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={savingEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/workspaces/${workspace.id}`)}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
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
                      </div>

                      <div
                        className="flex shrink-0 gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(event) => handleStartEdit(event, workspace)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={(event) =>
                            handleDeleteWorkspace(event, workspace.id)
                          }
                          disabled={deletingWorkspaceId === workspace.id}
                        >
                          {deletingWorkspaceId === workspace.id
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
