import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getServices } from "../services/vazhipaduService"
import { Clock, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const VazhipaduLanding = () => {

  const [activeTab, setActiveTab] = useState("REGULAR")
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [activeTab])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await getServices(activeTab)
      setServices(res.services || res.data || [])
    } catch (err) {
      console.error("Failed to fetch services:", err)
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="min-h-screen mandala-bg p-8">

      {/* Page Header */}

      <div className="text-center mb-10">

        <h1 className="text-4xl font-heading text-warmGray mb-2">
          Temple Vazhipadu Booking
        </h1>

        <p className="text-warmGray/70">
          Choose from sacred rituals performed by temple priests.
        </p>

      </div>


      {/* Tabs */}

      <div className="flex justify-center mb-12">

        <div className="flex bg-white dark:bg-charcoal border border-gold/20 rounded-full shadow-sm">

          <button
            onClick={() => setActiveTab("REGULAR")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all
              ${activeTab === "REGULAR"
                ? "bg-saffron text-white shadow-md"
                : "text-warmGray hover:text-saffron"}
            `}
          >
            <Clock size={18}/>
            Daily
          </button>

          <button
            onClick={() => setActiveTab("SPECIAL")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all
              ${activeTab === "SPECIAL"
                ? "bg-saffron text-white shadow-md"
                : "text-warmGray hover:text-saffron"}
            `}
          >
            <Sparkles size={18}/>
            Special
          </button>

        </div>

      </div>


      {/* Loading */}

      {loading ? (

        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-b-2 border-saffron rounded-full"/>
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {services.map((service) => (

            <motion.div
              key={service.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="
              bg-white dark:bg-charcoal
              border border-gold/10
              rounded-3xl
              p-6
              shadow-sm
              hover:shadow-lg
              glow-saffron
              flex flex-col justify-between
              "
            >

              <div>

                <h3 className="text-xl font-heading mb-2">
                  {service.puja_name}
                </h3>

                <p className="text-warmGray/70 text-sm italic mb-6 line-clamp-3">
                  {service.description || "Sacred ritual performed for prosperity and blessings."}
                </p>

                {/* Price Badge */}

                <span className="
                  inline-block
                  bg-saffron/10
                  text-saffron
                  px-4 py-1
                  rounded-full
                  font-semibold
                  text-sm
                  mb-6
                ">
                  ₹{service.price}
                </span>

              </div>


              {/* Book Button */}

              <button
                onClick={() => navigate(`/vazhipadu/booking/${service.id}`)}
                className="
                flex items-center justify-center gap-2
                bg-saffron
                hover:bg-orange-600
                text-white
                py-3
                rounded-xl
                font-semibold
                shadow-md
                transition-all
                active:scale-95
                "
              >

                Book Now
                <ArrowRight size={18}/>

              </button>

            </motion.div>

          ))}

        </div>

      )}

    </div>

  )
}

export default VazhipaduLanding