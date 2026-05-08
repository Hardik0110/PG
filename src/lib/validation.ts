/**
 * Shared input validators and onChange filters.
 *
 * Two flavors:
 *   - filterX(value)        → strips bad chars + clamps length, for onChange
 *   - isValidX(value)       → boolean predicate, for submit-time validation
 */

/* ─────────────── onChange filters (block typing past constraint) ─────────────── */

export const filterDigits = (value: string, maxLen: number): string =>
  value.replace(/\D/g, '').slice(0, maxLen);

export const filterAlnumUpper = (value: string, maxLen: number): string =>
  value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, maxLen);

export const filterPhone = (value: string): string => filterDigits(value, 10);

export const filterPincode = (value: string): string => filterDigits(value, 6);

export const filterAadhar = (value: string): string => filterDigits(value, 12);

export const filterPan = (value: string): string => filterAlnumUpper(value, 10);

/* ─────────────── submit-time predicates ─────────────── */

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone: string): boolean =>
  /^\d{10}$/.test(phone);

export const isValidPincode = (pincode: string): boolean =>
  /^\d{6}$/.test(pincode);

export const isValidAadhar = (aadhar: string): boolean =>
  /^\d{12}$/.test(aadhar);

/** Indian PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F). */
export const isValidPan = (pan: string): boolean =>
  /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);
