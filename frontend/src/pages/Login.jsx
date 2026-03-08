import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext"; 
import { Landmark, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent accidental form submissions
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const token = data.session.access_token;
    const userEmail = data.user.email;
    
    // Determine Role
    const userRole = userEmail === "admin@test.com" ? "ADMIN" : "USER";

    // ✅ Update Context and LocalStorage via one call
    login(token, userRole, data.user);

    // Redirect based on role
    if (userRole === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-4 font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-amber-100 relative z-10 animate-in zoom-in-95 fade-in duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full mb-4 border border-amber-100 shadow-sm">
            <Landmark className="text-orange-600" size={36} />
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-tight">Temple Portal</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to manage your bookings</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2 mt-8
              ${loading ? "opacity-70 cursor-not-allowed" : "active:scale-95 glow-saffron"}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-600 hover:text-orange-500 font-bold transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}