/**
 * Utility functions for form validation
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const validatePhone = phone => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's between 10-15 digits (international format)
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Validates required field
 * @param {string} value - Value to validate
 * @returns {boolean} - True if not empty
 */
export const validateRequired = value => {
  return value && value.trim().length > 0;
};

/**
 * Validates minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean} - True if meets minimum length
 */
export const validateMinLength = (value, minLength) => {
  return value && value.trim().length >= minLength;
};

/**
 * Formats phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = phone => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};
