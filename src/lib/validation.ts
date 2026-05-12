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

/**
 * Indian mobile number: exactly 10 digits, must start with 6, 7, 8, or 9
 * (the only valid first digits for Indian mobile carriers under the
 * National Numbering Plan).
 */
export const isValidPhone = (phone: string): boolean =>
  /^[6-9]\d{9}$/.test(phone);

export const isValidPincode = (pincode: string): boolean =>
  /^\d{6}$/.test(pincode);

export const isValidAadhar = (aadhar: string): boolean =>
  /^\d{12}$/.test(aadhar);

/** Indian PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F). */
export const isValidPan = (pan: string): boolean =>
  /^[A-Z]{5}\d{4}[A-Z]$/.test(pan);

/**
 * Strong password: at least 8 characters AND must contain
 *   - at least one lowercase letter
 *   - at least one uppercase letter
 *   - at least one digit
 *   - at least one special character (non-alphanumeric)
 */
export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

/** Human-readable description of strong-password rules. */
export const PASSWORD_RULES = '8+ chars with uppercase, lowercase, number, and a special character';

/**
 * Returns null if the text looks like meaningful content (>= minLen chars,
 * contains at least one letter, isn't keyboard mash). Otherwise an error
 * message. Use for free-form fields like PG Name / Address.
 */
export function describeTextField(value: string, opts: { minLen?: number; label?: string } = {}): string | null {
  const { minLen = 3, label = 'Field' } = opts;
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${label} is required`;
  if (trimmed.length < minLen) return `${label} must be at least ${minLen} characters`;
  if (!/[A-Za-z]/.test(trimmed)) return `${label} must contain letters`;
  // Reject obvious keyboard mash like "asdfgh", "qwerty", "zxcvbn"
  if (/^(?:asdf|qwer|zxcv|hjkl|yuio|gh|asdfgh|asdfghjkl|qwerty|qwertyuiop|zxcvbn|zxcvbnm)+$/i.test(trimmed)) {
    return `${label} doesn't look valid`;
  }
  return null;
}
