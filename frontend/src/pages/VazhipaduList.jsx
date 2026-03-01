import { useEffect, useState } from "react";
import { getAllPujas } from "../services/vazhipaduService";
import { useNavigate } from "react-router-dom";

const VazhipaduList = () => {
  const [pujas, setPujas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPujas();
  }, []);

  const fetchPujas = async () => {
    try {
      const data = await getAllPujas();
      setPujas(data.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Vazhipadu Services
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {pujas.map((puja) => (
          <div
            key={puja.id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-semibold">{puja.puja_name}</h2>
            <p className="text-gray-400 mt-2">{puja.description}</p>

            <div className="mt-4">
              <span className="text-green-400 font-bold">
                ₹{puja.price}
              </span>
              <span className="ml-3 text-sm bg-purple-600 px-2 py-1 rounded">
                {puja.puja_type}
              </span>
            </div>

            <button
              onClick={() => navigate(`/vazhipadu/${puja.id}`)}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg transition"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VazhipaduList;