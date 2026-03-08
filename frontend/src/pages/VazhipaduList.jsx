import { useEffect, useState } from "react";
import { getAllPujas } from "../services/vazhipaduService";
import { useNavigate } from "react-router-dom";
import { Flower2, IndianRupee } from "lucide-react";

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

    <div className="min-h-screen mandala-bg p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-heading text-center mb-12 text-warmGray">
          Temple Vazhipadu Services
        </h1>


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {pujas.map((puja) => (

            <div
              key={puja.id}
              className="
              bg-white dark:bg-charcoal
              p-8
              rounded-3xl
              shadow-lg
              border
              border-gold/10
              transition
              hover:shadow-xl
              hover:-translate-y-1
              "
            >

              {/* icon */}

              <div className="mb-4 text-saffron">
                <Flower2 size={28} />
              </div>


              <h2 className="text-xl font-heading text-warmGray">
                {puja.puja_name}
              </h2>


              <p className="text-sm text-warmGray/70 mt-2">
                {puja.description}
              </p>


              {/* price */}

              <div className="flex items-center justify-between mt-6">

                <span className="flex items-center gap-1 text-saffron font-bold text-lg">
                  <IndianRupee size={16} />
                  {puja.price}
                </span>

                <span className="text-xs bg-gold/20 text-gold px-3 py-1 rounded-full">
                  {puja.puja_type}
                </span>

              </div>


              {/* button */}

              <button
                onClick={() => navigate(`/vazhipadu/booking/${puja.id}`)}
                className="
                mt-6
                w-full
                bg-saffron
                hover:bg-orange-600
                text-white
                font-semibold
                py-3
                rounded-xl
                transition
                shadow-md
                "
              >
                Book Now
              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};

export default VazhipaduList;