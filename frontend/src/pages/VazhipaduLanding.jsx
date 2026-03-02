import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../services/vazhipaduService";
import { Clock, Star, ArrowRight } from "lucide-react";

const VazhipaduLanding = () => {
  const [activeTab, setActiveTab] = useState("REGULAR");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [activeTab]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getServices(activeTab);
      setServices(res.services || res.data || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold text-emerald-400 mb-8 text-center">
        Temple Vazhipadu Booking
      </h1>

      {/* 🟢 Tabs Section */}
      <div className="flex justify-center mb-10 bg-gray-800 p-1 rounded-xl max-w-sm mx-auto border border-gray-700">
        <button
          onClick={() => setActiveTab("REGULAR")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
            activeTab === "REGULAR" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
          }`}
        >
          <Clock size={18} /> Daily
        </button>
        <button
          onClick={() => setActiveTab("SPECIAL")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all ${
            activeTab === "SPECIAL" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
          }`}
        >
          <Star size={18} /> Special
        </button>
      </div>

      {/* 🔵 Services Grid */}
      {loading ? (
        <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 border border-gray-700 rounded-3xl p-6 hover:border-emerald-500/50 transition-all shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">{service.puja_name}</h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 italic">
                  {service.description || "Divine offering for prosperity and peace."}
                </p>
                <p className="text-2xl font-black text-emerald-400 mb-6">₹{service.price}</p>
              </div>

              <button
                onClick={() => navigate(`/vazhipadu/booking/${service.id}`)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
              >
                Book Now <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VazhipaduLanding;