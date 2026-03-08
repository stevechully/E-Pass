export default function SectionCard({ children, title }) {

    return (
      <div className="bg-white dark:bg-charcoal 
        p-8 rounded-2xl shadow-md 
        border border-gold/10">
  
        {title && (
          <h2 className="text-xl font-heading mb-6">
            {title}
          </h2>
        )}
  
        {children}
  
      </div>
    );
  }