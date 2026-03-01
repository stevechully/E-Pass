import { useEffect, useState } from "react";
// ✅ 1. Added useNavigate
import { useParams, useNavigate } from "react-router-dom";
import { checkAvailability, getAddons } from "../services/vazhipaduService";
import axios from "axios";
// ✅ 2. Added PaymentModal import
import PaymentModal from "../components/PaymentModal";

const API = import.meta.env.VITE_API_URL;

const VazhipaduBooking = () => {
  const { id } = useParams();
  
  // ✅ 3. Added useNavigate and Payment state
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  // Existing State
  const [puja, setPuja] = useState(null);
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 2 State
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [ecoFee, setEcoFee] = useState(0);

  useEffect(() => {
    fetchPuja();
    fetchAddons(); 
  }, []);

  const fetchPuja = async () => {
    try {
      const res = await axios.get(`${API}/vazhipadu/services`);
      const selected = res.data.services.find((p) => p.id === id);
      setPuja(selected);
    } catch (err) {
      console.error("Failed to fetch puja:", err);
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
      const data = await checkAvailability({
        puja_id: id,
        booking_date: date
      });

      setAvailability(data);
    } catch (err) {
      setAvailability({
        error: err.response?.data?.message || "Unavailable"
      });
    }
    setLoading(false);
  };

  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);

    return (puja?.price || 0) + addonTotal + ecoFee;
  };

  if (!puja) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4 font-semibold">
          <span className={step >= 1 ? "text-green-400" : "text-gray-500"}>1. Date</span>
          <span className={step >= 2 ? "text-green-400" : "text-gray-500"}>2. Add-ons</span>
          <span className={step >= 3 ? "text-green-400" : "text-gray-500"}>3. Confirm</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* STEP 1: DATE SELECTION                     */}
      {/* ========================================== */}
      {step === 1 && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-3">
            Select Date for {puja.puja_name}
          </h2>

          <input
            type="date"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none transition"
            min={new Date().toISOString().split("T")[0]}
            value={bookingDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />

          {loading && <p className="mt-3 text-gray-400 text-sm">Checking availability...</p>}

          {availability?.remaining_slots >= 0 && (
            <p className="mt-3 text-green-400 font-medium bg-green-900/20 p-2 rounded border border-green-500/30">
              Remaining Slots: {availability.remaining_slots}
            </p>
          )}

          {availability?.error && (
            <p className="mt-3 text-red-400 font-medium bg-red-900/20 p-2 rounded border border-red-500/30">
              {availability.error}
            </p>
          )}

          <button
            disabled={!availability || availability.error}
            onClick={() => setStep(2)}
            className={`mt-6 w-full py-3 font-bold rounded-lg transition-all ${
              availability?.error || !availability
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 2: ADD-ONS & TOTAL CALCULATION        */}
      {/* ========================================== */}
      {step === 2 && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-3">
            Select Add-ons
          </h2>

          <div className="space-y-3">
            {addons.map(addon => (
              <label
                key={addon.id}
                className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedAddons.includes(addon.id) 
                    ? "bg-green-900/20 border-green-500" 
                    : "bg-gray-700 border-gray-600 hover:border-gray-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-green-500 cursor-pointer rounded"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => {
                      if (selectedAddons.includes(addon.id)) {
                        setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                      } else {
                        setSelectedAddons([...selectedAddons, addon.id]);
                      }
                    }}
                  />
                  <span className="font-medium">{addon.addon_name}</span>
                </div>
                <span className="text-green-400 font-bold">
                  ₹{addon.price}
                </span>
              </label>
            ))}
            
            {addons.length === 0 && (
              <p className="text-gray-400 text-sm italic">No add-ons available for this puja.</p>
            )}
          </div>

          {/* ECO FEE */}
          <div className="mt-6">
            <label className="block mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Eco Fee (Plastic Control)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                min="0"
                value={ecoFee === 0 ? "" : ecoFee}
                placeholder="0"
                onChange={(e) => setEcoFee(Number(e.target.value))}
                className="w-full p-3 pl-8 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* TOTAL DISPLAY */}
          <div className="mt-8 border-t border-gray-700 pt-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Puja Price</span>
              <span className="font-medium text-white">₹{puja?.price || 0}</span>
            </div>

            <div className="flex justify-between text-gray-300">
              <span>Add-ons Total</span>
              <span className="font-medium text-white">
                ₹{
                  selectedAddons.reduce((sum, id) => {
                    const addon = addons.find(a => a.id === id);
                    return sum + (addon?.price || 0);
                  }, 0)
                }
              </span>
            </div>

            <div className="flex justify-between text-gray-300">
              <span>Eco Fee</span>
              <span className="font-medium text-white">₹{ecoFee}</span>
            </div>

            <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-700">
              <span className="text-white">Total Amount</span>
              <span className="text-green-400">
                ₹{calculateTotal()}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all active:scale-95"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 3: CONFIRMATION SUMMARY               */}
      {/* ========================================== */}
      {step === 3 && (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-3">
            Confirm Booking
          </h2>

          <div className="space-y-4 text-gray-300">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-400">Puja:</span>
              <span className="text-white font-medium">{puja.puja_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-400">Date:</span>
              <span className="text-white font-medium">{bookingDate}</span>
            </div>
            
            <div className="flex justify-between border-t border-gray-700 pt-4 mt-2">
              <span className="font-semibold text-white">Total Amount:</span>
              <span className="text-green-400 font-bold text-lg">₹{calculateTotal()}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setShowPayment(true)}
              className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all active:scale-95"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PAYMENT MODAL                              */}
      {/* ========================================== */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        // 👇 Explicitly mapping all props
        puja={puja}
        bookingDate={bookingDate}
        selectedAddons={selectedAddons}
        ecoFee={ecoFee}
        totalAmount={calculateTotal()}
        onSuccess={(bookingId) => {
          navigate(`/vazhipadu/success/${bookingId}`);
        }}
      />

    </div>
  );
};

export default VazhipaduBooking;