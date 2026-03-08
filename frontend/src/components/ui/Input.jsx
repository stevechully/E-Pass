export default function Input({ label, className="", ...props }) {

    return (
      <div className="flex flex-col gap-2">
  
        {label && (
          <label className="text-sm text-warmgray font-semibold">
            {label}
          </label>
        )}
  
        <input
          {...props}
          className={`border border-gold/30 rounded-lg px-4 py-3 bg-white dark:bg-charcoal focus:outline-none focus:ring-2 focus:ring-saffron ${className}`}
        />
  
      </div>
    );
  }