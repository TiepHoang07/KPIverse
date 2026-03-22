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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border border-border">
        {/* Logo section */}
        <div className="flex flex-col items-center">
          <img className="h-16 w-auto sm:h-20" src="images/logo.png" alt="KPIverse logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Create account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Join KPIverse today!
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
              <label htmlFor="name" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-xl border border-border bg-secondary/30 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/20 focus:border-primary/50 focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-inner"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>
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
                value={form.email}
                onChange={handleChange}
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
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:-translate-y-0.5"
            >
              Register
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
