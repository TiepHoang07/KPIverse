import { useState } from 'react';
import { register } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded-xl shadow-md w-96" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          name="name"
          className="w-full mb-3 p-2 border rounded"
          placeholder="Name"
          onChange={handleChange}
        />

        <input
          name="email"
          className="w-full mb-3 p-2 border rounded"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}
