import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

export const createFoodBooking = async (req, res, next) => {
  try {
    const { food_slot_id, epass_booking_id } = req.body;
    const userId = req.user.id;

    if (!food_slot_id) {
      return res.status(400).json({ success: false, message: 'food_slot_id is required' });
    }

    const { data: slot, error: slotError } = await supabase
      .from('food_slots')
      .select('id, slot_date, meal_type')
      .eq('id', food_slot_id)
      .eq('is_active', true)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({ success: false, message: 'Food slot not found or inactive' });
    }

    // 🚨 Prevent booking past food slots (Backend Security)
    const today = new Date().toISOString().split("T")[0];
    if (slot.slot_date < today) {
      return res.status(400).json({
        success: false,
        message: "This food slot has already expired"
      });
    }

    const isFree = slot.meal_type === 'FREE';
    const status = isFree ? 'BOOKED' : 'PENDING';
    
    // Always provide a QR code string to satisfy the database NOT NULL constraint
    // For pending meals, we use a 'PENDING-' prefix placeholder
    const qrCode = isFree 
      ? `FOOD-${crypto.randomBytes(6).toString('hex').toUpperCase()}` 
      : `PENDING-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const { data: booking, error } = await supabase
      .from('food_bookings')
      .insert({
        user_id: userId,
        food_slot_id,
        epass_booking_id: epass_booking_id || null,
        status: status,
        qr_code: qrCode 
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

export const confirmFoodPayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    // Generate the final valid QR code
    const finalQrCode = `FOOD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const { data: booking, error } = await supabase
      .from('food_bookings')
      .update({ 
        status: 'BOOKED', 
        qr_code: finalQrCode 
      })
      .eq('id', booking_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or update failed' });
    }

    res.json({ success: true, message: 'Payment confirmed and QR generated', booking });
  } catch (err) {
    next(err);
  }
};

// ... keep getMyFoodBookings and cancelFoodBooking as they were
export const getMyFoodBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // 🛡️ FIX: Removed 'visit_date' which was causing the Supabase crash
    const { data, error } = await supabase
      .from('food_bookings')
      .select(`
        id, status, qr_code,
        food_slots (slot_date, start_time, end_time, meal_type)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Query Error in getMyFoodBookings:", error);
      throw error;
    }
    
    res.json({ success: true, bookings: data });
  } catch (err) {
    console.error("Fetch My Food Error:", err);
    next(err);
  }
};

export const cancelFoodBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('food_bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .eq('status', 'BOOKED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Unable to cancel food booking' });
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("booking_id", bookingId)
      .eq("module", "FOOD")
      .eq("payment_status", "SUCCESS")
      .maybeSingle();

    if (payment) {
      await supabase.from("refunds").insert({
        user_id: userId,
        booking_id: bookingId,
        payment_id: payment.id,
        module: "FOOD",
        amount: payment.amount,
        refund_status: "PENDING"
      });
    }

    res.json({
      success: true,
      message: 'Food booking cancelled. Refund initiated if applicable.'
    });
  } catch (err) {
    next(err);
  }
};