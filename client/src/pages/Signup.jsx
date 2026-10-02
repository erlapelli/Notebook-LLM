import { authClient } from "../lib/auth-client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        setError(error.message || "Signup failed");
        return;
      }

      console.log("Signup successful:", data);

      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);

      setError(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
    } catch (error) {
      console.error("Google signup error:", error);

      setError(error.message || "Google signup failed");

      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-xl font-bold text-white">
            N
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start learning with NotebookLLM.
          </p>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              disabled={loading || googleLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading || googleLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
              minLength={8}
              disabled={loading || googleLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              required
              minLength={8}
              disabled={loading || googleLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-purple-950"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Create Account */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-lg bg-purple-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />

          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-750"
        >
          {/* Google Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
            />

            <path
              fill="#34A853"
              d="M12 21.99c2.63 0 4.84-.87 6.45-2.34l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.99Z"
            />

            <path
              fill="#FBBC05"
              d="M6.54 14.09a5.86 5.86 0 0 1 0-4.18V7.38H3.3a9.99 9.99 0 0 0 0 9.24l3.24-2.53Z"
            />

            <path
              fill="#EA4335"
              d="M12 5.88c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 2.94 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 7.6 9.46 5.88 12 5.88Z"
            />
          </svg>

          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

export default Signup;
