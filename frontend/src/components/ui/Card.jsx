export default function Card({ children, className = "" }) {
    return (
      <div
        className={`bg-white dark:bg-charcoal rounded-temple shadow-temple p-6 border border-gold/20 ${className}`}
      >
        {children}
      </div>
    );
  }