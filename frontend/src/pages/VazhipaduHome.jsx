import { useNavigate } from "react-router-dom"
import { Clock, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function VazhipaduHome() {

  const navigate = useNavigate()

  return (

    <div className="min-h-screen mandala-bg flex flex-col items-center justify-center p-8">

      {/* Page Heading */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12"
      >

        <h1 className="text-4xl font-heading text-warmGray mb-3">
          Temple Offerings
        </h1>

        <p className="text-warmGray/70 max-w-lg">
          Book sacred poojas and rituals performed by temple priests for prosperity and divine blessings.
        </p>

      </motion.div>


      {/* Cards Grid */}

      <div className="grid md:grid-cols-2 gap-10 w-full max-w-4xl">

        {/* Daily Poojas */}

        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate("/vazhipadu/daily")}
          className="
          cursor-pointer
          bg-white
          dark:bg-charcoal
          border border-gold/10
          p-10
          rounded-3xl
          shadow-sm
          hover:shadow-lg
          glow-saffron
          transition-all
          "
        >

          <Clock className="text-saffron mb-4" size={34} />

          <h2 className="text-2xl font-heading mb-3">
            Daily Poojas
          </h2>

          <p className="text-warmGray/70 mb-6">
            Book recurring rituals such as Archana, Pushpanjali, and Sahasranama for any upcoming date.
          </p>

          <div className="flex items-center text-saffron font-semibold gap-2">
            Explore <ArrowRight size={18}/>
          </div>

        </motion.div>


        {/* Special Poojas */}

        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate("/vazhipadu/special")}
          className="
          cursor-pointer
          bg-white
          dark:bg-charcoal
          border border-gold/10
          p-10
          rounded-3xl
          shadow-sm
          hover:shadow-lg
          glow-saffron
          transition-all
          "
        >

          <Sparkles className="text-saffron mb-4" size={34} />

          <h2 className="text-2xl font-heading mb-3">
            Special Poojas
          </h2>

          <p className="text-warmGray/70 mb-6">
            Participate in grand ceremonies and seasonal rituals performed on auspicious dates.
          </p>

          <div className="flex items-center text-saffron font-semibold gap-2">
            View Events <ArrowRight size={18}/>
          </div>

        </motion.div>

      </div>

    </div>
  )
}