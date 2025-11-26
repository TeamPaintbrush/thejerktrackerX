/**
 * Centralized form validation utilities
 * Provides consistent validation logic across the web application
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class FormValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (US format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  static isValidPassword(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  }

  /**
   * Validate price format (positive number with up to 2 decimals)
   */
  static isValidPrice(price: string | number): boolean {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return false;
    if (numPrice < 0) return false;
    // Check for max 2 decimal places
    const priceStr = numPrice.toString();
    const decimals = priceStr.split('.')[1];
    if (decimals && decimals.length > 2) return false;
    return true;
  }

  /**
   * Validate required field
   */
  static isRequired(value: string | number | boolean | null | undefined): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  /**
   * Validate minimum length
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return value.trim().length >= minLength;
  }

  /**
   * Validate maximum length
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return value.trim().length <= maxLength;
  }

  /**
   * Validate order number format
   */
  static isValidOrderNumber(orderNumber: string): boolean {
    return this.hasMinLength(orderNumber, 3) && this.hasMaxLength(orderNumber, 50);
  }

  /**
   * Validate user creation form
   */
  static validateUserForm(data: {
    name: string;
    email: string;
    password?: string;
    role: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!this.isRequired(data.name)) {
      errors.name = 'Name is required';
    } else if (!this.hasMinLength(data.name, 2)) {
      errors.name = 'Name must be at least 2 characters';
    } else if (!this.hasMaxLength(data.name, 100)) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!this.isRequired(data.email)) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.password) {
      if (!this.isValidPassword(data.password)) {
        errors.password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
      }
    }

    if (!this.isRequired(data.role)) {
      errors.role = 'Role is required';
    } else if (!['admin', 'manager', 'driver', 'customer'].includes(data.role)) {
      errors.role = 'Invalid role selected';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate menu item form
   */
  static validateMenuItemForm(data: {
    name: string;
    description?: string;
    price: string | number;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!this.isRequired(data.name)) {
      errors.name = 'Item name is required';
    } else if (!this.hasMinLength(data.name, 2)) {
      errors.name = 'Item name must be at least 2 characters';
    } else if (!this.hasMaxLength(data.name, 100)) {
      errors.name = 'Item name must be less than 100 characters';
    }

    if (data.description && !this.hasMaxLength(data.description, 500)) {
      errors.description = 'Description must be less than 500 characters';
    }

    if (!this.isRequired(data.price)) {
      errors.price = 'Price is required';
    } else if (!this.isValidPrice(data.price)) {
      errors.price = 'Please enter a valid price (e.g., 9.99)';
    } else if (parseFloat(data.price.toString()) <= 0) {
      errors.price = 'Price must be greater than 0';
    } else if (parseFloat(data.price.toString()) > 10000) {
      errors.price = 'Price cannot exceed $10,000';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate order form
   */
  static validateOrderForm(data: {
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    orderDetails: string;
  }): ValidationResult {
    const errors: Record<string, string> = {};

    if (!this.isRequired(data.orderNumber)) {
      errors.orderNumber = 'Order number is required';
    } else if (!this.isValidOrderNumber(data.orderNumber)) {
      errors.orderNumber = 'Order number must be between 3 and 50 characters';
    }

    if (!this.isRequired(data.customerName)) {
      errors.customerName = 'Customer name is required';
    } else if (!this.hasMinLength(data.customerName, 2)) {
      errors.customerName = 'Customer name must be at least 2 characters';
    } else if (!this.hasMaxLength(data.customerName, 100)) {
      errors.customerName = 'Customer name must be less than 100 characters';
    }

    if (data.customerEmail && !this.isValidEmail(data.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }

    if (!this.isRequired(data.orderDetails)) {
      errors.orderDetails = 'Order details are required';
    } else if (!this.hasMinLength(data.orderDetails, 3)) {
      errors.orderDetails = 'Order details must be at least 3 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
