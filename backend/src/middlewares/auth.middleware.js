import { supabase } from '../config/supabase.js';

/**
 * Middleware to verify Supabase JWT token
 * Extracts user from token and attaches to req.user
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid Authorization header'
      });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email
    };

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware to restrict access to Admin users only
 * MUST be used after requireAuth
 */
export const requireAdmin = (req, res, next) => {
  // You can update this list with actual admin emails
  const ADMIN_EMAILS = ["admin@test.com", "steve@hellfire.com"]; 

  if (!req.user || !ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Admin privileges required"
    });
  }

  next();
};

// Alias for backward compatibility
export const authenticate = requireAuth;