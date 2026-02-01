import { useEffect, useState } from "react";

export default function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const token = localStorage.getItem("token");
  
    const res = await fetch(
      "http://localhost:5000/api/dashboard/payments",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const data = await res.json();
  
    if (data.success && Array.isArray(data.data)) {
      setPayments(data.data);
    } else {
      setPayments([]); // fallback
    }
  }
  

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Payments History</h1>

      {payments.length === 0 && (
        <p className="text-gray-400">No payments found</p>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 p-6 rounded-xl"
          >
            <p><b>Module:</b> {p.module}</p>
            <p><b>Amount:</b> ₹{p.amount}</p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={
                  p.payment_status === "SUCCESS"
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {p.payment_status}
              </span>
            </p>

            {/* Refunds */}
            
          </div>
        ))}
      </div>
    </div>
  );
}
