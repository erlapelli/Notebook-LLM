import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import { apiRequest } from "../services/api";

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
          body: JSON.stringify({
            title: editingWorkspaceTitle.trim(),
          }),
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
    <div className="mx-auto w-full max-w-7xl px-1 sm:px-2">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-purple-100 blur-3xl dark:bg-purple-950/40" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            Your learning workspace
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            Welcome back <span aria-hidden="true">👋</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Create a workspace to bring your sources, conversations, memories,
            and learning artifacts together in one place.
          </p>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                Create a workspace
              </h2>
              <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                Give your learning project a name and start organizing
                everything in one place.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleCreateWorkspace}
          className="flex flex-col gap-3 p-5 sm:flex-row sm:p-6"
        >
          <label htmlFor="workspace-title" className="sr-only">
            Workspace title
          </label>

          <input
            id="workspace-title"
            type="text"
            value={workspaceTitle}
            onChange={(event) => {
              setWorkspaceTitle(event.target.value);
              if (error) setError("");
            }}
            placeholder="e.g. React Interview Preparation"
            disabled={loading}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:bg-gray-800 dark:focus:ring-purple-500/10"
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create workspace"}
          </Button>
        </form>

        {error && (
          <div
            role="alert"
            className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 sm:mx-6 sm:mb-6"
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
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
              Your workspaces
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Open a workspace to continue learning.
            </p>
          </div>

          {!loadingWorkspaces && workspaces.length > 0 && (
            <span className="w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {workspaces.length}{" "}
              {workspaces.length === 1 ? "workspace" : "workspaces"}
            </span>
          )}
        </div>

        {loadingWorkspaces ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="mt-3 h-4 w-full rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-100 dark:bg-gray-800/70" />
                <div className="mt-7 h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path
                  d="M4 6.5A2.5 2.5 0 0 1 6.5 4h4l2 2.5h5A2.5 2.5 0 0 1 20 9v8.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-950 dark:text-white">
              No workspaces yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Create your first workspace above. You can then add sources, start
              conversations, and create learning artifacts inside it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <article
                key={workspace.id}
                className="group flex min-h-48 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900/70"
              >
                {editingWorkspaceId === workspace.id ? (
                  <form
                    onSubmit={(event) =>
                      handleUpdateWorkspace(event, workspace.id)
                    }
                    onClick={(event) => event.stopPropagation()}
                    className="flex h-full flex-col"
                  >
                    <label
                      htmlFor={`edit-workspace-${workspace.id}`}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Workspace name
                    </label>

                    <input
                      id={`edit-workspace-${workspace.id}`}
                      type="text"
                      value={editingWorkspaceTitle}
                      onChange={(event) =>
                        setEditingWorkspaceTitle(event.target.value)
                      }
                      autoFocus
                      className="mt-2 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-950 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-purple-500 dark:focus:bg-gray-800"
                    />

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      <Button type="submit" disabled={savingEdit}>
                        {savingEdit ? "Saving..." : "Save changes"}
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
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/workspaces/${workspace.id}`)}
                      className="flex flex-1 flex-col text-left outline-none"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                            {(workspace.title || "W").charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-gray-950 dark:text-white">
                              {workspace.title}
                            </h3>

                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                              Learning workspace
                            </p>
                          </div>
                        </div>

                        <svg
                          viewBox="0 0 24 24"
                          className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path
                            d="m9 18 6-6-6-6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      {workspace.description ? (
                        <p className="mt-5 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {workspace.description}
                        </p>
                      ) : (
                        <p className="mt-5 text-sm leading-6 text-gray-400 dark:text-gray-600">
                          No description added.
                        </p>
                      )}

                      <span className="mt-auto pt-5 text-sm font-medium text-purple-600 dark:text-purple-400">
                        Open workspace →
                      </span>
                    </button>

                    <div
                      className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"
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
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
