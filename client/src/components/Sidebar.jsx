import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white md:block">
            <div className="flex h-full min-h-[calc(100vh-4rem)] flex-col p-4">

                {/* Workspace */}
                <div className="mb-6">
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Workspace
                    </p>

                    <Link
                        to="/"
                        className="flex w-full items-center gap-3 rounded-lg bg-purple-50 px-3 py-2.5 text-sm font-medium text-purple-700"
                    >
                        <span>🏠</span>
                        Dashboard
                    </Link>
                </div>

                {/* Learning */}
                <div>
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Learning
                    </p>

                    <div className="space-y-1">
                        <Link
                            to="/sources"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <span>📚</span>
                            Sources
                        </Link>

                        <Link
                            to="/artifacts"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <span>✨</span>
                            Artifacts
                        </Link>

                        <Link
                            to="/chat"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <span>💬</span>
                            Chat
                        </Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-auto border-t border-gray-100 pt-4">
                    <Link
                        to="/settings"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <span>⚙️</span>
                        Settings
                    </Link>
                </div>

            </div>
        </aside>
    );
}

export default Sidebar;