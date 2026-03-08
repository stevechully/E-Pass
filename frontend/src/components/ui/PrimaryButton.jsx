export default function PrimaryButton({ children, onClick }) {
    return (
      <button
        onClick={onClick}
        className="
        bg-saffron
        hover:bg-orange-600
        text-white
        px-6 py-3
        rounded-full
        shadow-md
        hover:shadow-lg
        transition-all
        duration-300
        glow-saffron
        active:scale-95
        font-semibold
        "
      >
        {children}
      </button>
    );
  }