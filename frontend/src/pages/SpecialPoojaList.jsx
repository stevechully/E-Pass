import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

    <div className="min-h-screen mandala-bg p-8">

      <div className="max-w-6xl mx-auto">

        {/* Back */}

        <button
          onClick={() => navigate("/vazhipadu")}
          className="flex items-center gap-2 text-warmGray/70 hover:text-saffron transition mb-8"
        >
          <ArrowLeft size={20} />
          Back to Categories
        </button>


        {/* Header */}

        <div className="mb-12">

          <h1 className="text-4xl font-heading flex items-center gap-3 text-warmGray">

            <Sparkles className="text-saffron" />
            Special Poojas & Festivals

          </h1>

          <p className="text-warmGray/70 mt-4 max-w-2xl">

            These offerings are conducted only on specific auspicious dates and festivals.
            Select a pooja to see the upcoming scheduled dates and reserve your slot.

          </p>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="flex flex-col items-center justify-center py-20">

            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron mb-4"></div>

            <p className="text-warmGray/70 italic">
              Fetching sacred events...
            </p>

          </div>

        ) : services.length === 0 ? (

          <div className="bg-white dark:bg-charcoal border border-gold/10 p-10 rounded-3xl text-center">

            <p className="text-warmGray/70">
              No special festivals are currently listed.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {services.map((service) => (

              <div
                key={service.id}
                className="
                bg-white dark:bg-charcoal
                border border-gold/10
                rounded-3xl
                p-6
                shadow-lg
                hover:shadow-xl
                transition
                flex flex-col justify-between
                "
              >

                <div>

                  <div className="flex justify-between mb-4">

                    <div className="p-2 bg-saffron/10 rounded-lg">

                      <Calendar size={20} className="text-saffron" />

                    </div>

                    <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full font-semibold">
                      Seasonal
                    </span>

                  </div>

                  <h3 className="text-xl font-heading text-warmGray mb-2">
                    {service.puja_name}
                  </h3>

                  <p className="text-sm text-warmGray/70 italic">
                    {service.description ||
                      "Performed with sacred Vedic rituals on auspicious festival dates."}
                  </p>

                </div>


                <div className="mt-6 pt-4 border-t border-gold/10 flex items-center justify-between">

                  <div>

                    <p className="text-xs text-warmGray/60 uppercase">
                      Offering
                    </p>

                    <p className="text-2xl font-bold text-saffron">
                      ₹{service.price}
                    </p>

                  </div>

                  <button
                    onClick={() => navigate(`/vazhipadu/book/${service.id}`)}
                    className="
                    bg-saffron
                    hover:bg-orange-600
                    text-white
                    px-5
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                    shadow-md
                    "
                  >
                    View Dates
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}


        {/* Info Section */}

        <div className="mt-16 bg-saffron/5 border border-saffron/20 p-6 rounded-2xl flex gap-4 items-center">

          <div className="text-saffron bg-saffron/10 p-2 rounded-full">
            <Info size={20} />
          </div>

          <p className="text-sm text-warmGray/70">

            <strong className="text-saffron">Note:</strong>
            Special Poojas have limited slots. Booking early is recommended.

          </p>

        </div>

      </div>

    </div>

  );

}