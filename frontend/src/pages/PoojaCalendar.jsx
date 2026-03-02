import { useEffect, useState } from "react";
import { getCalendarByYear } from "../services/calendarService";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

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
    <div className="max-w-5xl mx-auto p-6 bg-slate-900 min-h-screen text-white">
      <h1 className="text-4xl font-black mb-4 text-center text-emerald-400">Pooja Calendar {year}</h1>
      <p className="text-gray-400 text-center mb-8 italic">Informational guide for auspicious temple events and festivals.</p>

      {/* Informational Banner */}
      <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-2xl mb-8 flex items-start gap-4">
        <Info className="text-emerald-400 shrink-0 mt-1" size={20} />
        <div>
          <p className="text-emerald-400 font-semibold mb-1">Centralized Booking</p>
          <p className="text-sm text-gray-300">
            To ensure slot accuracy, all bookings must be made through the 
            <span className="font-bold text-white"> Vazhipadu</span> menu. 
            Daily poojas like <span className="font-bold text-white">Archana</span> are available every day.
          </p>
        </div>
      </div>

      {calendar.length === 0 && (
        <div className="text-center p-12 bg-slate-800 rounded-2xl border border-slate-700">
          <p className="text-gray-400 italic">No special poojas scheduled yet for {year}.</p>
        </div>
      )}

      <div className="space-y-4">
        {sortedMonths.map((month) => (
          <div key={month} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-800 shadow-lg">
            <button
              className="w-full flex justify-between items-center p-5 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              onClick={() =>
                setOpenMonths(prev => ({
                  ...prev,
                  [month]: !prev[month]
                }))
              }
            >
              <span className="text-xl font-bold text-emerald-400 tracking-wide">{month}</span>
              {openMonths[month] ? <ChevronDown size={24} className="text-emerald-500" /> : <ChevronRight size={24} className="text-gray-500" />}
            </button>

            {openMonths[month] && (
              <div className="p-4 bg-slate-900/30 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700 text-gray-500 text-xs font-black uppercase tracking-widest">
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Event Name</th>
                      <th className="py-3 px-2 text-right">Price</th>
                      <th className="py-3 px-2 text-right">Booking Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {grouped[month].map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/10 transition-colors">
                        <td className="py-4 px-2 whitespace-nowrap text-sm font-medium">
                          {new Date(item.pooja_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </td>
                        
                        <td className="py-4 px-2">
                          <span className="font-semibold text-white">
                            {item.vazhipadu_services?.puja_name || item.event_name || "Special Event"}
                          </span>
                        </td>

                        <td className="py-4 px-2 text-right text-emerald-400 font-bold">
                          {item.vazhipadu_services?.price ? `₹${item.vazhipadu_services.price}` : "-"}
                        </td>

                        <td className="py-4 px-2 text-right">
                          {item.is_bookable ? (
                            <span className="text-emerald-400/80 font-bold text-xs bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                              Book via Vazhipadu Menu
                            </span>
                          ) : (
                            <span className="text-gray-500 italic text-xs">
                              Not Bookable Online
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}