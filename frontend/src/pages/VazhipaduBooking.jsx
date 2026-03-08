import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { checkAvailability, getAddons } from "../services/vazhipaduService";
import { getSpecialPoojaDates } from "../services/calendarService";
import axios from "axios";
import PaymentModal from "../components/PaymentModal";
import { 
  Sun, // Replaced CalendarIcon
  Flower, // Replaced CheckCircle for spiritual checkmarks
  Sparkles, // Replaced ShieldCheck for confirmation
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Info 
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const VazhipaduBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPayment, setShowPayment] = useState(false);
  const [puja, setPuja] = useState(null);
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  // Step 2 State
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [ecoFee, setEcoFee] = useState(0);

  useEffect(() => {
    fetchPujaAndDates();
    fetchAddons();
  }, [id]);

  const fetchPujaAndDates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/vazhipadu/services`);
      const selected = res.data.services.find((p) => p.id === id);
      setPuja(selected);
      
      const queryParams = new URLSearchParams(location.search);
      const preSelectedDate = queryParams.get("date");

      if (selected?.puja_type === "SPECIAL") {
        const year = new Date().getFullYear();
        const resDates = await getSpecialPoojaDates(id, year);
        const calendarDates = resDates.data || [];
        setAvailableDates(calendarDates);
        
        if (preSelectedDate) {
           const dateExists = calendarDates.some(d => d.pooja_date === preSelectedDate);
           if (dateExists) handleDateChange(preSelectedDate);
        }
      } else if (preSelectedDate) {
          handleDateChange(preSelectedDate);
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddons = async () => {
    try {
      const data = await getAddons();
      setAddons(data.addons || []);
    } catch (err) {
      console.error("Failed to fetch add-ons:", err);
    }
  };

  const handleDateChange = async (date) => {
    setBookingDate(date);
    setAvailability(null);
    if (!date) return;

    setLoading(true);
    try {
      const data = await checkAvailability({ puja_id: id, booking_date: date });
      setAvailability(data);
    } catch (err) {
      setAvailability({ error: err.response?.data?.message || "Date currently unavailable" });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return (puja?.price || 0) + addonTotal + Number(ecoFee);
  };

  if (!puja) return (
    <div className="min-h-screen mandala-bg flex flex-col items-center justify-center text-saffron">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron mb-4"></div>
      <p className="animate-pulse italic text-slate-600 font-heading text-lg">Connecting to Temple Registry...</p>
    </div>
  );

  return (
    // ✅ Step 1: Spiritual Mandala Background
    <div className="min-h-screen mandala-bg text-slate-800 dark:text-warmGray p-4 md:p-10 relative font-sans">
      
      {/* 🧭 Header & Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-saffron transition-colors mb-2 text-sm font-bold tracking-wide">
             <ArrowLeft size={16} /> Back to Offerings
           </button>
           <h1 className="text-4xl font-heading font-bold text-slate-800 dark:text-white tracking-tight">{puja.puja_name}</h1>
           <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">
             Divine Offering for {puja.puja_type === 'SPECIAL' ? 'Festival Occasions' : 'Daily Peace'}
           </p>
        </div>
        
        {/* ✅ Step 4: Upgraded Step Indicator */}
        <div className="flex items-center gap-3 bg-white dark:bg-charcoal p-2 rounded-2xl border border-gold/20 shadow-sm self-start">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= num ? "bg-saffron text-white shadow-md" : "bg-slate-100 dark:bg-warmGray/20 text-slate-400"}`}>
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* 📋 Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: DATE SELECTION */}
          {step === 1 && (
            // ✅ Step 2: Clean White Cards
            <div className="bg-white dark:bg-charcoal p-8 rounded-3xl border border-gold/10 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <Sun className="text-saffron" size={28} />
                <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white">Select Auspicious Date</h2>
              </div>

              {puja.puja_type === "SPECIAL" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDates.length > 0 ? (
                    availableDates.map((item) => (
                      <button
                        key={item.id}
                        disabled={item.available_slots <= 0}
                        onClick={() => handleDateChange(item.pooja_date)}
                        className={`group p-5 text-left rounded-2xl border transition-all relative overflow-hidden ${
                          bookingDate === item.pooja_date
                            // ✅ Step 3: Saffron Theme applied
                            ? "bg-saffron/10 border-saffron ring-2 ring-saffron/20"
                            : "bg-slate-50 dark:bg-gray-900/40 border-slate-200 hover:border-saffron/50"
                        } ${item.available_slots <= 0 ? "opacity-40 grayscale cursor-not-allowed" : ""}`}
                      >
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Upcoming Date</p>
                        <p className="text-lg font-black text-slate-800 dark:text-white">
                          {new Date(item.pooja_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.available_slots > 10 ? "bg-saffron/10 text-saffron" : "bg-orange-100 text-orange-600"}`}>
                            {item.available_slots > 0 ? `${item.available_slots} Slots` : "Sold Out"}
                          </span>
                          {bookingDate === item.pooja_date && <Flower size={18} className="text-saffron" />}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 text-center border border-dashed border-slate-300 rounded-2xl">
                       <p className="text-slate-500 italic font-heading">No scheduled calendar dates found for this pooja.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-sm">
                  <input
                    type="date"
                    className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 focus:outline-none transition-all text-lg font-bold text-slate-800 dark:text-white"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-2 font-bold tracking-wide">
                    <Info size={14} className="text-saffron"/> You can book this daily pooja for any upcoming day.
                  </p>
                </div>
              )}

              {availability?.remaining_slots >= 0 && (
                <div className="mt-8 flex items-center gap-3 p-4 bg-saffron/10 rounded-2xl border border-saffron/20">
                  <Flower className="text-saffron" size={20} />
                  <p className="text-sm font-bold text-slate-700">Confirmed: Slots are currently available for the selected date.</p>
                </div>
              )}

              {availability?.error && (
                <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-sm font-bold text-red-700">{availability.error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ADD-ONS */}
          {step === 2 && (
            <div className="bg-white dark:bg-charcoal p-8 rounded-3xl border border-gold/10 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-heading font-bold mb-8 text-slate-800 dark:text-white">Personalize Your Offering</h2>
              <div className="grid gap-4">
                {addons.map(addon => (
                  <label
                    key={addon.id}
                    className={`flex justify-between items-center p-5 rounded-2xl cursor-pointer transition-all border ${
                      selectedAddons.includes(addon.id) ? "bg-saffron/10 border-saffron shadow-sm" : "bg-slate-50 dark:bg-gray-900/40 border-slate-200 hover:border-saffron/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedAddons.includes(addon.id) ? "bg-saffron border-saffron" : "border-slate-300"}`}>
                        {selectedAddons.includes(addon.id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => {
                          setSelectedAddons(prev => prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]);
                        }}
                      />
                      <span className="font-bold text-slate-700">{addon.addon_name}</span>
                    </div>
                    <span className="text-saffron font-black text-lg">₹{addon.price}</span>
                  </label>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Support Temple Environment (Eco Fee)</label>
                <div className="relative max-w-xs">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                   <input
                     type="number"
                     min="0"
                     value={ecoFee || ""}
                     placeholder="Optional Contribution"
                     onChange={(e) => setEcoFee(Number(e.target.value))}
                     className="w-full p-4 pl-10 rounded-2xl bg-slate-50 border border-slate-200 focus:border-saffron focus:outline-none font-bold text-slate-800"
                   />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="bg-white dark:bg-charcoal p-8 rounded-3xl border border-gold/10 shadow-lg animate-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="text-saffron" size={28} />
                  <h2 className="text-2xl font-heading font-bold text-slate-800 dark:text-white">Confirmation</h2>
               </div>
               
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500 font-bold">Offering</span>
                    <span className="font-black text-slate-800">{puja.puja_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">Date</span>
                    <span className="font-black text-slate-800">{new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between items-start py-2 border-t border-slate-200">
                      <span className="text-slate-500 font-bold">Add-ons</span>
                      <div className="text-right">
                        {selectedAddons.map(id => <p key={id} className="text-sm font-bold text-saffron">{addons.find(a => a.id === id)?.addon_name}</p>)}
                      </div>
                    </div>
                  )}
               </div>

               {/* ✅ Step 7: Saffron Glow Payment Section */}
               <div className="mt-10 flex flex-col sm:flex-row items-center gap-6 bg-saffron/5 p-6 rounded-3xl border border-saffron/20">
                  <div className="flex-1 text-center sm:text-left">
                     <p className="text-xs text-saffron font-black uppercase tracking-widest mb-1">Total Secure Payment</p>
                     <p className="text-5xl font-heading font-bold text-slate-800">₹{calculateTotal()}</p>
                  </div>
                  {/* ✅ Step 6: Upgraded Pay Button */}
                  {/* ✅ Step 6: Upgraded Pay Button (Strict local check removed) */}
<button 
  onClick={() => setShowPayment(true)} 
  className="w-full sm:w-auto px-10 py-5 bg-saffron hover:bg-orange-600 text-white font-bold rounded-2xl shadow-md glow-saffron transition-all active:scale-95 text-lg"
>
  Proceed to Pay
</button>
               </div>
            </div>
          )}
        </div>

        {/* 💳 Sidebar Summary */}
        <div className="space-y-6">
          {/* ✅ Step 5: Improved Booking Progress Sidebar */}
          <div className="bg-white dark:bg-charcoal p-6 rounded-3xl border border-gold/10 shadow-lg">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Booking Progress</h3>
             <div className="space-y-6">
                <div className={`flex items-center gap-3 ${step >= 1 && bookingDate ? 'text-saffron' : 'text-slate-400'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 1 && bookingDate ? 'bg-saffron shadow-sm shadow-saffron' : 'bg-slate-200'}`}></div>
                   <p className="text-sm font-bold">Selected Date</p>
                </div>
                <div className={`flex items-center gap-3 ${step >= 2 ? 'text-saffron' : 'text-slate-400'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-saffron shadow-sm shadow-saffron' : 'bg-slate-200'}`}></div>
                   <p className="text-sm font-bold">Customizations</p>
                </div>
                <div className={`flex items-center gap-3 ${step >= 3 ? 'text-saffron' : 'text-slate-400'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-saffron shadow-sm shadow-saffron' : 'bg-slate-200'}`}></div>
                   <p className="text-sm font-bold">Payment Ready</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            {step === 1 && (
               <button
                 disabled={!bookingDate || availability?.error || loading}
                 onClick={() => setStep(2)}
                 className="w-full py-5 bg-saffron hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm"
               >
                 Next Step <ArrowRight size={18} />
               </button>
            )}
            {step === 2 && (
               <>
                 <button onClick={() => setStep(3)} className="w-full py-5 bg-saffron hover:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm">
                    Review Summary <ArrowRight size={18} />
                 </button>
                 <button onClick={() => setStep(1)} className="w-full py-4 text-slate-500 hover:text-saffron font-bold transition-colors">Go Back</button>
               </>
            )}
             {step === 3 && (
               <button onClick={() => setStep(2)} className="w-full py-4 text-slate-500 hover:text-saffron font-bold transition-colors">Change Details</button>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        puja={puja}
        bookingDate={bookingDate}
        selectedAddons={selectedAddons}
        ecoFee={ecoFee}
        totalAmount={calculateTotal()}
        onSuccess={(bookingId) => navigate(`/vazhipadu/success/${bookingId}`)}
      />
    </div>
  );
};

export default VazhipaduBooking;