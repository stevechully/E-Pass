import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!form.email || !form.password || !form.full_name) {
      return "All required fields must be filled";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email format";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const error = validate();
    if (error) {
      setMessage(error);
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      setMessage(res.data.message);
      setIsError(false);
      
      // Optional: Automatically redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl w-96 text-white shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-gray-400 mt-2 text-sm">Sign up to get your e-passes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Full Name *</label>
            <input
              type="text"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="John Doe"
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Email Address *</label>
            <input
              type="email"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="name@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Phone Number</label>
            <input
              type="text"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="+1 234 567 8900"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Password *</label>
            <input
              type="password"
              className="w-full p-3 mt-1 rounded-xl bg-slate-700 text-white border border-slate-600 focus:border-green-500 focus:outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all mt-4 ${
              isLoading 
                ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-95"
            }`}
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Dynamic Success / Error Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${isError ? "bg-red-500/20 text-red-400 border border-red-500/50" : "bg-green-500/20 text-green-400 border border-green-500/50"}`}>
            {message}
          </div>
        )}

        {/* Back to Login Link */}
        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-green-500 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}