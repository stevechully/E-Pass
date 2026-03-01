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
      return res.status(400).json({
        message: "Past date booking not allowed"
      });
    }

    // Get Puja
    const { data: puja, error } = await supabase
      .from("vazhipadu_services")
      .select("*")
      .eq("id", puja_id)
      .single();

    if (error || !puja || !puja.is_active) {
      return res.status(404).json({ message: "Invalid Puja" });
    }

    // If SPECIAL puja, check valid date
    if (puja.puja_type === "SPECIAL") {
      const { data: specialDate } = await supabase
        .from("special_puja_dates")
        .select("*")
        .eq("puja_id", puja_id)
        .eq("available_date", booking_date)
        .maybeSingle();

      if (!specialDate) {
        return res.status(400).json({
          message: "Selected date not available for this special puja"
        });
      }
    }

    // Capacity Check
    const { count } = await supabase
      .from("vazhipadu_bookings")
      .select("*", { count: "exact", head: true })
      .eq("puja_id", puja_id)
      .eq("booking_date", booking_date)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (count >= puja.daily_capacity) {
      return res.status(400).json({
        message: "Slot full for selected date"
      });
    }

    return res.status(200).json({
      message: "Available",
      remaining_slots: puja.daily_capacity - count
    });

  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 B) CREATE BOOKING CONTROLLER
// ==========================================
export const createBooking = async (req, res, next) => {
  try {
    // 🛡️ SAFETY GUARD
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Session missing" });
    }

    const {
      puja_id,
      booking_date,
      selected_addons = [],
      eco_fee = 0
    } = req.body;

    const user_id = req.user.id;

    if (!puja_id || !booking_date) {
      return res.status(400).json({ message: "Missing required fields: puja_id or booking_date" });
    }

    // 🔹 1. Validate past date
    const today = new Date().toISOString().split("T")[0];
    if (booking_date < today) {
      return res.status(400).json({ message: "Past date booking not allowed" });
    }

    // 🔹 2. Fetch Puja
    const { data: puja, error: pujaError } = await supabase
      .from("vazhipadu_services")
      .select("*")
      .eq("id", puja_id)
      .single();

    if (pujaError || !puja || !puja.is_active) {
      return res.status(404).json({ message: "Invalid Puja" });
    }

    // 🔹 3. Special Puja date validation
    if (puja.puja_type === "SPECIAL") {
      const { data: specialDate } = await supabase
        .from("special_puja_dates")
        .select("*")
        .eq("puja_id", puja_id)
        .eq("available_date", booking_date)
        .maybeSingle();

      if (!specialDate) {
        return res.status(400).json({ message: "Selected date not available for this special puja" });
      }
    }

    // 🔹 4. Capacity Validation
    const { count } = await supabase
      .from("vazhipadu_bookings")
      .select("*", { count: "exact", head: true })
      .eq("puja_id", puja_id)
      .eq("booking_date", booking_date)
      .in("status", ["PENDING", "CONFIRMED"]);

    if (count >= puja.daily_capacity) {
      return res.status(400).json({ message: "Slot full" });
    }

    // 🔹 5. Calculate Amounts
    let addonAmount = 0;
    if (selected_addons.length > 0) {
      const { data: addons } = await supabase
        .from("vazhipadu_addons")
        .select("*")
        .in("id", selected_addons);
      addonAmount = addons.reduce((sum, item) => sum + Number(item.price), 0);
    }

    const baseAmount = Number(puja.price);
    const totalAmount = baseAmount + addonAmount + Number(eco_fee);

    // 🔹 6. Create Booking (PENDING)
    const { data: booking, error: bookingError } = await supabase
      .from("vazhipadu_bookings")
      .insert([
        {
          user_id,
          puja_id,
          booking_date,
          status: "PENDING",
          base_amount: baseAmount,
          addon_amount: addonAmount,
          eco_fee,
          total_amount: totalAmount
        }
      ])
      .select()
      .single();

    if (bookingError) return res.status(500).json({ message: bookingError.message });

    // 🔹 7. Insert booking addons
    if (selected_addons.length > 0) {
      const addonInsertData = selected_addons.map((addonId) => ({
        booking_id: booking.id,
        addon_id: addonId,
        price: 0
      }));
      await supabase.from("booking_addons").insert(addonInsertData);
    }

    return res.status(201).json({
      message: "Booking created. Please proceed to payment.",
      booking_id: booking.id,
      total_amount: totalAmount
    });

  } catch (err) {
    next(err);
  }
};

// ==========================================
// 🟢 C) GET MY BOOKINGS CONTROLLER
// ==========================================
export const getMyVazhipaduBookings = async (req, res, next) => {
  try {
    // 🛡️ SAFETY GUARD
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user.id;

    // Simplified Query to avoid 500 errors from complex joins
    const { data, error } = await supabase
      .from('vazhipadu_bookings')
      .select(`
        *,
        vazhipadu_services (
          puja_name,
          puja_type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      bookings: data || []
    });

  } catch (err) {
    console.error("Internal Server Error:", err);
    next(err);
  }
};

// ==========================================
// 🟢 D) CANCEL BOOKING & INITIATE REFUND
// ==========================================
export const cancelVazhipaduBooking = async (req, res, next) => {
  try {
    // 🛡️ SAFETY GUARD
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

    await supabase.from('vazhipadu_bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);

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
// 🟢 E) ADMIN: VERIFY QR CODE
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
// 🟢 F) GET SERVICES & ADDONS (Public)
// ==========================================
export const getAllVazhipaduServices = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vazhipadu_services')
      .select(`id, puja_name, description, price, puja_type, daily_capacity, is_active, special_puja_dates ( available_date )`)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

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