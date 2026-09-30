import { useTheme } from "../context/ThemeContext";

function Navbar({ onMenuClick }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="border-b border-gray-200 bg-white transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                {/* Left side */}
                <div className="flex items-center gap-3">

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
                        aria-label="Open navigation menu"
                    >
                        <span className="text-xl">
                            ☰
                        </span>
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-lg font-bold text-white">
                            N
                        </div>

                        <span className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                            NotebookLLM
                        </span>

                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 md:flex">

                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Dashboard
                    </span>

                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Sources
                    </span>

                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Artifacts
                    </span>

                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        aria-label={
                            theme === "light"
                                ? "Switch to dark mode"
                                : "Switch to light mode"
                        }
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>

                    {/* User */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        P
                    </div>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;