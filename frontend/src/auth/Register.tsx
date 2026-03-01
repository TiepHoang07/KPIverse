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
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center bg-gray-100 px-12 py-20">
      <div className="relative py-3 sm:mx-auto sm:max-w-xl">
        <div className="absolute inset-0 -skew-y-6 transform bg-linear-to-r from-cyan-400 to-sky-500 shadow-lg sm:-rotate-6 sm:skew-y-0 sm:rounded-3xl"></div>
        <div className="relative bg-white px-4 py-6 shadow-lg sm:rounded-3xl sm:p-10">
          <div className="flex flex-col items-center pb-4">
            <img className="h-18 w-40" src="images/logo.png" alt="logo" />
            <span className="text-md font-light text-gray-900">
              Welcome to KPIverse!
            </span>
          </div>
          <div className="rounded-lg bg-white shadow">
            <form
              className="w-96 space-y-4 rounded-xl bg-white p-8 text-base leading-6 text-gray-700 shadow-md sm:text-lg sm:leading-7"
              onSubmit={handleSubmit}
            >
              <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">
                Create your new account
              </h1>

              {error && <p className="mb-2 text-red-500">{error}</p>}
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-900">
                  Your name
                </span>
                <input
                  name="name"
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-300 focus:outline-blue-300"
                  placeholder="Name"
                  onChange={handleChange}
                />
              </div>
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-900">
                  Your email
                </span>
                <input
                  name="email"
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-300 focus:outline-blue-300"
                  placeholder="example@gmail.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-900">
                  Your password
                </span>
                <input
                  name="password"
                  type="password"
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-gray-900 focus:border-blue-300 focus:outline-blue-300"
                  placeholder="password"
                  onChange={handleChange}
                />
              </div>

              <button className="w-full cursor-pointer rounded-2xl bg-linear-to-bl from-sky-500 to-blue-500 px-4 py-3 text-white hover:from-blue-600 hover:to-sky-600">
                Register
              </button>

              <p className="mt-2 text-center text-sm font-light text-gray-500">
                Already have an account?{" "}
                <a
                  onClick={() => {
                    navigate("/login");
                  }}
                  className="cursor-pointer font-medium text-blue-600 hover:underline"
                >
                  Log in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
