import { supabase } from "../config/supabase.js";

export async function createRefundIfPaid({
  user_id,
  module,
  booking_id
}) {
  // 🔴 Debugging log
  console.log("DEBUG: Refund helper triggered for:", { module, booking_id, user_id });

  // 1️⃣ Find successful payment
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount")
    .eq("user_id", user_id)
    .eq("module", module)
    .eq("booking_id", booking_id)
    .eq("payment_status", "SUCCESS")
    .maybeSingle(); 

  if (!payment) {
    console.log("INFO: No successful payment found. Skipping refund.");
    return;
  }

  // 2️⃣ Prevent duplicate refund
  const { data: existingRefund } = await supabase
    .from("refunds")
    .select("id")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (existingRefund) {
    console.log("INFO: Refund already exists for this payment.");
    return;
  }

  // 3️⃣ Create refund
  const { error: refundError } = await supabase.from("refunds").insert({
    user_id,
    payment_id: payment.id,
    booking_id,
    module,
    amount: payment.amount,
    refund_status: "PENDING"
  });

  if (refundError) {
    console.error("ERROR: Failed to create refund record:", refundError);
  } else {
    console.log("SUCCESS: Refund record created in PENDING status.");

    // 4️⃣ MOCK BANKING PROCESSING (Auto-update to SUCCESS)
    // In a real app, this would be a webhook from Stripe/Razorpay
    setTimeout(async () => {
      console.log(`MOCK: Simulating bank processing for booking ${booking_id}...`);
      await supabase
        .from("refunds")
        .update({ refund_status: "SUCCESS" })
        .eq("booking_id", booking_id);
      console.log(`MOCK: Refund status updated to SUCCESS for ${booking_id}`);
    }, 5000); // 5 seconds delay
  }
}