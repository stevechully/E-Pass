import { supabase } from '../config/supabase.js';
import crypto from 'crypto';
// Removed helper import

export const getAccommodations = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = supabase
      .from("accommodations")
      .select(`id, name, accommodation_type, capacity, price_per_day, is_active`)
      .eq("is_active", true);

    if (type) query = query.eq("accommodation_type", type);
    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, accommodations: data || [] });
  } catch (err) {
    next(err);
  }
};

export const createAccommodationBooking = async (req, res, next) => {
  try {
    const { accommodation_id, check_in_date, check_out_date } = req.body;
    const userId = req.user.id;

    if (!accommodation_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (new Date(check_out_date) <= new Date(check_in_date)) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    const { data: acc, error: accError } = await supabase
      .from('accommodations')
      .select('id')
      .eq('id', accommodation_id)
      .eq('is_active', true)
      .single();

    if (accError || !acc) {
      return res.status(404).json({ success: false, message: 'Accommodation unavailable' });
    }

    const qrCode = `ACC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const checkInDeadline = new Date(check_in_date);
    checkInDeadline.setHours(18, 0, 0, 0);

    const { data: booking, error } = await supabase
      .from('accommodation_bookings')
      .insert({
        user_id: userId,
        accommodation_id,
        check_in_date,
        check_out_date,
        check_in_deadline: checkInDeadline.toISOString(),
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

export const getMyAccommodationBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('accommodation_bookings')
      .select(`
        id, check_in_date, check_out_date, status, qr_code,
        accommodations (name, accommodation_type, price_per_day)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (err) {
    next(err);
  }
};

export const cancelAccommodationBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // 1. Update status to CANCELLED
    const { data, error } = await supabase
      .from('accommodation_bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .eq('status', 'BOOKED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Unable to cancel booking' });
    }

    // 2. ⭐ DIRECT REFUND LOGIC (Start)
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount")
      .eq("booking_id", bookingId)
      .eq("module", "ACCOMMODATION")
      .eq("payment_status", "SUCCESS")
      .maybeSingle();

    if (payment) {
      await supabase.from("refunds").insert({
        user_id: userId,
        booking_id: bookingId,
        payment_id: payment.id,
        module: "ACCOMMODATION",
        amount: payment.amount,
        refund_status: "PENDING"
      });
    }
    // ⭐ DIRECT REFUND LOGIC (End)

    res.json({
      success: true,
      message: 'Accommodation booking cancelled. Refund initiated if applicable.'
    });
  } catch (err) {
    next(err);
  }
};