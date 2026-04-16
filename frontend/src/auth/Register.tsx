import { useState } from "react";
import { register } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    try {
      await register(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Register failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 lg:px-8">
      <div className="w-full max-w-lg space-y-10 rounded-[2.5rem] bg-white py-12 px-6 shadow-2xl border border-white">
        {/* Logo section */}
        <div className="flex flex-col items-center">
          <div className="py-4 px-6 rounded-[2rem] flex items-center justify-center mb-2">
            <img src={logo} alt="logo" className="w-46 h-20 md:w-60 md:h-24" />
          </div>
          <h2 className="text-center text-4xl font-black tracking-tighter text-primary">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground/40">
            Join the KPIverse
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-2xl bg-destructive/5 border border-destructive/10 p-4 text-[10px] font-black uppercase tracking-[0.2em] text-destructive text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-4">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-2xl border border-border/40 bg-accent/50 px-6 py-4 text-primary font-medium placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-4">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="block w-full rounded-2xl border border-border/40 bg-accent/50 px-6 py-4 text-primary font-medium placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-4">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-2xl border border-border/40 bg-accent/50 pl-6 pr-14 py-4 text-primary font-medium placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                  placeholder="Your Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground/40 hover:bg-white hover:text-primary transition-all cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group cursor-pointer relative flex w-full justify-center rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-primary/95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-secondary hover:text-secondary/80 transition-all font-black underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
