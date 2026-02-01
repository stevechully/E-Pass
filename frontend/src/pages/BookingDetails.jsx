import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BookingDetails() {
  const { module, id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  async function fetchDetails() {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/dashboard/booking/${module}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (result.success) {
      setData(result.data);
    }
  }

  if (!data) return <p className="p-8 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Booking Details</h1>

      {/* Booking */}
      <div className="bg-slate-800 p-6 rounded-xl mb-6">
        <h2 className="text-xl mb-4">Booking Info</h2>
        <p>Status: {data.booking.status}</p>
        <p>ID: {data.booking.id}</p>
      </div>

      {/* Payment */}
      {data.payment && (
        <div className="bg-slate-800 p-6 rounded-xl mb-6">
          <h2 className="text-xl mb-4">Payment</h2>
          <p>Amount: ₹{data.payment.amount}</p>
          <p>Status: {data.payment.payment_status}</p>
        </div>
      )}

      {/* Refund */}
      {data.refund && (
        <div className="bg-slate-800 p-6 rounded-xl mb-6">
          <h2 className="text-xl mb-4">Refund</h2>
          <p>Amount: ₹{data.refund.amount}</p>
          <p>Status: {data.refund.refund_status}</p>
        </div>
      )}

      {/* Cancellation */}
      {data.cancellation && (
        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-xl mb-4">Cancellation</h2>
          <p>Reason: {data.cancellation.cancellation_reasons.reason_code}</p>
          <p>Date: {new Date(data.cancellation.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
