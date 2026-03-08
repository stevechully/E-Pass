export default function PageHeader({ title, subtitle, action }) {

    return (
      <div className="flex justify-between items-center mb-8">
  
        <div>
  
          <h1 className="text-3xl font-heading text-warmGray">
            {title}
          </h1>
  
          {subtitle && (
            <p className="text-sm text-warmGray/70 mt-1">
              {subtitle}
            </p>
          )}
  
        </div>
  
        {action && action}
  
      </div>
    );
  }