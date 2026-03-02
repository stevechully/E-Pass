import { supabase } from "../config/supabase.js";

// ==========================================
// 🟢 A) CHECK AVAILABILITY CONTROLLER
// ==========================================
export const checkAvailability = async (req, res, next) => {
  try {
    const { puja_id, booking_date } = req.body;

    if (!puja_id || !booking_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const today = new Date().toISOString().split("T")[0];
    if (booking_date < today) {
      return res.status(400).json({ message: "Past date booking not allowed" });
    }

    // Fetch the service details
    const { data: puja, error } = await supabase
      .from("vazhipadu_services")
      .select("*")
      .eq("id", puja_id)
      .single();

    if (error || !puja || !puja.is_active) {
      return res.status(404).json({ message: "Invalid Puja" });
    }

    // ✅ Logic Branch: Special vs Regular
    if (puja.puja_type === "SPECIAL") {
      // For Special Poojas, the "Truth" is in the pooja_calendar available_slots column
      const { data: calendarEntry } = await supabase
        .from('pooja_calendar')
        .select('available_slots')
        .eq('service_id', puja_id) 
        .eq('pooja_date', booking_date)
        .eq('is_bookable', true)
        .maybeSingle();

      if (!calendarEntry) {
        return res.status(400).json({ message: 'Selected date not available for this special puja' });
      }

      return res.status(200).json({
        message: calendarEntry.available_slots > 0 ? "Available" : "Slot full",
        remaining_slots: calendarEntry.available_slots
      });

    } else {
      // Regular Puja: Check global daily capacity by counting existing bookings
      const { count } = await supabase
        .from("vazhipadu_bookings")
        .select("*", { count: "exact", head: true })
        .eq("puja_id", puja_id)
        .eq("booking_date", booking_date)
        .in("status", ["PENDING", "CONFIRMED"]);

      const remaining = puja.daily_capacity - (count || 0);
      return res.status(200).json({
        message: remaining > 0 ? "Available" : "Slot full",
        remaining_slots: remaining < 0 ? 0 : remaining
      });
    }
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 B) CREATE BOOKING CONTROLLER
// ==========================================
export const createBooking = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { puja_id, booking_date, selected_addons = [], eco_fee = 0 } = req.body;
    const user_id = req.user.id;

    const { data: puja, error: pujaError } = await supabase
      .from("vazhipadu_services")
      .select("*")
      .eq("id", puja_id)
      .single();

    if (pujaError || !puja || !puja.is_active) {
      return res.status(404).json({ message: "Invalid Puja" });
    }

    let calendarId = null;

    // ✅ Capacity Validation
    if (puja.puja_type === "SPECIAL") {
      // Verify against pooja_calendar table
      const { data: slot, error: slotError } = await supabase
        .from('pooja_calendar')
        .select('id, available_slots')
        .eq('service_id', puja_id)
        .eq('pooja_date', booking_date)
        .eq('is_bookable', true)
        .single();

      if (slotError || !slot || slot.available_slots <= 0) {
        return res.status(400).json({ message: "Slots full for this date" });
      }
      calendarId = slot.id;
    } else {
      // Verify against regular daily capacity
      const { count } = await supabase
        .from("vazhipadu_bookings")
        .select("*", { count: "exact", head: true })
        .eq("puja_id", puja_id)
        .eq("booking_date", booking_date)
        .in("status", ["PENDING", "CONFIRMED"]);

      if ((count || 0) >= puja.daily_capacity) {
        return res.status(400).json({ message: "Daily slot full" });
      }
    }

    // Amount Calculation
    let addonAmount = 0;
    if (selected_addons.length > 0) {
      const { data: addons } = await supabase
        .from("vazhipadu_addons")
        .select("*")
        .in("id", selected_addons);
      addonAmount = (addons || []).reduce((sum, item) => sum + Number(item.price), 0);
    }

    const baseAmount = Number(puja.price);
    const totalAmount = baseAmount + addonAmount + Number(eco_fee);

    // ✅ Atomic Slot Decrement (For Special Poojas)
    if (calendarId) {
      const { error: decError } = await supabase.rpc('decrement_available_slots', { 
        row_id: calendarId 
      });
      
      if (decError) {
        // Fallback: update manually only if RPC is missing
        const { data: current } = await supabase.from('pooja_calendar').select('available_slots').eq('id', calendarId).single();
        if (current.available_slots > 0) {
          await supabase.from('pooja_calendar').update({ available_slots: current.available_slots - 1 }).eq('id', calendarId);
        }
      }
    }

    // Create the Booking Record
    const { data: booking, error: bookingError } = await supabase
      .from("vazhipadu_bookings")
      .insert([{
          user_id,
          puja_id,
          booking_date,
          status: "PENDING",
          base_amount: baseAmount,
          addon_amount: addonAmount,
          eco_fee,
          total_amount: totalAmount
      }])
      .select().single();

    if (bookingError) throw bookingError;

    // Insert booking addons
    if (selected_addons.length > 0) {
      const addonInsertData = selected_addons.map((id) => ({
        booking_id: booking.id,
        addon_id: id,
        price: 0
      }));
      await supabase.from("booking_addons").insert(addonInsertData);
    }

    return res.status(201).json({
      success: true,
      booking_id: booking.id,
      total_amount: totalAmount
    });

  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 C) GET YEARLY CALENDAR
// ==========================================
export const getYearlyCalendar = async (req, res, next) => {
  try {
    const { year } = req.params;

    const { data, error } = await supabase
      .from('pooja_calendar')
      .select(`
        id, pooja_date, is_bookable,
        vazhipadu_services ( id, puja_name, price, puja_type )
      `)
      .eq('year', year)
      .order('pooja_date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, year: parseInt(year), events: data || [] });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 D) GET MY BOOKINGS
// ==========================================
export const getMyVazhipaduBookings = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('vazhipadu_bookings')
      .select(`
        *,
        vazhipadu_services ( puja_name, puja_type )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, bookings: data || [] });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 E) CANCEL & REFUND
// ==========================================
export const cancelVazhipaduBooking = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookingId = req.params.id;
    const userId = req.user.id;

    const { data: booking, error } = await supabase
      .from('vazhipadu_bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (error || !booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'CONFIRMED') return res.status(400).json({ success: false, message: 'Only confirmed bookings can be cancelled' });

    const today = new Date().toISOString().split('T')[0];
    if (booking.booking_date <= today) return res.status(400).json({ success: false, message: 'Cannot cancel on or after booking date' });

    // Update status
    await supabase.from('vazhipadu_bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);

    // ✅ If it was a SPECIAL pooja, we should increment available_slots back in calendar
    const { data: puja } = await supabase.from('vazhipadu_services').select('puja_type').eq('id', booking.puja_id).single();
    if (puja?.puja_type === 'SPECIAL') {
        await supabase.rpc('increment_available_slots', { 
            p_service_id: booking.puja_id, 
            p_date: booking.booking_date 
        });
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('module', 'VAZHIPADU')
      .eq('payment_status', 'SUCCESS')
      .single();

    if (payment) {
      await supabase.from('refunds').insert({
        user_id: userId,
        module: 'VAZHIPADU',
        booking_id: bookingId,
        amount: payment.amount,
        refund_status: 'PENDING',
        payment_id: payment.id
      });
      await supabase.from('payments').update({ payment_status: 'REFUND_REQUESTED' }).eq('id', payment.id);
    }

    res.json({ success: true, message: 'Booking cancelled and refund requested.' });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 F) ADMIN: VERIFY QR
// ==========================================
export const verifyVazhipaduQR = async (req, res, next) => {
  try {
    const { qr_code } = req.body;
    if (!qr_code) return res.status(400).json({ success: false, message: 'QR code required' });

    const { data, error } = await supabase
      .from('vazhipadu_bookings')
      .select(`
        id, booking_date, status,
        vazhipadu_services ( puja_name ),
        profiles ( full_name )
      `)
      .eq('qr_code', qr_code)
      .single();

    if (error || !data) return res.status(404).json({ success: false, message: 'Invalid QR code' });
    if (data.status !== 'CONFIRMED') return res.status(400).json({ success: false, message: 'Booking not valid for entry' });

    res.json({ success: true, booking: data });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 G) PUBLIC: GET SERVICES & ADDONS
// ==========================================
export const getAllVazhipaduServices = async (req, res, next) => {
  try {
    const { type } = req.query; 

    let query = supabase
      .from('vazhipadu_services')
      .select(`id, puja_name, description, price, puja_type, daily_capacity, is_active`)
      .eq('is_active', true);

    if (type) {
      query = query.eq('puja_type', type.toUpperCase());
    }

    const { data, error } = await query.order('puja_name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, services: data });
  } catch (err) {
    next(err);
  }
};

export const getVazhipaduAddons = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vazhipadu_addons')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, addons: data });
  } catch (err) {
    next(err);
  }
};