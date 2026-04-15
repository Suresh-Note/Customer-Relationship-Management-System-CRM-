/**
 * authStorage.js
 *
 * Tokens are now stored in httpOnly Secure cookies set by the server —
 * JavaScript cannot read them (XSS-safe).
 *
 * This module only stores the non-sensitive user profile (name, email, role)
 * so the UI can rehydrate instantly without an extra network request on every
 * page load.  The profile is NOT a security credential — all actual auth
 * decisions are made server-side.
 */

const PROFILE_KEY = "crm_user_profile";

/** Save the user profile returned by the server after login / refresh. */
export function storeUserProfile(user) {
  if (!user) return;
  try {
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(user));
  } catch { /* quota exceeded or private mode — harmless */ }
}

/** Read back the cached user profile (or null). */
export function getUserProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Remove the profile cache (called on logout). */
export function clearUserProfile() {
  sessionStorage.removeItem(PROFILE_KEY);
}

/**
 * Broadcast a logout event so other open tabs can clear their state.
 * Uses the storage event: writing to localStorage fires the event in all
 * OTHER tabs, then we immediately remove the key.
 */
export function broadcastLogout() {
  try {
    localStorage.setItem("crm_logout_event", String(Date.now()));
    localStorage.removeItem("crm_logout_event");
  } catch { /* private mode */ }
}
