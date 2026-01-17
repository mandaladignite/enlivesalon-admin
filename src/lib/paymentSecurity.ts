import { BookingError } from './errorHandler';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  appointmentNumber: string;
  totalAmount: number;
  paymentDetails?: {
    razorpayOrderId?: string;
  };
  createdAt: string;
}

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayConfig {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, any>;
  theme: {
    color: string;
  };
  handler: (response: PaymentResponse) => void;
}

class PaymentSecurity {
  private static instance: PaymentSecurity;
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly COOLDOWN_PERIOD = 15 * 60 * 1000; // 15 minutes

  static getInstance(): PaymentSecurity {
    if (!PaymentSecurity.instance) {
      PaymentSecurity.instance = new PaymentSecurity();
    }
    return PaymentSecurity.instance;
  }

  checkRateLimit(userId: string): { allowed: boolean; remainingTime: number } {
    const userAttempts = this.attempts.get(userId);
    
    if (!userAttempts) {
      return { allowed: true, remainingTime: 0 };
    }

    const timeSinceLastAttempt = Date.now() - userAttempts.lastAttempt;
    
    if (timeSinceLastAttempt > this.COOLDOWN_PERIOD) {
      this.attempts.delete(userId);
      return { allowed: true, remainingTime: 0 };
    }

    if (userAttempts.count >= this.MAX_ATTEMPTS) {
      const remainingTime = this.COOLDOWN_PERIOD - timeSinceLastAttempt;
      return { allowed: false, remainingTime };
    }

    return { allowed: true, remainingTime: 0 };
  }

  recordAttempt(userId: string): void {
    const userAttempts = this.attempts.get(userId);
    
    if (userAttempts) {
      userAttempts.count++;
      userAttempts.lastAttempt = Date.now();
    } else {
      this.attempts.set(userId, { count: 1, lastAttempt: Date.now() });
    }
  }

  clearAttempts(userId: string): void {
    this.attempts.delete(userId);
  }

  validateAmount(amount: number, expectedAmount: number): boolean {
    return Math.abs(amount - expectedAmount) < 1; // Allow 1 paise difference
  }

  validatePaymentResponse(response: PaymentResponse, appointment: Appointment): {
    checks: Record<string, boolean>;
  } {
    const checks = {
      amount: this.validateAmount(parseInt(response.razorpay_payment_id), appointment.totalAmount * 100),
      currency: true, // Assuming INR
      status: true,
      timestamp: Date.now() - new Date(appointment.createdAt).getTime() < 30 * 60 * 1000 // 30 minutes
    };

    return {
      checks
    };
  }

  createRazorpayConfig(
    appointment: Appointment,
    user: User | null,
    razorpayKey: string,
    shippingAddress?: string
  ): RazorpayConfig {
    console.log('Creating Razorpay config for appointment:', {
      appointmentId: appointment._id,
      appointmentNumber: appointment.appointmentNumber,
      totalAmount: appointment.totalAmount,
      razorpayOrderId: appointment.paymentDetails?.razorpayOrderId
    });

    return {
      key: razorpayKey,
      amount: Math.round(appointment.totalAmount * 100), // Convert to paise
      currency: 'INR',
      name: 'Enlive Salon',
      description: `Appointment #${appointment.appointmentNumber}`,
      order_id: appointment.paymentDetails?.razorpayOrderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      notes: {
        address: shippingAddress,
        appointmentId: appointment._id,
        userId: user?._id
      },
      theme: {
        color: '#ec4899'
      },
      handler: async (response: PaymentResponse) => {
        try {
          console.log('Payment response received:', {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature.substring(0, 8) + '...'
          });

          // Validate payment response
          const validation = this.validatePaymentResponse(response, appointment);
          
          if (!Object.values(validation.checks).every(check => check)) {
            throw new BookingError('Payment validation failed', 'PAYMENT_VALIDATION_FAILED');
          }

          console.log('Payment successful:', {
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature.substring(0, 8) + '...',
            appointmentId: appointment._id
          });

          // Clear rate limiting attempts on successful payment
          if (user?._id) {
            this.clearAttempts(user._id);
          }
          
          // Redirect to success page
          window.location.href = `/appointments/${appointment._id}?success=true`;
        } catch (error: any) {
          console.error('Payment handler error:', {
            error: error,
            message: error.message,
            appointmentId: appointment._id,
            userId: user?._id
          });
          
          // Don't throw the error to prevent unhandled promise rejection
          // Instead, redirect to a failure page or show error message
          window.location.href = `/appointments/${appointment._id}?error=true&message=${encodeURIComponent(error.message)}`;
        }
      }
    };
  }

  calculateRiskScore(appointment: Appointment, user: User | null, shippingAddress?: string): number {
    let score = 0;
    
    // High value transactions
    if (appointment.totalAmount > 5000) score += 20;
    
    // Unusual shipping address
    if (shippingAddress && (
      shippingAddress.includes('Jammu and Kashmir') ||
      shippingAddress.includes('Ladakh')
    )) {
      score += 15;
    }
    
    // Multiple attempts
    const userAttempts = this.attempts.get(user?._id || '');
    if (userAttempts && userAttempts.count > 1) {
      score += userAttempts.count * 5;
    }
    
    // Time-based risk
    const appointmentAge = Date.now() - new Date(appointment.createdAt).getTime();
    if (appointmentAge > 24 * 60 * 60 * 1000) { // Older than 24 hours
      score += 10;
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  shouldRequireAdditionalVerification(appointment: Appointment, user: User | null, shippingAddress?: string): boolean {
    const riskScore = this.calculateRiskScore(appointment, user, shippingAddress);
    return riskScore > 50;
  }
}

export default PaymentSecurity.getInstance();