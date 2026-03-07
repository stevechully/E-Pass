import { supabase } from '../config/supabase.js';

// 1. User requests a refund
export const requestRefund = async (req, res, next) => {
  try {
    const { booking_id, booking_type, reason, amount } = req.body;
    const userId = req.user.id;

    console.log("👉 Incoming Refund Request:", { booking_id, booking_type, amount, userId });

    // USE maybeSingle() instead of single() to prevent crashes
    const { data: existing, error: checkError } = await supabase
      .from("refund_requests")
      .select("id")
      .eq("booking_id", booking_id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ DB Check Error:", checkError);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: "Refund already requested for this booking." });
    }

    const { data, error } = await supabase
      .from("refund_requests")
      .insert({
        booking_id,
        booking_type,
        amount: Number(amount) || 20, // Ensure it's a valid integer
        reason,
        user_id: userId,
        status: "PENDING"
      })
      .select();

    if (error) {
      console.error("❌ DB Insert Error:", error);
      throw error;
    }

    res.json({ success: true, refund_request: data[0] });
  } catch (err) {
    console.error("🚨 Controller Catch Error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to request refund." });
  }
};

// 2. Admin fetches pending refunds
export const getPendingRefunds = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ success: true, refunds: data || [] });
  } catch (err) {
    next(err);
  }
};

// 3. Admin processes refund
export const processRefund = async (req, res, next) => {
  try {
    const { refund_id, action } = req.body;
    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    const { data, error } = await supabase
      .from("refund_requests")
      .update({ status: newStatus, processed_at: new Date() })
      .eq("id", refund_id)
      .select();

    if (error) throw error;
    res.json({ success: true, refund: data[0] });
  } catch (err) {
    next(err);
  }
};

// 4. Cancel Pooja Booking
export const cancelPoojaBooking = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    
    const { data, error } = await supabase
      .from("vazhipadu_bookings")
      .update({ status: "CANCELLED" })
      .eq("id", booking_id)
      .select(); 

    if (error) throw error;
    res.json({ success: true, booking: data[0] });
  } catch (err) {
    console.error("❌ Cancel Pooja Error:", err);
    res.status(500).json({ success: false, message: "Could not cancel Pooja" });
  }
};

// 5. Cancel E-Pass
export const cancelEpass = async (req, res, next) => {
  try {
    const { pass_id } = req.body;
    
    const { data, error } = await supabase
      .from("epass_bookings")
      .update({ status: "CANCELLED" })
      .eq("id", pass_id)
      .select(); 

    if (error) throw error;
    res.json({ success: true, pass: data[0] });
  } catch (err) {
    console.error("❌ Cancel E-Pass Error:", err);
    res.status(500).json({ success: false, message: "Could not cancel E-Pass" });
  }
};

// 6. Cancel Food Booking
export const cancelFood = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    
    const { data, error } = await supabase
      .from("food_bookings")
      .update({ status: "CANCELLED" })
      .eq("id", booking_id)
      .select(); 

    if (error) throw error;
    res.json({ success: true, booking: data[0] });
  } catch (err) {
    console.error("❌ Cancel Food Error:", err);
    res.status(500).json({ success: false, message: "Could not cancel Food Booking" });
  }
};

// 7. Cancel Accommodation Booking
export const cancelAccommodation = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    
    const { data, error } = await supabase
      .from("accommodation_bookings")
      .update({ status: "CANCELLED" })
      .eq("id", booking_id)
      .select(); 

    if (error) throw error;
    res.json({ success: true, booking: data[0] });
  } catch (err) {
    console.error("❌ Cancel Stay Error:", err);
    res.status(500).json({ success: false, message: "Could not cancel Accommodation" });
  }
};