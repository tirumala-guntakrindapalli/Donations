/**
 * Validation Utilities
 * Functions for validating form inputs and data
 */

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid
 */
function validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return true;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate number is positive
 * @param {number} num - Number to validate
 * @returns {boolean} True if positive
 */
function validatePositiveNumber(num) {
    return typeof num === 'number' && num > 0 && !isNaN(num);
}

/**
 * Validate number is in range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if in range
 */
function validateRange(num, min, max) {
    return typeof num === 'number' && num >= min && num <= max && !isNaN(num);
}

/**
 * Validate date is valid
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if valid date
 */
function validateDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
}

/**
 * Validate date is not in future
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if not in future
 */
function validatePastDate(date) {
    if (!validateDate(date)) return false;
    const d = new Date(date);
    const now = new Date();
    return d <= now;
}

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate form field with rules
 * @param {*} value - Value to validate
 * @param {object} rules - Validation rules
 * @returns {object} {valid: boolean, message: string}
 */
function validateField(value, rules = {}) {
    if (rules.required && !validateRequired(value)) {
        return { valid: false, message: 'This field is required' };
    }
    
    if (rules.email && !validateEmail(value)) {
        return { valid: false, message: 'Invalid email format' };
    }
    
    if (rules.positive && !validatePositiveNumber(value)) {
        return { valid: false, message: 'Must be a positive number' };
    }
    
    if (rules.min !== undefined && value < rules.min) {
        return { valid: false, message: `Must be at least ${rules.min}` };
    }
    
    if (rules.max !== undefined && value > rules.max) {
        return { valid: false, message: `Must be at most ${rules.max}` };
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        return { valid: false, message: `Must be at least ${rules.minLength} characters` };
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        return { valid: false, message: `Must be at most ${rules.maxLength} characters` };
    }
    
    return { valid: true, message: '' };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.validateRequired = validateRequired;
    window.validateEmail = validateEmail;
    window.validatePositiveNumber = validatePositiveNumber;
    window.validateRange = validateRange;
    window.validateDate = validateDate;
    window.validatePastDate = validatePastDate;
    window.validatePhone = validatePhone;
    window.validateField = validateField;
}
