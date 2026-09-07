import { Injectable } from '@angular/core';

// Paystack Inline JS v2 — loaded via CDN in index.html and exposed on window as PaystackPop
declare const PaystackPop: any;

export interface PaystackPopupConfig {
  /** Your Paystack public key (pk_test_... or pk_live_...) */
  key: string;
  /** Customer email — required by Paystack */
  email: string;
  /** Amount in the smallest currency unit (pesewas for GHS — multiply GHS by 100) */
  amount: number;
  /** Your unique transaction reference (must match the one sent to the backend) */
  ref: string;
  /** ISO 4217 currency code, e.g. "GHS" or "NGN" */
  currency?: string;
  /** Called when the user completes payment successfully */
  onSuccess: (response: { reference: string; trans: string; status: string }) => void;
  /** Called when the user closes the popup without paying */
  onCancel: () => void;
}

/**
 * Wrapper around the Paystack Inline JS v2 SDK loaded via CDN.
 *
 * v2 uses `new PaystackPop()` (not `PaystackPop.setup()`).
 * v2 is REQUIRED for GHS mobile money — v1 only supported card payments.
 */
@Injectable({
  providedIn: 'root'
})
export class PaystackPaymentService {

  /**
   * Opens the Paystack payment popup (v2 API).
   * Requires the Paystack Inline JS v2 CDN script in index.html.
   */
  openPopup(config: PaystackPopupConfig): void {
    if (typeof PaystackPop === 'undefined') {
      console.error('Paystack Inline JS v2 is not loaded. Check that the CDN script is in index.html.');
      return;
    }

    // v2 API: instantiate with `new PaystackPop()` then call newTransaction()
    const popup = new PaystackPop();
    popup.newTransaction({
      key: config.key,
      email: config.email,
      amount: config.amount,
      ref: config.ref,
      currency: config.currency || 'GHS',
      onSuccess: (transaction: any) => {
        config.onSuccess({
          reference: transaction.reference,
          trans: transaction.trans || transaction.id || '',
          status: transaction.status
        });
      },
      onCancel: () => {
        config.onCancel();
      }
    });
  }
}
