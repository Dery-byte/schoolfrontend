import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { BlurService } from 'src/app/shared/blur/blur.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';


export enum GhanaRegion {
  GREATER_ACCRA = 'GREATER_ACCRA',
  ASHANTI = 'ASHANTI',
  BRONG_AHAFO = 'BRONG_AHAFO',
  CENTRAL = 'CENTRAL',
  EASTERN = 'EASTERN',
  NORTHERN = 'NORTHERN',
  UPPER_EAST = 'UPPER_EAST',
  UPPER_WEST = 'UPPER_WEST',
  VOLTA = 'VOLTA',
  WESTERN = 'WESTERN',
}


interface EligibilityCheck {
  id: string;
  userId: string;
  candidateName: string;
  examDetails: any;
  paymentStatus: 'PENDING' | 'PAID';
  checkStatus: 'NOT_CHECKED' | 'IN_PROGRESS' | 'CHECKED';
  createdAt: Date;
  lastUpdated: Date;
  result?: any;
  checkLimit?: number;
  subscriptionType?: string;
}

interface Biodata {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dob: string;
  gender?: string;
  region: string;
}

@Component({
  selector: 'app-user-check-results',
  templateUrl: './user-check-results.component.html',
  styleUrls: ['./user-check-results.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class UserCheckResultsComponent implements OnInit {

  @ViewChild('target') targetElement!: ElementRef;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @ViewChild('paymentConfirmation', { static: false }) paymentConfirmation!: ElementRef<HTMLDivElement>;

  isLoading = false;
  submitSuccess = false;
  proceedButtonClicked = false;
  allRegions: string[] = [];

  biodata: Biodata = {
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dob: '',
    gender: '',
    region: ''
  };

  // Payment and Check Management
  paymentSuccess = false;
  currentCheck: EligibilityCheck | null = null;
  userChecks: any;
  newCheckForm: FormGroup;
  paymentForm!: FormGroup;
  otpForm!: FormGroup;
  isSubmitting = false;
  showPaymentModal = false;
  showNewPassword = false;
  showConfirmPassword = false;
  paymentAmount: number = 0;
  processingPayment = false;
  totalPrice: number = 0;
  externalRef: string = '';
  recordId: any;
  intervalId: any;
  paymentsucceDetails: any;
  isAmountFixed = true;
  selectedPlan: string = '';
  showOtpModal = false;
  otpError = '';
  verifyingOTP = false;
  resendCooldown = 0;
  paymentStatusData: any;
  amount: number = 0;
  showWebHook = false;
  payee = { amount: '', channel: '', payer: '', otpcode: '', subscriptionType: '' };

  showH2Message = false;
  premium = true;
  isBioDataLoading: boolean = false;
  isCreatingRecord = false;
  isLoadingChecks: boolean = false;
  errorMsg: Array<string> = [];
  errorMsgReg: Array<string> = [];
  regionOptions: { apiValue: GhanaRegion, display: string }[] = [];

  getButtonText(check: any): string {
    return check.paymentStatus === 'PAID' ? 'Continue' : 'Pay & Continue';
  }

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private manualService: ManaulServiceService,
    private blurService: BlurService,
    private router: Router) {

    this.newCheckForm = this.fb.group({
      candidateName: ['', Validators.required],
      examType: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      digit0: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadChecks();
    this.getResultsByUser();
    this.getAllRegions();
  }

  ngOnDestroy() {
    this.blurService.setBlur(false);
    document.body.style.overflow = '';
  }

  // ==================== CHECK MANAGEMENT ====================

  resumeCheck(checkId: string) {
    this.recordId = checkId;
    this.currentCheck = this.userChecks.find((c: EligibilityCheck) => c.id === checkId) || null;
    if (this.currentCheck?.paymentStatus === 'PAID') {
      this.paymentSuccess = true;
    }
    this.getBiodataBYRecordId();
  }

  goBackToList() {
    this.currentCheck = null;
    this.resetForm();
    this.recordId = '';
    this.showH2Message = false;
  }

  get fullName(): string {
    if (!this.biodata) return '';
    const firstName = this.biodata.firstName || '';
    const middleName = this.biodata.middleName || '';
    const lastName = this.biodata.lastName || '';
    return [firstName, middleName, lastName].filter(name => name?.trim()).join(' ');
  }

  getBiodataBYRecordId() {
    this.isBioDataLoading = true;
    this.manualService.getBoidataByRecordId(this.recordId).subscribe({
      next: (data: any) => {
        this.biodata = data;
        this.isBioDataLoading = false;
      },
      error: (err) => {
        this.isBioDataLoading = false;
        console.error('Failed to load BioData:', err);
      },
      complete: () => {
        this.isBioDataLoading = false;
      }
    });
  }

  submitBiodata() {
    if (this.biodata.id) {
      this.updateBiodata();
    } else {
      this.createBiodata();
    }
  }

  scrollToTarget() {
    this.showH2Message = true;
    this.proceedButtonClicked = true;
    if (this.hasBiodata()) {
      this.targetElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private createBiodata() {
    const formattedData = {
      ...this.biodata,
      dob: this.formatDate(this.biodata.dob),
      record: { id: this.recordId },
    };
    this.isLoading = true;
    this.submitSuccess = false;

    this.manualService.addBiodata(formattedData).subscribe({
      next: (response) => {
        this.handleSuccessResponse(response, 'Biodata submitted successfully!');
        this.getBiodataBYRecordId();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = [];
        if (err.error?.message) {
          this.errorMsg.push(err.error.message);
        } else if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            if (parsed.message) this.errorMsg.push(parsed.message);
          } catch (e) {
            this.errorMsg.push('An unexpected error occurred.');
          }
        } else {
          this.errorMsg.push('An unexpected error occurred.');
        }
        this.setMessageDisplayTime();
      }
    });
  }

  private updateBiodata() {
    this.isLoading = true;
    this.submitSuccess = false;
    this.manualService.updateBiodata(this.biodata).subscribe({
      next: (response) => {
        this.handleSuccessResponse(response, 'Biodata updated successfully!');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error.validationErrors;
        this.errorMsg.push(err.error.error);
        this.setMessageDisplayTime();
      }
    });
  }

  setMessageDisplayTime(): void {
    setTimeout(() => {
      this.errorMsg = [];
      this.errorMsgReg = [];
      this.submitSuccess = false;
    }, 3000);
  }

  private formatDate(dateString: string): string | null {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : null;
  }

  private handleSuccessResponse(response: any, message: string) {
    this.isLoading = false;
    this.submitSuccess = true;
    console.log('Success:', response);
  }

  hasBiodata(): boolean {
    return this.isValidBiodata() || this.submitSuccess;
  }

  private isValidBiodata(): boolean {
    return !!this.biodata.id && !!this.biodata.firstName && !!this.biodata.lastName && !!this.biodata.email;
  }

  resetForm() {
    this.biodata = {
      id: '', firstName: '', middleName: '', lastName: '',
      email: '', phoneNumber: '', address: '', dob: '', gender: '', region: ''
    };
    this.submitSuccess = false;
  }

  cancelCurrentCheck() {
    this.currentCheck = null;
    this.paymentSuccess = false;
  }

  completeCurrentCheck() {
    if (this.currentCheck) {
      this.currentCheck.checkStatus = 'CHECKED';
      this.currentCheck.lastUpdated = new Date();
      this.currentCheck = null;
      this.paymentSuccess = false;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private loadChecks() {
    const saved = localStorage.getItem('userChecks');
    this.userChecks = saved ? JSON.parse(saved) : [];
  }

  // ==================== API STEPS ====================

  createRecords() {
    this.isCreatingRecord = true;
    this.manualService.startFirstStep().subscribe({
      next: (data: any) => {
        this.currentCheck = data;
        this.userChecks.unshift(data);
        this.recordId = data.id || data._id || data.recordId || data.checkId;
        this.isCreatingRecord = false;
        console.log('Record created with ID:', this.recordId);
      },
      error: (err) => {
        this.isCreatingRecord = false;
        this.recordId = null;
        console.error(err);
      }
    });
  }

  updatePayment(recordsId: number, paymentStatus: any) {
    this.manualService.startSecondStep(recordsId, paymentStatus).subscribe(() => {});
  }

  updateCandidate(recordId: number, payload: any) {
    this.manualService.startThirdStep(recordId, payload).subscribe(() => {
      this.getResultsByUser();
    });
  }

  getResultsByUser() {
    this.isLoadingChecks = true;
    this.manualService.getAllRecordsByUserID().subscribe({
      next: (data) => {
        this.userChecks = data;
        console.log('User checks loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load user checks:', err);
      },
      complete: () => {
        this.isLoadingChecks = false;
      }
    });
  }

  // ==================== PAYMENT MODAL ====================

  closePaymentModal() {
    this.showPaymentModal = false;
    this.isSubmitting = false;
    document.body.style.overflow = '';
    this.blurService.setBlur(false);
  }

  validateAmount(): void {
    const amountControl = this.paymentForm.get('amount');
    if (amountControl?.value) {
      const numValue = parseFloat(amountControl.value);
      amountControl.setValue(!isNaN(numValue) ? numValue.toFixed(2) : '0.00');
    }
  }

  initializeForm(fixedAmount: number = 0.00) {
    this.paymentForm = this.fb.group({
      amount: [fixedAmount.toFixed(2), [Validators.required, Validators.min(0.01)]],
      payer: ['', [Validators.required, Validators.pattern(/^(?:233|0)[2345][0-9]{8}$/)]],
      channel: ['', Validators.required]
    });
    this.isAmountFixed = true;
  }

  openPaymentModal(subscriptionType: string) {
    this.selectedPlan = subscriptionType;
    this.showPaymentModal = true;
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
    const fixedAmount = subscriptionType === 'PREMIUM' ? 1 : 1;
    this.paymentForm.patchValue({ amount: fixedAmount.toFixed(2), subscriptionType: this.selectedPlan });
  }

  submitPayment(): void {
    if (this.paymentForm.valid) {
      this.processingPayment = true;
      const recordId = this.recordId;
      const paymentPayload = { ...this.paymentForm.value, subscriptionType: this.selectedPlan };
      this.manualService.initializePayment(paymentPayload, recordId).subscribe({
        next: (data: any) => {
          this.externalRef = data.externalref;
          if (recordId) this.recordId = recordId;
          this.closePaymentModal();
          this.openOtpModal();
          this.processingPayment = false;
        },
        error: (err) => {
          console.error('Payment failed:', err);
          this.processingPayment = false;
        }
      });
      this.openPaymentModal(this.selectedPlan);
    }
  }

  startPaymentStatusCheck() {
    this.intervalId = setInterval(() => {
      this.manualService.getPaymentStatus(this.externalRef).subscribe((paymentStatus: any) => {
        if (paymentStatus.txStatus === 1) {
          this.paymentsucceDetails = paymentStatus;
          clearInterval(this.intervalId);
          this.loadChecks();
          this.getResultsByUser();
          this.cancelCurrentCheck();
        } else if (paymentStatus.txStatus === -1) {
          clearInterval(this.intervalId);
        }
      });
    }, 3000);
  }

  // ==================== OTP MODAL ====================

  openOtpModal() {
    this.showOtpModal = true;
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

  verifyOTP() {
    if (this.otpForm.invalid) {
      this.otpError = 'Please enter a valid 6-digit code';
      this.shakeOtpInput();
      return;
    }
    this.verifyingOTP = true;
    this.otpError = '';
    const otpValue = Object.values(this.otpForm.value).join('');
    this.payee.amount = this.paymentForm.get('amount')?.value;
    this.payee.channel = this.paymentForm.value.channel;
    this.payee.payer = this.paymentForm.value.payer;
    this.payee.otpcode = otpValue;
    this.payee.subscriptionType = this.selectedPlan;

    this.manualService.verifyOTP(this.payee).subscribe({
      next: (response) => { this.handleOtpSuccess(response); },
      error: (error) => { this.handleOtpError(error); }
    });
  }

  private handleOtpSuccess(response: any) {
    this.showOtpModal = false;
    this.verifyingOTP = false;
    this.showWebHook = true;
    this.startPaymentStatusCheck();
    this.paymentStatusData = { ...response, amount: this.payee.amount };
  }

  private handleOtpError(error: any) {
    this.verifyingOTP = false;
    if (error.status === 400) {
      this.otpError = 'Invalid OTP code. Please try again.';
      this.shakeOtpInput();
    } else if (error.status === 429) {
      this.otpError = 'Too many attempts. Please wait before trying again.';
    } else {
      this.otpError = 'Verification failed. Please try again later.';
    }
    console.error('OTP Verification Error:', error);
  }

  resendOTP() {
    if (this.resendCooldown > 0) return;
    for (let i = 0; i < 6; i++) this.otpForm.get(`digit${i}`)?.setValue('');
    this.resendCooldown = 60;
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(interval);
    }, 1000);
  }

  private shakeOtpInput() {
    const otpContainer = document.querySelector('.otp-container');
    if (otpContainer) {
      otpContainer.classList.add('shake');
      setTimeout(() => otpContainer.classList.remove('shake'), 500);
    }
  }

  handleInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;
    if (!/^\d$/.test(value)) { input.value = ''; return; }
    if (value && index < 5) {
      const inputsArray = this.otpInputs.toArray();
      inputsArray[index + 1].nativeElement.focus();
    }
    this.otpForm.get(`digit${index}`)?.markAsTouched();
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;
    if (key === 'Backspace' && index > 0 && !this.otpForm.get(`digit${index}`)?.value) {
      const inputsArray = this.otpInputs.toArray();
      inputsArray[index - 1].nativeElement.focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text/plain').replace(/\D/g, '');
    if (pasteData && pasteData.length >= 6) {
      for (let i = 0; i < 6; i++) {
        const control = this.otpForm.get(`digit${i}`);
        if (control) control.setValue(pasteData[i]);
      }
      setTimeout(() => {
        const lastInput = document.querySelector('[formControlName="digit5"]') as HTMLInputElement;
        if (lastInput) lastInput.focus();
      }, 10);
    }
  }

  // ==================== WEBHOOK MODAL ====================

  openWebhook() {
    this.showWebHook = true;
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
  }

  closeWebhook() {
    this.showWebHook = false;
    this.cancelCurrentCheck();
    document.body.style.overflow = '';
    this.blurService.setBlur(false);
  }

  proceedToPaymentConfirmation() {
    this.closeWebhook();
    setTimeout(() => {
      this.paymentConfirmation.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  proceed(checkId: string) {
    if (this.currentCheck?.paymentStatus === 'PAID') {
      this.paymentSuccess = true;
    }
  }

  // ==================== REGIONS ====================

  getAllRegions() {
    this.manualService.getAllRegions().subscribe({
      next: (regions: any) => {
        this.allRegions = regions;
        this.prepareRegionOptions();
        console.log(this.allRegions);
      },
      error: (err) => {
        console.error('Failed to load regions:', err);
      }
    });
  }

  private prepareRegionOptions() {
    this.regionOptions = [
      { apiValue: GhanaRegion.GREATER_ACCRA, display: 'Greater Accra' },
      { apiValue: GhanaRegion.ASHANTI, display: 'Ashanti' },
      { apiValue: GhanaRegion.BRONG_AHAFO, display: 'Brong Ahafo' },
      { apiValue: GhanaRegion.CENTRAL, display: 'Central' },
      { apiValue: GhanaRegion.NORTHERN, display: 'Northern' },
      { apiValue: GhanaRegion.UPPER_WEST, display: 'Upper West' },
      { apiValue: GhanaRegion.UPPER_EAST, display: 'Upper East' },
      { apiValue: GhanaRegion.VOLTA, display: 'Volta' },
      { apiValue: GhanaRegion.WESTERN, display: 'Western' },
      { apiValue: GhanaRegion.EASTERN, display: 'Eastern' },
    ];
  }

}
