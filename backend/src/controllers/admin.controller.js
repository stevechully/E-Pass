import { supabase } from "../config/supabase.js";

/**
 * GET ADMIN DASHBOARD STATS
 * Fetches high-level metrics for the admin analytics page
 */
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;
    const totalUsers = userData.users ? userData.users.length : 0;

    const [epass, pooja, food, stay, payments, pendingRefunds] = await Promise.all([
      supabase.from('epass_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('vazhipadu_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('food_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('accommodation_bookings').select('*', { count: 'exact', head: true }),
      // ✅ Added 'created_at' so we can group payments by date
      supabase.from('payments').select('amount, created_at').in('payment_status', ['SUCCESS', 'PAID', 'CONFIRMED']),
      supabase.from('refund_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
    ]);

    const totalBookings = (epass.count || 0) + (pooja.count || 0) + (food.count || 0) + (stay.count || 0);
    const totalRevenue = payments.data ? payments.data.reduce((sum, p) => sum + Number(p.amount), 0) : 0;

    // ✅ Generate Last 7 Days Chart Data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }).reverse();

    const chartDataMap = {};
    last7Days.forEach(date => chartDataMap[date] = 0);

    if (payments.data) {
      payments.data.forEach(p => {
        if (!p.created_at) return;
        const date = p.created_at.split('T')[0];
        if (chartDataMap[date] !== undefined) {
          chartDataMap[date] += Number(p.amount);
        }
      });
    }

    // Format for Recharts
    const chartData = last7Days.map(date => ({
      name: date.slice(5), // Just show MM-DD
      revenue: chartDataMap[date]
    }));

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        bookings: totalBookings,
        revenue: totalRevenue,
        refunds: pendingRefunds.count || 0,
        chartData: chartData // ✅ Sending the graph data to frontend
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * GET ALL REGISTERED USERS
 * Uses Supabase Admin Auth API
 */
export const getAllUsers = async (req, res, next) => {
  try {
    // Note: This requires the Service Role Key in your supabase config
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    res.json({
      success: true,
      users: data.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at
      }))
    });
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE ENTRY SLOT
 */
export const createEntrySlot = async (req, res, next) => {
  try {
    const { slot_date, start_time, end_time, max_capacity } = req.body;

    const { data, error } = await supabase
      .from("entry_slots")
      .insert({
        slot_date,
        start_time,
        end_time,
        max_capacity,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, slot: data });
  } catch (err) {
    next(err);
  }
};

/**
 * TOGGLE ENTRY SLOT
 */
export const toggleEntrySlot = async (req, res, next) => {
  try {
    const id = req.params.id;

    const { data: slot } = await supabase
      .from("entry_slots")
      .select("is_active")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("entry_slots")
      .update({ is_active: !slot.is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, slot: data });
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE FOOD SLOT
 */
export const createFoodSlot = async (req, res, next) => {
  try {
    const {
      slot_date,
      start_time,
      end_time,
      meal_type,
      max_capacity
    } = req.body;

    const { data, error } = await supabase
      .from("food_slots")
      .insert({
        slot_date,
        start_time,
        end_time,
        meal_type,
        max_capacity,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, slot: data });
  } catch (err) {
    next(err);
  }
};

/**
 * TOGGLE FOOD SLOT
 */
export const toggleFoodSlot = async (req, res, next) => {
  try {
    const id = req.params.id;

    const { data: slot } = await supabase
      .from("food_slots")
      .select("is_active")
      .eq("id", id)
      .single();

    const { data, error } = await supabase
      .from("food_slots")
      .update({ is_active: !slot.is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, slot: data });
  } catch (err) {
    next(err);
  }
};