import { useState } from "react";
import { register } from "../api/auth.api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      await register(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative background element */}
        <div className="absolute inset-0 -skew-y-3 transform bg-linear-to-r from-cyan-500 to-blue-500 shadow-lg sm:-rotate-3 sm:skew-y-0 sm:rounded-3xl"></div>
        
        {/* Main card */}
        <div className="relative bg-white px-6 py-8 shadow-lg sm:rounded-3xl sm:p-10">
          {/* Logo section */}
          <div className="mb-6 flex flex-col items-center">
            <img 
              className="h-16 w-auto sm:h-20" 
              src="images/logo.png" 
              alt="KPIverse logo" 
            />
            <span className="mt-2 text-sm text-gray-600 sm:text-base">
              Join KPIverse today!
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h1 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
              Create your account
            </h1>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Name field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {/* Email field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-cyan-700 hover:to-blue-700 sm:text-base"
            >
              Create account
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                onClick={() => navigate("/login")}
                className="font-medium cursor-pointer text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}