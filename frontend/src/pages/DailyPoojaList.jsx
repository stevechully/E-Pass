import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function DailyPoojaList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API}/vazhipadu/services`);
        // Change "REGULAR" to "SPECIAL" for the other file
        const filtered = res.data.services.filter(s => s.puja_type === "REGULAR");
        setServices(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <button onClick={() => navigate("/vazhipadu")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={18} /> Back
      </button>
      
      <h1 className="text-3xl font-bold text-emerald-400 mb-10">Daily Poojas</h1>

      {loading ? (
        <p className="animate-pulse">Loading offerings...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{service.puja_name}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">₹{service.price}</p>
                <button
                  onClick={() => navigate(`/vazhipadu/book/${service.id}`)}
                  className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}