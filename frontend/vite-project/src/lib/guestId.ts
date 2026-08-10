/**
 * SentinelForge Guest Mode Session Identifier.
 * Maintains a persistent, browser-scoped anonymous UUID in localStorage.
 * Enables user-specific chat history persistence without requiring user registration.
 */

const GUEST_ID_KEY = 'sentinelforge_guest_id';

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') {
    return 'guest-ssr-fallback';
  }

  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY);

    if (!guestId || !guestId.trim()) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        guestId = crypto.randomUUID();
      } else {
        guestId = `sf-guest-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;
      }
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }

    return guestId;
  } catch {
    return `sf-guest-ephemeral-${Date.now().toString(36)}`;
  }
}
