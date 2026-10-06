import { NavLink, useParams } from "react-router-dom";

function Sidebar({ isMobileMenuOpen, onClose }) {
  const { workspaceId } = useParams();

  const linkClasses = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  const workspaceLinks = workspaceId
    ? [
        {
          to: `/workspaces/${workspaceId}/sources`,
          label: "Sources",
          icon: "📚",
        },
        {
          to: `/workspaces/${workspaceId}/artifacts`,
          label: "Artifacts",
          icon: "✨",
        },
        {
          to: `/workspaces/${workspaceId}/chat`,
          label: "Chat",
          icon: "💬",
        },
      ]
    : [];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 md:static md:block md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-screen flex-col p-4">
          {/* Mobile close */}
          <div className="mb-4 flex justify-end md:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close sidebar"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          {/* Workspace */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Workspace
            </p>

            <NavLink to="/" onClick={onClose} className={linkClasses}>
              <span aria-hidden="true">🏠</span>
              Dashboard
            </NavLink>
          </div>

          {/* Learning */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Learning
            </p>

            {workspaceId ? (
              <div className="space-y-1">
                {workspaceLinks.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={onClose}
                    className={linkClasses}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 px-3 py-3 text-xs leading-5 text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
                Open a workspace to access Sources, Artifacts, and Chat.
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
