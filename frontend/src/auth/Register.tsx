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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        className="w-96 rounded-xl bg-white p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-4 text-center text-2xl font-bold">Register</h1>

        {error && <p className="mb-2 text-red-500">{error}</p>}

        <input
          name="name"
          className="mb-3 w-full rounded border p-2"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          name="email"
          className="mb-3 w-full rounded border p-2"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          className="mb-4 w-full rounded border p-2"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="w-full cursor-pointer rounded bg-green-600 py-2 text-white hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}
