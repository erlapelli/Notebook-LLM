import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "../components/Card";

function Settings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);

  const [memoryInput, setMemoryInput] = useState("");

  const [editingMemoryId, setEditingMemoryId] = useState(null);

  const [editingText, setEditingText] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  /*

   * Load user memories when Settings opens.

   */

  useEffect(() => {
    const loadMemories = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await fetch(`${API_URL}/api/memory`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load memories.");
        }

        const data = await response.json();

        setMemories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Load memories error:", error);

        setError(error.message || "Could not load memories.");
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [API_URL]);

  /*

   * Create a new memory.

   */

  const handleAddMemory = async () => {
    const memory = memoryInput.trim();

    if (!memory || saving) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      const response = await fetch(`${API_URL}/api/memory`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          memory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || errorData?.error || "Failed to create memory.",
        );
      }

      const newMemory = await response.json();

      setMemories((currentMemories) => [...currentMemories, newMemory]);

      setMemoryInput("");
    } catch (error) {
      console.error("Create memory error:", error);

      setError(error.message || "Could not create memory.");
    } finally {
      setSaving(false);
    }
  };

  /*

   * Start editing a memory.

   */

  const handleStartEdit = (memoryItem) => {
    setEditingMemoryId(memoryItem.id);

    setEditingText(memoryItem.memory);

    setError("");
  };

  /*

   * Cancel editing.

   */

  const handleCancelEdit = () => {
    setEditingMemoryId(null);

    setEditingText("");
  };

  /*

   * Update an existing memory.

   */

  const handleUpdateMemory = async (memoryId) => {
    const memory = editingText.trim();

    if (!memory || saving) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      const response = await fetch(`${API_URL}/api/memory/${memoryId}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          memory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || errorData?.error || "Failed to update memory.",
        );
      }

      const updatedMemory = await response.json();

      setMemories((currentMemories) =>
        currentMemories.map((item) =>
          item.id === memoryId ? updatedMemory : item,
        ),
      );

      handleCancelEdit();
    } catch (error) {
      console.error("Update memory error:", error);

      setError(error.message || "Could not update memory.");
    } finally {
      setSaving(false);
    }
  };

  /*

   * Delete a memory.

   */

  const handleDeleteMemory = async (memoryId) => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      const response = await fetch(`${API_URL}/api/memory/${memoryId}`, {
        method: "DELETE",

        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || errorData?.error || "Failed to delete memory.",
        );
      }

      setMemories((currentMemories) =>
        currentMemories.filter((item) => item.id !== memoryId),
      );
    } catch (error) {
      console.error("Delete memory error:", error);

      setError(error.message || "Could not delete memory.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 px-3 pb-8 pt-6 dark:bg-gray-950 sm:px-6 sm:pb-10 sm:pt-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <button
              type="button"
              onClick={() =>
                workspaceId
                  ? navigate(`/workspaces/${workspaceId}`)
                  : navigate(-1)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back to Workspace
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Manage your NotebookLLM preferences and account settings.
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* Account */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg dark:bg-gray-800">
                <span aria-hidden="true">👤</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Account
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Your account information will appear here.
                </p>
                <span className="mt-3 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Coming later
                </span>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg dark:bg-gray-800">
                <span aria-hidden="true">⚙️</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                  Preferences
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Application preferences will be available here.
                </p>
                <span className="mt-3 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Coming later
                </span>
              </div>
            </div>
          </section>

          {/* Memory */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-lg dark:bg-purple-950/40">
                  <span aria-hidden="true">🧠</span>
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-950 dark:text-white">
                    Memory
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Manage information NotebookLLM remembers about you for
                    future conversations.
                  </p>
                </div>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                {memories.length}{" "}
                {memories.length === 1 ? "memory" : "memories"}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
              >
                {error}
              </div>
            )}

            {/* Add Memory */}
            <div className="mt-6">
              <label
                htmlFor="memory-input"
                className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                Add a memory
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="memory-input"
                  type="text"
                  value={memoryInput}
                  onChange={(event) => setMemoryInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleAddMemory();
                    }
                  }}
                  maxLength={2000}
                  placeholder="Example: I prefer practical examples when learning."
                  disabled={saving}
                  className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500"
                />

                <button
                  type="button"
                  onClick={handleAddMemory}
                  disabled={saving || !memoryInput.trim()}
                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Memory"}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Press Enter to add a memory.
              </p>
            </div>

            {/* Memory List */}
            <div className="mt-6">
              {loading ? (
                <div className="space-y-3" aria-label="Loading memories">
                  <div className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950" />
                  <div className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950" />
                </div>
              ) : memories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center dark:border-gray-700 dark:bg-gray-950">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-2xl dark:bg-purple-950/40">
                    <span aria-hidden="true">🧠</span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    No memories yet
                  </p>

                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Add something you want NotebookLLM to remember for future
                    conversations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memories.map((memoryItem) => (
                    <div
                      key={memoryItem.id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition dark:border-gray-800 dark:bg-gray-950"
                    >
                      {editingMemoryId === memoryItem.id ? (
                        <div>
                          <label
                            htmlFor={`edit-memory-${memoryItem.id}`}
                            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                          >
                            Edit memory
                          </label>

                          <textarea
                            id={`edit-memory-${memoryItem.id}`}
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            maxLength={2000}
                            rows={3}
                            disabled={saving}
                            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-purple-500"
                          />

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateMemory(memoryItem.id)}
                              disabled={saving || !editingText.trim()}
                              className="rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="break-words text-sm leading-6 text-gray-800 dark:text-gray-200">
                            {memoryItem.memory}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(memoryItem)}
                              disabled={saving}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMemory(memoryItem.id)}
                              disabled={saving}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/70 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;
