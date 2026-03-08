export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
  }) {
  
    const base =
      "px-6 py-3 rounded-full font-semibold transition-all duration-200";
  
    const variants = {
      primary:
        "bg-gradient-to-r from-saffron to-gold text-white shadow-md hover:shadow-glow",
  
      outline:
        "border border-saffron text-saffron hover:bg-saffron hover:text-white",
  
      ghost:
        "text-warmgray hover:text-saffron",
  
      danger:
        "bg-coral text-white hover:opacity-90"
    };
  
    return (
      <button
        {...props}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  }