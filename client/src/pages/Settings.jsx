import { useEffect, useState } from "react";
import Card from "../components/Card";

function Settings() {
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
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Manage your NotebookLLM preferences and account settings.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4 sm:space-y-5">
        {/* Account */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Your account information will appear here.
          </p>
        </Card>

        {/* Preferences */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preferences
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            Application preferences will be available here.
          </p>
        </Card>

        {/* Memory */}
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Memory
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Manage information NotebookLLM remembers about you for future
                conversations.
              </p>
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {memories.length} {memories.length === 1 ? "memory" : "memories"}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Add Memory */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add a memory
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
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
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:ring-purple-950"
              />

              <button
                type="button"
                onClick={handleAddMemory}
                disabled={saving || !memoryInput.trim()}
                className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Memory"}
              </button>
            </div>
          </div>

          {/* Memory List */}
          <div className="mt-6">
            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                Loading memories...
              </div>
            ) : memories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700">
                <div className="text-3xl">🧠</div>

                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  No memories yet
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add something you want NotebookLLM to remember.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((memoryItem) => (
                  <div
                    key={memoryItem.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {editingMemoryId === memoryItem.id ? (
                      <div>
                        <textarea
                          value={editingText}
                          onChange={(event) =>
                            setEditingText(event.target.value)
                          }
                          maxLength={2000}
                          rows={3}
                          disabled={saving}
                          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-purple-500 dark:focus:ring-purple-950"
                        />

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateMemory(memoryItem.id)}
                            disabled={saving || !editingText.trim()}
                            className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm leading-6 text-gray-800 dark:text-gray-200">
                          {memoryItem.memory}
                        </p>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(memoryItem)}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMemory(memoryItem.id)}
                            disabled={saving}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
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
        </Card>
      </div>
    </div>
  );
}

export default Settings;
