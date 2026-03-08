export default function LotusIcon({ children }) {
    return (
      <div
        className="
          p-3
          rounded-xl
          bg-gradient-to-br
          from-orange-50
          to-amber-50
          text-orange-600
          flex items-center justify-center
          shadow-sm
          border border-amber-200/50
          glow-saffron
          transition-transform
          active:scale-95
        "
      >
        {children}
      </div>
    );
  }