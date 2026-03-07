import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

/**
 * POST /api/epass/create-booking
 * Step 1: Create pending booking (NO QR CODE YET)
 */
export const createEpassBooking = async (req, res, next) => {
  try {
    const { slot_id } = req.body;
    const userId = req.user.id;

    if (!slot_id) {
      return res.status(400).json({
        success: false,
        message: 'slot_id is required'
      });
    }

    // Fetch slot to get visit_date
    const { data: slot, error: slotError } = await supabase
      .from('entry_slots')
      .select('id, slot_date')
      .eq('id', slot_id)
      .eq('is_active', true)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({
        success: false,
        message: 'Entry slot not found or inactive'
      });
    }

    const ECO_FEE = 20;

    // Insert booking as PENDING without generating the QR yet
    const { data: booking, error } = await supabase
      .from('epass_bookings')
      .insert({
        user_id: userId,
        slot_id,
        visit_date: slot.slot_date,
        status: 'PENDING', // Wait for payment to mark as BOOKED
        payment_status: 'PENDING',
        eco_fee: ECO_FEE,
        total_amount: ECO_FEE
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/epass/confirm-payment
 * Step 2: Confirm payment and Generate QR
 */
export const confirmEpassPayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const userId = req.user.id;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    // Generate QR code ONLY after payment is confirmed
    const qrCode = `EPASS-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Update status to PAID and assign the QR code
    const { data: booking, error } = await supabase
      .from('epass_bookings')
      .update({ 
        payment_status: 'PAID',
        status: 'BOOKED',
        qr_code: qrCode 
      })
      .eq('id', booking_id)
      .eq('user_id', userId) // Security check: Ensure user owns this pass
      .select()
      .single();

    if (error || !booking) {
      return res.status(400).json({
        success: false,
        message: 'Failed to confirm payment or booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/epass/my
 */
export const getMyEpassBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('epass_bookings')
      .select(`
        id,
        visit_date,
        status,
        qr_code,
        payment_status,
        entry_slots (
          start_time,
          end_time
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      bookings: data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/epass/cancel/:id
 */
export const cancelEpassBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('epass_bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .eq('status', 'BOOKED')
      .select()
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: 'Unable to cancel booking'
      });
    }

    res.json({
      success: true,
      message: 'E-pass booking cancelled'
    });
  } catch (err) {
    next(err);
  }
};