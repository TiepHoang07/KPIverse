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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border border-border">
        {/* Logo section */}
        <div className="flex flex-col items-center">
          <img className="h-16 w-auto sm:h-20" src="images/logo.png" alt="KPIverse logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs font-bold uppercase tracking-widest text-destructive text-center">
              {error}
            </div>
          )}
 
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full rounded-xl border border-border bg-secondary/30 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-inner"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border border-border bg-secondary/30 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}