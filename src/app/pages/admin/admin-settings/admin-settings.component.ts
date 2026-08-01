import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { GlobalDiscountService, GlobalDiscount } from 'src/app/services/global-discount.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit, OnDestroy {

  // ── Existing: threshold / discount mode ──────────────
  threshold: number = 3;
  discountMode: string = 'MANUAL';
  loading: boolean = false;
  saving: boolean = false;

  // ── Global promotion banner ──────────────────────────
  globalDiscount: GlobalDiscount = {
    enabled: false,
    percentage: 0,
    message: '',
    expiryDate: null,
    setAt: '',
    promoCode: '',
    promoPackage: 'ALL',
    promoDiscountedPrice: 0
  };
  savingDiscount  = false;
  discountSaved   = false;
  discountError   = false;
  todayStr = new Date().toISOString().split('T')[0]; // min date for date-picker

  private _sub = new Subscription();

  constructor(
    private http: HttpClient,
    public discountService: GlobalDiscountService
  ) {}

  ngOnInit(): void {
    this.loadThreshold();

    // Refresh from the database and keep the form in sync
    this.discountService.fetchFromServer();
    this._sub.add(
      this.discountService.discount$.subscribe(d => {
        this.globalDiscount = { ...d };
      })
    );
  }

  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }

  // ── Existing methods ─────────────────────────────────

  loadThreshold(): void {
    this.loading = true;
    this.http.get<any>('http://localhost:8088/api/v1/auth/admin/settings/threshold').subscribe({
      next: (res) => {
        this.threshold    = res.threshold;
        this.discountMode = res.discountMode || 'MANUAL';
        this.loading      = false;
      },
      error: (err) => {
        console.error('Error loading threshold', err);
        this.loading = false;
      }
    });
  }

  saveThreshold(): void {
    this.saving = true;
    const payload = { threshold: this.threshold, discountMode: this.discountMode };
    this.http.post<any>('http://localhost:8088/api/v1/auth/admin/settings/threshold', payload).subscribe({
      next: (res) => {
        alert(res.message);
        this.saving = false;
      },
      error: (err) => {
        console.error('Error saving threshold', err);
        alert('Failed to save threshold');
        this.saving = false;
      }
    });
  }

  // ── Global promotion banner methods ──────────────────

  saveGlobalDiscount(): void {
    this.savingDiscount = true;
    this.discountSaved  = false;
    this.discountError  = false;

    this.discountService.save({ ...this.globalDiscount }).subscribe({
      next: () => {
        this.savingDiscount = false;
        this.discountSaved  = true;
        setTimeout(() => this.discountSaved = false, 4000);
      },
      error: (err) => {
        console.error('Failed to save global discount', err);
        this.savingDiscount = false;
        this.discountError  = true;
        setTimeout(() => this.discountError = false, 4000);
      }
    });
  }

  clearGlobalDiscount(): void {
    this.discountService.clear().subscribe({
      next: () => {
        this.discountSaved = true;
        setTimeout(() => this.discountSaved = false, 3000);
      },
      error: (err) => {
        console.error('Failed to clear global discount', err);
      }
    });
  }
}
