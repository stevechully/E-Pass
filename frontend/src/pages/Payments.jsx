import { useEffect, useState } from "react";
import { CreditCard, Smartphone, Globe, Wallet, Receipt, Info, IndianRupee, Clock, ArrowRightCircle } from "lucide-react"; 

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/dashboard/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPayments(data.data);
      } else {
        setPayments([]); 
      }
    } catch (error) {
      console.error("Failed to load payments", error);
    } finally {
      setLoading(false);
    }
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case "UPI": return <Smartphone size={18} />;
      case "NETBANKING": return <Globe size={18} />;
      case "WALLET": return <Wallet size={18} />;
      default: return <CreditCard size={18} />;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 animate-in fade-in duration-500">
      <div className="animate-spin h-10 w-10 border-b-2 border-orange-600 rounded-full"></div>
    </div>
  );

  return (
    <div className="text-slate-800 flex justify-center px-4 sm:px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4 border border-amber-100">
            <Receipt className="text-orange-600" size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-3">
            Payment Ledger
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Review your transaction history, contributions, and refund statuses.
          </p>
        </div>

        {/* Empty State */}
        {payments.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">No payments found yet.</p>
          </div>
        )}

        {/* Payments List */}
        <div className="space-y-6">
          {payments.map((p) => {
            const isSuccess = p.payment_status === "SUCCESS";
            
            return (
              <div
                key={p.id}
                className="bg-white border border-amber-50 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-500">
                        {p.module}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(p.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <p className="text-4xl font-heading font-black text-slate-800 flex items-center gap-1 mb-2">
                      <IndianRupee size={28} className="text-slate-400" />{p.amount}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        {getMethodIcon(p.payment_method)}
                      </span>
                      Paid via {p.payment_method || "CARD"}
                    </div>
                  </div>

                  {/* Right Side: Status */}
                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-max ${
                        isSuccess
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {p.payment_status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.1em] font-bold mt-1">
                      TXN: {p.id.split('-')[0]}
                    </p>
                  </div>
                </div>

                {/* 🔁 Refund Section */}
                {p.refunds && p.refunds.length > 0 && (
                  <div className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
                    {/* Decorative accent line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-200"></div>
                    
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ArrowRightCircle size={14} className="text-orange-400" />
                        Refund Request
                      </p>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${
                        p.refunds[0].refund_status === "SUCCESS" || p.refunds[0].refund_status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {p.refunds[0].refund_status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                         <span className="text-slate-400 text-xs font-bold block mb-0.5">Amount</span>
                         <span className="font-heading font-black text-slate-700 text-lg flex items-center">
                           <IndianRupee size={16} />{p.refunds[0].amount}
                         </span>
                      </div>
                      
                      {p.refunds[0].refund_status === "PENDING" && (
                        <p className="text-orange-600/80 text-xs font-bold flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
                          <span className="animate-pulse block w-2 h-2 rounded-full bg-orange-500"></span> Processing (5-7 days)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}