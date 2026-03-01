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
      // refresh auth state so ProtectedRoute will see the user
      await refresh();
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-gray-100 px-12 py-20">
      <div className="relative py-3 sm:mx-auto sm:max-w-xl">
        <div className="absolute inset-0 -skew-y-6 transform bg-linear-to-r from-indigo-500 to-purple-500 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
        <div className="relative bg-white px-4 py-6 shadow-lg sm:rounded-3xl sm:p-10">
          <div className="flex flex-col items-center pb-4">
            <img className="h-18 w-40" src="images/logo.png" alt="logo" />
            <span className="text-md font-light text-gray-900">
              Welcome back to KPIverse!
            </span>
          </div>
          <div className="rounded-lg bg-white shadow">
            <form
              className="w-96 space-y-4 rounded-xl bg-white p-8 text-base leading-6 text-gray-700 shadow-md sm:text-lg sm:leading-7"
              onSubmit={handleSubmit}
            >
              <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Log in your account
              </h1>

              {error && <p className="mb-2 text-red-500">{error}</p>}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-900">
                  Your email
                </span>
                <input
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-300 focus:outline-blue-300"
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-900">
                  Your password
                </span>
                <input
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-300 focus:outline-blue-300"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="w-full cursor-pointer rounded-2xl bg-linear-to-bl from-blue-500 to-indigo-500 px-4 py-3 text-white hover:from-indigo-600 hover:to-blue-600">
                Login
              </button>

              <p className="mt-2 text-center text-sm font-light text-gray-500">
                Don't have an account yet?{" "}
                <a
                  onClick={() => {
                    navigate("/register");
                  }}
                  className="cursor-pointer font-medium text-blue-600 hover:underline"
                >
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
