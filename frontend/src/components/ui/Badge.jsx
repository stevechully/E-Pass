export default function Badge({ children, variant = "default" }) {

    const variants = {
      success: "bg-forest text-white",
      warning: "bg-saffron text-white",
      danger: "bg-coral text-white",
      default: "bg-gold text-charcoal"
    };
  
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}
      >
        {children}
      </span>
    );
  }