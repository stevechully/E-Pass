import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { cancelBooking, requestRefund } from "../services/refundService";
import { Calendar, Clock, Ticket, Download, Trash2 } from "lucide-react";

export default function MyEpass() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPasses();
  }, []);

  async function fetchMyPasses() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/epass/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPasses(data.bookings);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Used ONLY for paid passes
  async function handleCancelAndRefund(pass) {
    if (!window.confirm("Are you sure you want to cancel this pass and request a refund?"))
      return;

    try {
      await cancelBooking(pass.id, "EPASS");
      await requestRefund({
        booking_id: pass.id,
        booking_type: "EPASS",
        amount: pass.eco_fee,
        reason: "User requested cancellation from My E-Pass page",
      });
      alert("E-Pass cancelled and refund requested successfully! ✅");
      fetchMyPasses();
    } catch (err) {
      alert(err.response?.data?.message || "Error processing cancellation.");
    }
  }

  function downloadPDF(pass) {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("OFFICIAL TEMPLE E-PASS", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Visit Date: ${new Date(pass.visit_date).toDateString()}`, 20, 60);
    doc.text(`Time Slot: ${pass.entry_slots?.start_time} - ${pass.entry_slots?.end_time}`, 20, 70);
    doc.text(`Security Code: ${pass.qr_code}`, 20, 100);
    doc.save(`EPass-${pass.qr_code}.pdf`);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
      </div>
    );

  return (
    <div className="text-slate-800 flex justify-center px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-2">
            My E-Passes
          </h1>
          <p className="text-slate-500 font-medium">
            View your booked temple passes, download them, or manage cancellations.
          </p>
        </div>

        {passes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Ticket className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">You have not booked any E-Passes yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {passes.map((pass) => (
              <div
                key={pass.id}
                className="bg-white border border-amber-100 rounded-[2rem] p-8 shadow-xl relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-8">
                   <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                      pass.status === "BOOKED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                   }`}>
                     {pass.status}
                   </span>
                </div>

                {/* Pass Info */}
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xl font-heading font-bold text-slate-800">
                      {new Date(pass.visit_date).toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                      <Clock size={16} /> {pass.entry_slots?.start_time} - {pass.entry_slots?.end_time}
                    </p>
                    {/* Visual Badge for Free/Paid Pass */}
                    <p className={`text-xs font-bold uppercase tracking-widest mt-2 px-2.5 py-1 w-max rounded-md ${pass.eco_fee > 0 ? "bg-indigo-50 text-indigo-700" : "bg-green-50 text-green-700"}`}>
                      {pass.eco_fee > 0 ? `ECO FEE PAID (₹${pass.eco_fee})` : "FREE DARSHAN PASS"}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                {pass.status !== "CANCELLED" && (
                  <div className="mt-4 p-8 bg-slate-50 rounded-3xl flex flex-col items-center max-w-sm mx-auto border border-slate-100 shadow-inner">
                    <QRCodeCanvas
                      value={pass.qr_code}
                      size={180}
                      level={"H"}
                      includeMargin={true}
                    />
                    <p className="text-slate-400 text-xs font-mono mt-4 uppercase tracking-[0.2em]">
                      {pass.qr_code}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={() => downloadPDF(pass)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download size={18} /> Download PDF
                  </button>

                  {/* ✅ Dynamic Cancel / Refund Button with Backend bypass for Free passes */}
                  {pass.status === "BOOKED" && (
                    <button
                      onClick={() => {
                        if (pass.eco_fee > 0) {
                          // Paid Pass -> Goes through your refund service
                          handleCancelAndRefund(pass);
                        } else {
                          // Free Pass -> Safely bypass the refund service and cancel directly!
                          if (window.confirm("Are you sure you want to cancel this free pass?")) {
                            const token = localStorage.getItem("token");
                            fetch(`http://localhost:5000/api/epass/cancel/${pass.id}`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                              }
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert("E-Pass cancelled successfully! ✅");
                                fetchMyPasses();
                              } else {
                                alert(data.message || "Failed to cancel booking");
                              }
                            })
                            .catch(() => alert("Error processing cancellation."));
                          }
                        }
                      }}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border border-rose-100"
                    >
                      <Trash2 size={18} />
                      {pass.eco_fee > 0 ? "Cancel & Refund" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}