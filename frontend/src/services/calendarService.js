import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/**
 * 🔓 PUBLIC: Get the full informational calendar for a year
 * Used by the PoojaCalendar.jsx page.
 */
export const getCalendarByYear = async (year) => {
  const res = await axios.get(`${API}/calendar/${year}`);
  return res.data;
};

/**
 * 🔓 PUBLIC: Get enriched dates with real-time slot availability
 * Used by the SpecialPoojaList.jsx and VazhipaduBooking.jsx logic.
 */
export const getSpecialPoojaDates = async (serviceId, year) => {
  // ✅ Matches the /special-dates/ path defined in the backend routes
  const res = await axios.get(`${API}/calendar/special-dates/${serviceId}/${year}`);
  return res.data;
};