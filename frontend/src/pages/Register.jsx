import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Landmark, User, Mail, Phone, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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
      return "All required fields (*) must be filled";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters long";
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

      setMessage(res.data.message || "Registration successful! Redirecting...");
      setIsError(false);
      
      // Automatically redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50/30 p-4 sm:py-10 font-sans relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Register Card */}
      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-amber-100 relative z-10 animate-in zoom-in-95 fade-in duration-500 my-8">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-full mb-4 border border-amber-100 shadow-sm">
            <Landmark className="text-orange-600" size={28} />
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">Join the Temple Portal to manage your bookings</p>
        </div>

        {/* Dynamic Success / Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in slide-in-from-top-2 ${
            isError 
              ? "bg-rose-50 text-rose-600 border border-rose-100" 
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          }`}>
            {isError ? <AlertCircle size={20} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={20} className="shrink-0 mt-0.5" />}
            <p>{message}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all font-medium"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-bold py-4 rounded-2xl shadow-md transition-all flex justify-center items-center gap-2 mt-8
              ${isLoading 
                ? "bg-slate-400 cursor-not-allowed shadow-none" 
                : "bg-orange-600 hover:bg-orange-500 active:scale-95 glow-saffron"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating Account...
              </>
            ) : (
              <>
                Register <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-600 hover:text-orange-500 font-bold transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}