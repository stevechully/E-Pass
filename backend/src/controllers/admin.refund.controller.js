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
        user_id,
        payment_id,
        profiles ( full_name )
      `)
      .eq("refund_status", "PENDING") // ✅ Matches your DB Enum
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
 * POST /api/admin/refunds/:id/process
 * Processes a refund (APPROVE or REJECT) and updates the payments table.
 */
export const processRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // Expects "APPROVE" or "REJECT"

    // 🔴 DEBUG LOGS START
    console.log("------------------------------------------------");
    console.log("🚀 REFUND PROCESS ATTEMPT STARTED");
    console.log("👉 Refund ID Target:", id);
    console.log("👉 Action Requested:", action);
    console.log("👉 Request User Email:", req.user?.email);
    console.log("------------------------------------------------");

    if (!["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be APPROVE or REJECT"
      });
    }

    // 1️⃣ Fetch the refund to get the associated payment_id
    const { data: refund, error: fetchError } = await supabase
      .from("refunds")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !refund) {
      return res.status(404).json({ success: false, message: "Refund record not found." });
    }

    if (refund.refund_status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Refund is not PENDING." });
    }

    // 2️⃣ Determine the new statuses based on Admin action
    let newRefundStatus = "";
    let newPaymentStatus = "";

    if (action === "APPROVE") {
      newRefundStatus = "COMPLETED"; // ✅ Matches your DB Enum
      newPaymentStatus = "REFUNDED"; 
    } else {
      newRefundStatus = "REJECTED";  // Ensure "REJECTED" is allowed in your DB constraint!
      newPaymentStatus = "SUCCESS";  // Revert the payment status back to successful
    }

    // 3️⃣ Update the Refunds Table
    const { data: updatedRefund, error: refundUpdateError } = await supabase
      .from("refunds")
      .update({
        refund_status: newRefundStatus,
        processed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (refundUpdateError) {
      console.error("❌ REFUND UPDATE ERROR:", refundUpdateError);
      return res.status(400).json({ success: false, message: refundUpdateError.message });
    }

    // 4️⃣ Update the Payments Table
    if (refund.payment_id) {
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({ payment_status: newPaymentStatus })
        .eq("id", refund.payment_id);

      if (paymentUpdateError) {
        console.error("❌ PAYMENT UPDATE ERROR:", paymentUpdateError);
        // Note: We don't fail the whole request here, but log it heavily.
        // In a strict financial system, you'd use a Postgres Function for a true transaction.
      }
    }

    res.json({
      success: true,
      message: `Refund successfully marked as ${newRefundStatus}`,
      data: updatedRefund
    });

  } catch (err) {
    console.error("❌ CONTROLLER CRASH:", err);
    next(err);
  }
};