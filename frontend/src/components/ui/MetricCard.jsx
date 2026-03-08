export default function MetricCard({ title, value, icon, color = "saffron" }) {

    // Temple design palette
    const colors = {
      saffron: "text-saffron bg-saffron/10 border-saffron/20",
      forest: "text-emerald-700 bg-emerald-100/70 border-emerald-200",
      gold: "text-amber-600 bg-amber-100/70 border-amber-200",
      coral: "text-rose-600 bg-rose-100/70 border-rose-200",
      warmgray: "text-warmGray bg-warmGray/10 border-warmGray/20"
    };
  
    const activeColor = colors[color] || colors.saffron;
  
    return (
      <div
        className="
        bg-white dark:bg-charcoal
        p-6
        rounded-2xl
        border border-gold/10
        shadow-sm
        flex items-center justify-between
        transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        "
      >
        
        {/* TEXT */}
        <div className="space-y-1">
  
          <p className="text-xs font-semibold uppercase tracking-widest text-warmGray/60">
            {title}
          </p>
  
          <h2 className="text-3xl font-heading font-bold text-warmGray">
            {value}
          </h2>
  
        </div>
  
        {/* ICON */}
        <div
          className={`
          p-4
          rounded-xl
          border
          flex items-center justify-center
          ${activeColor}
          shadow-sm
          `}
        >
          <div className="text-xl">
            {icon}
          </div>
        </div>
  
      </div>
    );
  }