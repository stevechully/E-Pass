import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-gold/20 bg-white dark:bg-charcoal">

      {/* Left: App Title */}
      <h1 className="font-heading text-xl text-warmgray">
        Temple Portal
      </h1>

      {/* Right: Theme toggle */}
      <button
        onClick={() =>
          setTheme(theme === "dark" ? "light" : "dark")
        }
        className="p-2 rounded-full hover:bg-gold/20 transition"
      >
        {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

    </div>
  );
}