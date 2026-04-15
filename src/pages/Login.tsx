import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    try {
      const data = await loginAdmin(form);

      // ✅ Save admin data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username || form.username);

      setMsg("✅ Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      setMsg("❌ " + err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
          >
            Login
          </button>
        </form>

        {msg && (
          <p
            className={`mt-4 text-center text-sm ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
