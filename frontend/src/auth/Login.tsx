import { useState } from "react";
import { login } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      await refresh();
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative background element */}
        <div className="absolute inset-0 transform bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg -rotate-3 skew-y-0 rounded-3xl"></div>
        
        {/* Main card */}
        <div className="relative rounded-2xl bg-white px-6 py-8 shadow-lg sm:rounded-3xl sm:p-10">
          {/* Logo section */}
          <div className="mb-6 flex flex-col items-center">
            <img 
              className="h-16 w-auto sm:h-20" 
              src="images/logo.png" 
              alt="KPIverse logo" 
            />
            <span className="mt-2 text-sm text-gray-600 sm:text-base">
              Welcome back to KPIverse!
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h1 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
              Log in to your account
            </h1>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 sm:text-base"
            >
              Sign in
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                onClick={() => navigate("/register")}
                className="font-medium cursor-pointer text-blue-600 hover:text-blue-700 hover:underline"
              >
                Create one now
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}