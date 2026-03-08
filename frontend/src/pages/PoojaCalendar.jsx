import { useEffect, useState } from "react";
import { getCalendarByYear } from "../services/calendarService";
import { ChevronDown, ChevronRight, Info, CalendarDays, Calendar as CalendarIcon } from "lucide-react";

export default function PoojaCalendar() {
  const [year] = useState(new Date().getFullYear());
  const [calendar, setCalendar] = useState([]);
  const [openMonths, setOpenMonths] = useState({});

  useEffect(() => {
    fetchCalendar();
  }, [year]);

  const fetchCalendar = async () => {
    try {
      const data = await getCalendarByYear(year);
      setCalendar(data.data || []);
      
      // Auto-open current month
      const currentMonth = new Date().toLocaleString("default", { month: "long" });
      setOpenMonths({ [currentMonth]: true });
    } catch (err) {
      console.error("Error loading calendar:", err);
    }
  };

  const grouped = calendar.reduce((acc, item) => {
    const date = new Date(item.pooja_date);
    const month = date.toLocaleString("default", { month: "long" });

    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const sortedMonths = Object.keys(grouped).sort(
    (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
  );

  return (
    <div className="text-slate-800 flex justify-center px-4 sm:px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4 border border-amber-100">
            <CalendarDays className="text-orange-600" size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-3">
            Pooja Calendar {year}
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Your informational guide for auspicious temple events, festivals, and special poojas.
          </p>
        </div>

        {/* Informational Banner */}
        <div className="bg-orange-50/80 border border-orange-100 rounded-3xl p-6 mb-10 flex items-start gap-4 shadow-sm">
          <Info className="text-orange-600 shrink-0 mt-0.5" size={24} />
          <div>
            <p className="text-orange-800 font-bold mb-1 text-lg">Centralized Booking</p>
            <p className="text-slate-600 font-medium leading-relaxed">
              To ensure slot accuracy, all bookings must be made through the 
              <span className="font-bold text-slate-800"> Vazhipadu</span> menu. 
              Daily poojas like <span className="font-bold text-slate-800">Archana</span> are available every day and do not appear on this special events calendar.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {calendar.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <CalendarIcon className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">No special poojas scheduled yet for {year}.</p>
          </div>
        )}

        {/* Calendar Accordion */}
        <div className="space-y-4">
          {sortedMonths.map((month) => (
            <div key={month} className="bg-white border border-amber-50 rounded-[2rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
              <button
                className="w-full flex justify-between items-center p-6 sm:px-8 bg-white hover:bg-orange-50/30 transition-colors cursor-pointer"
                onClick={() =>
                  setOpenMonths(prev => ({
                    ...prev,
                    [month]: !prev[month]
                  }))
                }
              >
                <span className="text-2xl font-heading font-bold text-slate-800">{month}</span>
                <div className={`p-2 rounded-full transition-colors ${openMonths[month] ? 'bg-orange-50 text-orange-500' : 'text-slate-300'}`}>
                   {openMonths[month] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </div>
              </button>

              {openMonths[month] && (
                <div className="px-6 sm:px-8 pb-6 pt-0">
                  <div className="flex flex-col gap-2">
                    {grouped[month].map((item) => {
                      const dateObj = new Date(item.pooja_date);
                      const isBookable = item.is_bookable;
                      const price = item.vazhipadu_services?.price;

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all gap-4">
                          
                          {/* Left: Date & Name */}
                          <div className="flex items-center gap-4 sm:gap-6">
                            {/* Date Badge */}
                            <div className="flex flex-col items-center justify-center bg-orange-50/80 border border-orange-100 rounded-xl min-w-[70px] h-[70px] shrink-0">
                              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-0.5">
                                {dateObj.toLocaleString('en-IN', { month: 'short' })}
                              </span>
                              <span className="text-2xl font-heading font-black text-slate-800 leading-none">
                                {dateObj.toLocaleString('en-IN', { day: '2-digit' })}
                              </span>
                            </div>
                            
                            {/* Event Details */}
                            <div>
                              <p className="text-lg font-heading font-bold text-slate-800">
                                {item.vazhipadu_services?.puja_name || item.event_name || "Special Event"}
                              </p>
                              {price && (
                                <p className="text-orange-600 font-bold mt-1 text-sm">
                                  ₹{price}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Status Badge */}
                          <div className="sm:text-right ml-[86px] sm:ml-0">
                            {isBookable ? (
                              <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 w-full sm:w-auto">
                                Book via Vazhipadu
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100 w-full sm:w-auto">
                                In-Person Event
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}