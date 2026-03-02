import { useNavigate } from "react-router-dom";
import { Clock, Star, ArrowRight } from "lucide-react";

export default function VazhipaduHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-emerald-400 mb-10 text-center">Vazhipadu Offerings</h1>
      
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Daily Section */}
        <div
          onClick={() => navigate("/vazhipadu/daily")}
          className="group bg-gray-800 border border-gray-700 p-10 rounded-3xl cursor-pointer hover:border-emerald-500 hover:bg-gray-800/50 transition-all shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <Clock className="text-emerald-500 mb-4" size={32} />
          <h2 className="text-2xl font-bold text-white mb-3">Daily Poojas</h2>
          <p className="text-gray-400 mb-6">
            Book recurring rituals like Archana, Pushpanjali, and Sahasranama for any upcoming date.
          </p>
          <div className="flex items-center text-emerald-400 font-bold gap-2">
            View All <ArrowRight size={18} />
          </div>
        </div>

        {/* Special Section */}
        <div
          onClick={() => navigate("/vazhipadu/special")}
          className="group bg-gray-800 border border-gray-700 p-10 rounded-3xl cursor-pointer hover:border-emerald-500 hover:bg-gray-800/50 transition-all shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <Star className="text-emerald-500 mb-4" size={32} />
          <h2 className="text-2xl font-bold text-white mb-3">Special Poojas</h2>
          <p className="text-gray-400 mb-6">
            Book seasonal festivals and grand ceremonies held on specific auspicious dates.
          </p>
          <div className="flex items-center text-emerald-400 font-bold gap-2">
            View Events <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}