import { supabase } from "../config/supabase.js";

/**
 * GET /api/admin/refunds
 * List all pending refunds
 */
export const getPendingRefunds = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("refunds")
      .select(`
        id,
        booking_id,
        module,
        amount,
        refund_status,
        created_at,
        user_id
      `)
      .eq("refund_status", "PENDING")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/refunds/:id/complete
 */
export const completeRefund = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 🔴 DEBUG LOGS START
    console.log("------------------------------------------------");
    console.log("🚀 REFUND COMPLETE ATTEMPT STARTED");
    console.log("👉 Refund ID Target:", id);
    console.log("👉 Request User Email:", req.user?.email);
    console.log("👉 Request User ID:", req.user?.id);

    const { data, error } = await supabase
      .from("refunds")
      .update({
        // ✅ FIX: Changed to "COMPLETED" to match your DB Enum/Constraint
        refund_status: "COMPLETED",
        processed_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("refund_status", "PENDING") // ✅ Restored PENDING check
      .select()
      .single();

    console.log("👉 SUPABASE RESPONSE DATA:", data);
    console.log("👉 SUPABASE RESPONSE ERROR:", error);
    console.log("------------------------------------------------");
    // 🔴 DEBUG LOGS END

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: "Unable to update refund. ID might be invalid, status not PENDING, or RLS is blocking update."
      });
    }

    res.json({
      success: true,
      message: "Refund marked as completed",
      data
    });
  } catch (err) {
    console.error("❌ CONTROLLER CRASH:", err);
    next(err);
  }
};