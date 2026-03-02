import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// ✅ Corrected: Changed 'info' to 'Info' to match Lucide React's export
import { ArrowLeft, Sparkles, Calendar, Info } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function SpecialPoojaList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialServices = async () => {
      try {
        const res = await axios.get(`${API}/vazhipadu/services`);
        // Filter specifically for SPECIAL type poojas
        const special = res.data.services.filter(
          (s) => s.puja_type === "SPECIAL"
        );
        setServices(special);
      } catch (err) {
        console.error("Failed to fetch special poojas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      {/* Back Navigation */}
      <button 
        onClick={() => navigate("/vazhipadu")} 
        className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors mb-8 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        <span>Back to Categories</span>
      </button>

      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-emerald-400 flex items-center gap-3">
          <Sparkles className="text-yellow-400" /> Special Poojas & Festivals
        </h1>
        <p className="text-gray-400 mt-4 max-w-2xl">
          These offerings are conducted only on specific auspicious dates and festivals. 
          Select a pooja to see the upcoming scheduled dates and reserve your slot.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-500 italic">Fetching sacred events...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-gray-800 border border-dashed border-gray-700 p-10 rounded-3xl text-center">
          <p className="text-gray-500">No special festivals are currently listed for booking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="group bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-emerald-500/50 transition-all shadow-xl flex flex-col justify-between relative overflow-hidden"
            >
              {/* Corner Decoration */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
              
              <div>
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-emerald-900/30 rounded-lg">
                      <Calendar size={20} className="text-emerald-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                     Seasonal
                   </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {service.puja_name}
                </h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 italic leading-relaxed">
                  {service.description || "Performed with Vedic rituals on specific auspicious dates for divine intervention."}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-700/50 mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Offering</p>
                  <p className="text-2xl font-black text-white">₹{service.price}</p>
                </div>
                
                <button
                  onClick={() => navigate(`/vazhipadu/book/${service.id}`)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  View Dates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-16 bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl flex gap-4 items-center">
        <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-full">
           {/* ✅ Corrected: Use Capitalized Info */}
           <Info size={20} />
        </div>
        <p className="text-sm text-gray-400">
          <strong className="text-emerald-400">Note:</strong> Special Poojas have strictly limited slots. We recommend booking in advance as these events often reach full capacity quickly.
        </p>
      </div>
    </div>
  );
}

// Helper component for the footer icon
function AlertCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}