import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flower2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function DailyPoojaList() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchServices = async () => {

      try {

        const res = await axios.get(`${API}/vazhipadu/services`);

        const filtered = res.data.services.filter(
          s => s.puja_type === "REGULAR"
        );

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

    <div className="min-h-screen mandala-bg p-8">

      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate("/vazhipadu")}
          className="flex items-center gap-2 text-warmGray/70 hover:text-saffron mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <h1 className="text-4xl font-heading text-warmGray mb-12">
          Daily Poojas
        </h1>


        {loading ? (

          <p className="text-warmGray/70 italic">
            Loading offerings...
          </p>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {services.map((service) => (

              <div
                key={service.id}
                className="
                bg-white dark:bg-charcoal
                p-6
                rounded-3xl
                shadow-lg
                border
                border-gold/10
                flex flex-col justify-between
                hover:shadow-xl
                transition
                "
              >

                <div>

                  <div className="text-saffron mb-3">
                    <Flower2 size={24} />
                  </div>

                  <h2 className="text-xl font-heading text-warmGray mb-2">
                    {service.puja_name}
                  </h2>

                  <p className="text-warmGray/70 text-sm mb-4">
                    {service.description}
                  </p>

                </div>


                <div>

                  <p className="text-2xl font-bold text-saffron">
                    ₹{service.price}
                  </p>

                  <button
                    onClick={() => navigate(`/vazhipadu/book/${service.id}`)}
                    className="
                    mt-6
                    w-full
                    bg-saffron
                    hover:bg-orange-600
                    py-3
                    rounded-xl
                    text-white
                    font-semibold
                    transition
                    "
                  >
                    Book Now
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}