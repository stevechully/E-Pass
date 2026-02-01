import { supabase } from "../config/supabase.js";

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