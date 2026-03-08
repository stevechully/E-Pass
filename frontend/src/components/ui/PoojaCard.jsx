import { motion } from "framer-motion"

export default function PoojaCard({
  title,
  description,
  icon,
  onClick
}) {

  return (

    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="
      cursor-pointer
      bg-white
      dark:bg-charcoal
      p-8
      rounded-2xl
      border border-gold/10
      shadow-sm
      hover:shadow-lg
      glow-saffron
      transition-all
      "
    >

      <div className="mb-4 text-saffron">
        {icon}
      </div>

      <h3 className="text-xl font-heading text-warmgray mb-2">
        {title}
      </h3>

      <p className="text-sm text-warmgray/70 leading-relaxed">
        {description}
      </p>

      <div className="mt-4 text-saffron font-semibold text-sm">
        Explore →
      </div>

    </motion.div>

  )
}