import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf"; // ✅ Ensure you've run 'npm install jspdf'

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setPasses(data.bookings);
      }
    } catch (err) {
      alert("Failed to load passes");
    } finally {
      setLoading(false);
    }
  }

  // ✅ CANCEL PASS
  async function cancelPass(id) {
    const token = localStorage.getItem("token");
    if (!confirm("Cancel this pass?")) return;

    const res = await fetch(`http://localhost:5000/api/epass/cancel/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      alert("Cancelled ✅");
      fetchMyPasses();
    } else {
      alert(data.message || "Cancel failed");
    }
  }

  // ✅ UPDATED: DOWNLOAD ACTUAL PDF
  function downloadPDF(pass) {
    const doc = new jsPDF();

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("OFFICIAL E-PASS", 105, 20, { align: "center" });

    // 2. Pass Details
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35); // Horizontal line

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("VISIT INFORMATION", 20, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Visit Date: ${new Date(pass.visit_date).toDateString()}`, 20, 60);
    doc.text(`Time Slot: ${pass.entry_slots?.start_time} - ${pass.entry_slots?.end_time}`, 20, 70);
    doc.text(`Current Status: ${pass.status}`, 20, 80);

    // 3. QR Code Reference
    doc.setFont("helvetica", "bold");
    doc.text("SECURITY CODE:", 20, 100);
    doc.setFont("courier", "bold");
    doc.setFontSize(16);
    doc.text(pass.qr_code, 20, 110);

    // 4. Footer Note
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Please present this pass at the gate for entry.", 105, 140, { align: "center" });

    // 5. Save the file
    doc.save(`EPass-${pass.qr_code}.pdf`);
  }

  if (loading) return <p className="p-8 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My E-Passes</h1>

      {passes.length === 0 ? (
        <p className="text-gray-400">No bookings yet</p>
      ) : (
        <div className="grid gap-6 max-w-2xl">
          {passes.map((pass) => (
            <div
              key={pass.id}
              className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-400 font-semibold text-lg">
                    {new Date(pass.visit_date).toDateString()}
                  </p>
                  <p className="text-gray-300">
                    Time: {pass.entry_slots?.start_time} - {pass.entry_slots?.end_time}
                  </p>
                  <p className="mt-1">
                    Status:{" "}
                    <span className={pass.status === "BOOKED" ? "text-green-400" : "text-red-400"}>
                      {pass.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* ✅ VISUAL QR CODE DISPLAY */}
              <div className="mt-4 p-6 bg-white rounded-xl flex flex-col items-center justify-center">
                <QRCodeCanvas 
                  value={pass.qr_code} 
                  size={180} 
                  level={"H"} 
                  includeMargin={true}
                />
                <p className="text-black text-sm font-mono mt-3 opacity-70">
                  {pass.qr_code}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 mt-6">
                {pass.status === "BOOKED" && (
                  <button
                    onClick={() => cancelPass(pass.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => downloadPDF(pass)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}