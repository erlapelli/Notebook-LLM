import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../services/api";

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
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 p-6 dark:border-gray-800 sm:p-8">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-4 h-9 w-2/3 max-w-md rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-3 h-4 w-full max-w-2xl rounded bg-gray-100 dark:bg-gray-800/70" />
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <h1 className="font-semibold text-red-900 dark:text-red-200">
                  Unable to load workspace
                </h1>

                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="mt-4 text-sm font-semibold text-red-700 underline underline-offset-4 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
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

            <h1 className="mt-4 text-lg font-semibold text-gray-950 dark:text-white">
              Workspace not found
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This workspace may have been deleted or is no longer available.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      title: "Sources",
      description:
        "Add documents, websites, YouTube videos, and other learning materials.",
      action: "Open Sources",
      path: `/workspaces/${workspaceId}/sources`,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path
            d="M6.5 5.5h8A2.5 2.5 0 0 1 17 8v10.5H8A2.5 2.5 0 0 1 5.5 16V6.5a1 1 0 0 1 1-1Z"
            strokeLinejoin="round"
          />
          <path d="M8 18.5h9.5V8M9 9h5M9 12h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Chat",
      description:
        "Ask questions about your saved sources and continue your conversations.",
      action: "Open Chat",
      path: `/workspaces/${workspaceId}/chat`,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path
            d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v6a3.5 3.5 0 0 1-3.5 3.5H11l-4.5 4v-4.7A3.5 3.5 0 0 1 5 12.5v-6Z"
            strokeLinejoin="round"
          />
          <path d="M9 8.5h6M9 11.5h4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Artifacts",
      description:
        "Generate and review summaries, quizzes, flashcards, and other learning artifacts.",
      action: "Open Artifacts",
      path: `/workspaces/${workspaceId}/artifacts`,
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path
            d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
            strokeLinejoin="round"
          />
          <path
            d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Workspace header */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-100 blur-3xl dark:bg-purple-950/40" />

          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-purple-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:text-gray-400 dark:hover:text-purple-400"
            >
              <span aria-hidden="true">←</span>
              Dashboard
            </button>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-xl font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                {(workspace.title || "W").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-900/70 dark:bg-purple-950/40 dark:text-purple-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  Learning workspace
                </div>

                <h1 className="break-words text-3xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                  {workspace.title}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
                  {workspace.description ||
                    "Organize your sources, conversations, and learning artifacts in one place."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workspace tools */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
              Workspace tools
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose where you want to continue your learning.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {actions.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.path)}
                className="group flex min-h-60 flex-col rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm outline-none transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-purple-500/20 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900/70 dark:hover:shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 transition group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950/50 dark:text-purple-300 dark:group-hover:bg-purple-600 dark:group-hover:text-white">
                    {item.icon}
                  </div>

                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-purple-500 dark:text-gray-600 dark:group-hover:text-purple-400"
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

                <div className="mt-7">
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>

                <span className="mt-auto pt-6 text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {item.action} →
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Workspace;
