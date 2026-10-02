import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";
import { authClient } from "../lib/auth-client";

function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [user, setUser] = useState(null);

  const profileRef = useRef(null);

  /*
   * Load the current Better Auth session.
   *
   * We retry a few times because after Google OAuth redirects
   * back to the frontend, the session can take a moment to
   * become available to the client.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      setIsLoadingUser(true);

      const maxAttempts = 5;
      const retryDelay = 500;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const { data, error } = await authClient.getSession();

          if (cancelled) {
            return;
          }

          if (!error && data?.user) {
            setUser(data.user);
            setIsLoadingUser(false);
            return;
          }

          /*
           * If the session isn't available yet, wait briefly
           * and try again.
           */
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        } catch (error) {
          console.error("Failed to load auth session:", error);

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      if (!cancelled) {
        setUser(null);
        setIsLoadingUser(false);
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const userInitial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        console.error("Logout failed:", error);
        setIsLoggingOut(false);
        return;
      }

      // Clear local user immediately
      setUser(null);
      setIsProfileOpen(false);

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

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
            <span className="text-xl">☰</span>
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
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            {/* Avatar Button */}
            <button
              type="button"
              onClick={() => setIsProfileOpen((previous) => !previous)}
              disabled={isLoadingUser}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-semibold text-purple-700 transition-colors hover:ring-2 hover:ring-purple-400 disabled:cursor-wait disabled:opacity-70 dark:bg-purple-950 dark:text-purple-300"
              aria-label="Open user menu"
              aria-expanded={isProfileOpen}
            >
              {isLoadingUser ? (
                <span className="text-xs">...</span>
              ) : user?.image ? (
                <img
                  src={user.image}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && !isLoadingUser && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                {/* User Information */}
                <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={userName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        userInitial
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {userName}
                      </p>

                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <span>⚙️</span>

                    <span>Settings</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <span>🚪</span>

                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
