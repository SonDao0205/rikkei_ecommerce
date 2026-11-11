/**
 * Shared validation utilities for Email and Vietnamese Phone Numbers
 */

/**
 * Standard Email Regex
 * Matches name@domain.tld with at least 2 characters TLD
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Vietnamese Phone Number Regex
 * Supports:
 * - 10-digit mobile numbers starting with 03, 05, 07, 08, 09
 * - International prefix +84 or 84 (e.g. +84912345678, 84912345678)
 * - 9-digit mobile numbers when the UI displays an explicit +84 prefix (e.g. 912345678)
 */
export const VIETNAMESE_PHONE_REGEX =
  /^(?:\+84|84|0)?(3[2-9]|5[2-9]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;

/**
 * Strict Vietnamese Phone Number Regex (must include leading 0, 84, or +84)
 */
export const VIETNAMESE_PHONE_STRICT_REGEX =
  /^(?:\+84|84|0)(3[2-9]|5[2-9]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;

/**
 * Normalizes phone string by removing whitespace, parentheses, dots, and hyphens.
 */
export const normalizePhone = (phone: string): string => {
  return phone.trim().replace(/[\s().-]/g, "");
};

/**
 * Validates whether an email string meets standard RFC-like email format.
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates whether a phone number matches Vietnamese phone specifications.
 * @param phone The input phone string
 * @param allowWithoutZero Whether to allow numbers without leading 0 (useful when UI shows +84 prefix)
 */
export const isValidVietnamesePhone = (
  phone: string,
  allowWithoutZero = true
): boolean => {
  const cleaned = normalizePhone(phone);
  if (!cleaned) return false;
  if (allowWithoutZero) {
    return VIETNAMESE_PHONE_REGEX.test(cleaned);
  }
  return VIETNAMESE_PHONE_STRICT_REGEX.test(cleaned);
};

