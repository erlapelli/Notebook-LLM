import { NavLink } from "react-router-dom";

function Sidebar({ isMobileMenuOpen, onClose }) {
    const linkClasses = ({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive
            ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
            : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        }`;

    return (
        <>
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 md:static md:block md:translate-x-0 ${isMobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
            >
                <div className="flex h-full min-h-screen flex-col p-4">

                    {/* Mobile close button */}
                    <div className="mb-4 flex justify-end md:hidden">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            aria-label="Close sidebar"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Workspace */}
                    <div className="mb-6">
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Workspace
                        </p>

                        <NavLink
                            to="/"
                            onClick={onClose}
                            className={linkClasses}
                        >
                            <span>🏠</span>
                            Dashboard
                        </NavLink>
                    </div>

                    {/* Learning */}
                    <div>
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Learning
                        </p>

                        <div className="space-y-1">
                            <NavLink
                                to="/sources"
                                onClick={onClose}
                                className={linkClasses}
                            >
                                <span>📚</span>
                                Sources
                            </NavLink>

                            <NavLink
                                to="/artifacts"
                                onClick={onClose}
                                className={linkClasses}
                            >
                                <span>✨</span>
                                Artifacts
                            </NavLink>

                            <NavLink
                                to="/chat"
                                onClick={onClose}
                                className={linkClasses}
                            >
                                <span>💬</span>
                                Chat
                            </NavLink>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800">
                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={linkClasses}
                        >
                            <span>⚙️</span>
                            Settings
                        </NavLink>
                    </div>

                </div>
            </aside>
        </>
    );
}

export default Sidebar;