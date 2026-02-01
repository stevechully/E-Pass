import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Extract session and user info
    const token = data.session.access_token;
    const userEmail = data.user.email;

    // 1. Store auth token
    localStorage.setItem("token", token);
    
    // 2. Store email for dashboard/profile reference
    localStorage.setItem("email", userEmail);

    // ⭐ 3. SET ADMIN FLAG
    // This allows the frontend to show Admin Panels immediately without waiting for an API check
    if (userEmail === "admin@test.com") {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.setItem("isAdmin", "false");
    }

    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl w-96 text-white shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign in to manage your e-passes</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Password</label>
            <input
              type="password"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-900/20 transition-all active:scale-95 mt-4"
          >
            Login
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-8">
          Testing as admin? Use <span className="text-gray-300">admin@test.com</span>
        </p>
      </div>
    </div>
  );
}