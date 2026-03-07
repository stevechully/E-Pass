import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAdminPendingRefunds, processAdminRefund } from '../services/refundService';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const data = await getAdminPendingRefunds();
      if (data.success) setRefunds(data.refunds);
    } catch (err) {
      console.error("Failed to load refunds:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this refund?`)) return;
    
    try {
      await processAdminRefund(id, action);
      alert(`Refund ${action.toLowerCase()}ed successfully!`);
      loadRefunds(); // Refresh table
    } catch (err) {
      alert("Action failed. Check backend console.");
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Pending Refunds</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading requests...</p>
        ) : refunds.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100">No pending refunds found.</p>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-4">Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Date Requested</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-700">{r.booking_type}</td>
                    <td className="p-4 text-emerald-600 font-bold">₹{r.amount}</td>
                    <td className="p-4 text-sm text-gray-500">{r.reason}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(r.id, 'APPROVE')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded shadow-sm text-xs font-bold transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(r.id, 'REJECT')}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded shadow-sm text-xs font-bold transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}