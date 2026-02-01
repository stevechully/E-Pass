import { supabase } from '../config/supabase.js';

const MODULE_TABLE_MAP = {
  EPASS: 'epass_bookings',
  FOOD: 'food_bookings',
  ACCOMMODATION: 'accommodation_bookings',
  ECO_FEE: 'eco_declarations'
};

const CANCELLABLE_STATUSES = new Set(['BOOKED', 'DECLARED']);

export const cancelBooking = async (req, res, next) => {
  try {
    const { module, booking_id, reason_code } = req.body;
    const userId = req.user.id;

    if (!module || !booking_id || !reason_code) {
      return res.status(400).json({
        success: false,
        message: 'module, booking_id and reason_code are required'
      });
    }

    if (!MODULE_TABLE_MAP[module]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module'
      });
    }

    const table = MODULE_TABLE_MAP[module];

    /* 1️⃣ Validate booking */
    const { data: booking, error: bookingError } = await supabase
      .from(table)
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!CANCELLABLE_STATUSES.has(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled in current state'
      });
    }

    /* 2️⃣ Resolve cancellation reason */
    const normalizedReason = reason_code.toUpperCase();

    const { data: reason } = await supabase
      .from('cancellation_reasons')
      .select('id, initiated_by')
      .ilike('reason_code', normalizedReason)
      .single();

    if (!reason || reason.initiated_by !== 'USER') {
      return res.status(403).json({
        success: false,
        message: 'Invalid or unauthorized cancellation reason'
      });
    }

    /* 3️⃣ Insert cancellation audit */
    await supabase.from('cancellations').insert({
      user_id: userId,
      module,
      booking_id,
      cancellation_reason_id: reason.id
    });

    /* 4️⃣ Update booking status */
    await supabase
      .from(table)
      .update({ status: 'CANCELLED' })
      .eq('id', booking_id);

    /* 5️⃣ RELEASE ENTRY SLOT (EPASS ONLY) - UPDATED LOGIC */
    // CHANGE: Changed booking.entry_slot_id to booking.slot_id
    if (module === 'EPASS' && booking.slot_id) {
      const { error: slotError } = await supabase.rpc('safe_decrement_entry_slot', {
        p_slot_id: booking.slot_id
      });

      if (slotError) {
        console.error('Error releasing slot:', slotError);
        // We don't necessarily throw here to avoid failing the whole cancellation, 
        // but it's logged for maintenance.
      }
    }

    /* 6️⃣ CREATE REFUND (IF PAYMENT EXISTS) */
    const { data: payment } = await supabase
      .from('payments')
      .select('amount')
      .eq('module', module)
      .eq('booking_id', booking_id)
      .eq('payment_status', 'SUCCESS')
      .single();

    if (payment) {
      await supabase.from('refunds').insert({
        booking_id,
        user_id: userId,
        amount: payment.amount,
        refund_status: 'PENDING',
        module
      });
    }

    res.json({
      success: true,
      message: 'Cancellation processed successfully'
    });
  } catch (err) {
    next(err);
  }
};