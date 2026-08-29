import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface GlobalDiscount {
  enabled: boolean;
  percentage: number;
  message: string;
  expiryDate: string | null; // 'YYYY-MM-DD' or empty string / null
  setAt: string;
  promoCode: string;
  promoPackage: string; // 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS' | 'ALL'
  promoDiscountedPrice: number;
}

// const API = 'http://localhost:8088/api/v1/auth/admin/settings/global-discount';


//ONLINE BACKEND
const API = 'https://schoolbackend-j5n9.onrender.com/api/v1/auth/admin/settings/global-discount';


const EMPTY: GlobalDiscount = {
  enabled: false,
  percentage: 0,
  message: '',
  expiryDate: null,
  setAt: '',
  promoCode: '',
  promoPackage: 'ALL',
  promoDiscountedPrice: 0
};

@Injectable({ providedIn: 'root' })
export class GlobalDiscountService {

  private _discount$ = new BehaviorSubject<GlobalDiscount>({ ...EMPTY });

  /** Every component can subscribe to this to react to changes in real-time */
  readonly discount$ = this._discount$.asObservable();

  /** Synchronous snapshot — use in templates via discountService.snapshot.xxx */
  get snapshot(): GlobalDiscount {
    return this._discount$.value;
  }

  constructor(private http: HttpClient) {
    // Hydrate from the database as soon as the service is first injected
    this.fetchFromServer();
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Load the current global discount from the backend database.
   * Called automatically on construction and can be called manually to refresh.
   */
  fetchFromServer(): void {
    this.http.get<any>(API).pipe(
      catchError(() => of({ ...EMPTY }))
    ).subscribe(raw => {
      this._discount$.next(this._normalise(raw));
    });
  }

  /**
   * Persist a new discount config to the database.
   * Returns the Observable so the caller can track loading/error state.
   */
  save(discount: GlobalDiscount): Observable<any> {
    const payload = {
      enabled:    discount.enabled,
      percentage: discount.percentage,
      message:    discount.message,
      expiryDate: discount.expiryDate ?? '',
      promoCode:  discount.promoCode,
      promoPackage: discount.promoPackage,
      promoDiscountedPrice: discount.promoDiscountedPrice
    };
    return this.http.post<any>(API, payload).pipe(
      tap(() => {
        // Optimistically update the in-memory state so the banner
        // appears immediately without a round-trip re-fetch
        this._discount$.next({
          ...discount,
          setAt: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Remove / disable the global discount in the database.
   */
  clear(): Observable<any> {
    return this.http.delete<any>(API).pipe(
      tap(() => {
        this._discount$.next({ ...EMPTY, setAt: new Date().toISOString() });
      })
    );
  }

  /**
   * Returns true when a discount is enabled, has a non-zero percentage,
   * and (if an expiry date is set) that date has not yet passed.
   */
  isActive(d: GlobalDiscount = this.snapshot): boolean {
    if (!d.enabled || !d.percentage) return false;
    if (d.expiryDate) {
      return new Date(d.expiryDate) > new Date();
    }
    return true;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private _normalise(raw: any): GlobalDiscount {
    return {
      enabled:    raw.enabled === true || raw.enabled === 'true',
      percentage: Number(raw.percentage) || 0,
      message:    raw.message   || '',
      expiryDate: raw.expiryDate || null,
      setAt:      raw.setAt     || '',
      promoCode:  raw.promoCode || '',
      promoPackage: raw.promoPackage || 'ALL',
      promoDiscountedPrice: Number(raw.promoDiscountedPrice) || 0
    };
  }
}
