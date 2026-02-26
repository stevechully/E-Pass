import { supabase } from "../config/supabase.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        message: "Email, password and full name are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // 1️⃣ Try signing up
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        message: "Email already registered. Please login."
      });
    }

    const userId = data.user.id;

    // 2️⃣ Insert profile (ignore duplicate safely)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name,
          phone: phone || null,
          role: "USER"
        }
      ]);

    // If profile already exists, ignore it
    if (profileError && profileError.code !== "23505") {
      console.error("Profile insertion error:", profileError);
      return res.status(500).json({
        message: "User created but failed to save profile details"
      });
    }

    return res.status(201).json({
      message: "Registration successful"
    });

  } catch (err) {
    next(err);
  }
};