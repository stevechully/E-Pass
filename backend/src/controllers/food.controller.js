import { supabase } from '../config/supabase.js';
import crypto from 'crypto';
// Removed helper import to keep logic self-contained

export const createFoodBooking = async (req, res, next) => {
  try {
    const { food_slot_id, epass_booking_id } = req.body;
    const userId = req.user.id;

    if (!food_slot_id) {
      return res.status(400).json({ success: false, message: 'food_slot_id is required' });
    }

    const { data: slot, error: slotError } = await supabase
      .from('food_slots')
      .select('id, slot_date')
      .eq('id', food_slot_id)
      .eq('is_active', true)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({ success: false, message: 'Food slot not found or inactive' });
    }

    const qrCode = `FOOD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const { data: booking, error } = await supabase
      .from('food_bookings')
      .insert({
        user_id: userId,
        food_slot_id,
        epass_booking_id: epass_booking_id || null,
        status: 'BOOKED',
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

export const getMyFoodBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('food_bookings')
      .select(`
        id, status, qr_code,
        food_slots (slot_date, start_time, end_time, meal_type)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) {
    next(err);
  }
};

export const cancelFoodBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // 1. Update status to CANCELLED
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

    // 2. ⭐ DIRECT REFUND LOGIC (Start)
    // Find successful payment for this booking
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("booking_id", bookingId)
      .eq("module", "FOOD")
      .eq("payment_status", "SUCCESS")
      .maybeSingle(); // Use maybeSingle to avoid error if no payment (free food)

    // If payment exists, insert refund row
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
    // ⭐ DIRECT REFUND LOGIC (End)

    res.json({
      success: true,
      message: 'Food booking cancelled. Refund initiated if applicable.'
    });
  } catch (err) {
    next(err);
  }
};