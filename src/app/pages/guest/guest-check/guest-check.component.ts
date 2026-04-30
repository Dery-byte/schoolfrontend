import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GuestService } from 'src/app/Utilities/guest.service';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { WaecControllersService } from 'src/app/services/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SUBJECT_DATABASE, GRADE_OPTIONS,
  SubjectDatabase, GradeOptions
} from 'src/app/pages/user/user-grades-entry/grades-entry.data';
import Swal from 'sweetalert2';

type GuestStep = 'payment' | 'otp' | 'pending' | 'biodata' | 'grades' | 'result';
type SectionKey = 'core' | 'alternative' | 'recommendations';

interface PayeeRequest {
  amount: number;
  channel: string;
  payer: string;
  otpcode: string;
  subscriptionType: string;
}

interface ParsedLine {
  status: 'pass' | 'fail' | 'excellent' | 'neutral';
  subject: string;
  requirement?: string;
  yourGrade?: string;
  remarks: string;
  originalLine: string;
}

interface RecommendationSections {
  core: ParsedLine[];
  alternative: ParsedLine[];
  recommendations: string[];
}

const SECTION_MARKERS = {
  CORE_HEADER: '[CORE_SUBJECTS]',
  ALTERNATIVE_HEADER: '[ALTERNATIVE_REQUIREMENTS]',
  RECOMMENDATIONS_HEADER: '[RECOMMENDATIONS]',
  PASS: '[PASS]', FAIL: '[FAIL]', INFO: '[INFO]', EXCELLENT: '[EXCELLENT]'
};

@Component({
  selector: 'app-guest-check',
  templateUrl: './guest-check.component.html',
  styleUrls: ['./guest-check.component.css']
})
export class GuestCheckComponent implements OnInit, OnDestroy {

  currentStep: GuestStep = 'payment';

  sessionId = '';
  externalRef = '';
  recordId = '';
  eligibilityResult: any = null;

  paymentForm!: FormGroup;
  otpDigits: string[] = ['', '', '', '', '', ''];
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;
  biodataForm!: FormGroup;
  examForm!: FormGroup;

  isLoading = false;
  errorMessage = '';
  allRegions: string[] = [];
  categories: any[] = [];
  selectedCategoryIds: number[] = [];
  selectedPlan: 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS' = 'BASIC';
  universityType = 'PUBLIC';
  private statusPollingInterval: any;

  // Session recovery
  showRecoveryInput = false;
  recoverySessionId = '';

  // Grades tab
  activeGradeTab: 'auto' | 'manual' = 'manual';
  examYears: number[] = [];
  isFetchingResults = false;

  // Manual entry — entryForm (mirrors user-grades-entry)
  entryForm!: FormGroup;
  entries: any[] = [];
  examBoards = ['WAEC', 'CTVET'];
  availableExamTypes: string[] = [];
  currentSubjects: string[] = [];
  currentGrades: string[] = [];
  grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  gradeOrder = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  subjectDatabase: SubjectDatabase = SUBJECT_DATABASE;
  gradeOptions: GradeOptions = GRADE_OPTIONS;

  // WAEC auto-fetch
  waecresults: any = null;
  waecresults2: any = null;
  secondResultFetched = false;
  candinateName: any;
  showNameComparisonModal = false;
  showRemoveConfirmModal = false;
  gradeOrder2 = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  // Expandable results
  expandedUniversities = new Set<string>();
  showAll: Record<string, Record<SectionKey, boolean>> = {};

  // Eligibility check state
  isEligibilityChecked = false;

  get isLimitReached(): boolean {
    return this.waecresults !== null && this.waecresults2 !== null;
  }

  payee: PayeeRequest = { amount: 0, channel: '', payer: '', otpcode: '', subscriptionType: '' };

  constructor(
    private fb: FormBuilder,
    private guestService: GuestService,
    private manualService: ManaulServiceService,
    private router: Router,
    private waec: WaecControllersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadRegions();
    this.loadCategories();

    const savedId = this.guestService.getSessionId();
    const savedStep = sessionStorage.getItem('guestCurrentStep') as GuestStep | null;
    if (savedId) {
      this.sessionId = savedId;
      this.externalRef = this.guestService.getExternalRef() || '';
      this.recordId = this.guestService.getRecordId() || '';
      const nonRestorable: GuestStep[] = ['payment', 'otp', 'pending'];
      if (savedStep && !nonRestorable.includes(savedStep)) {
        this.currentStep = savedStep;
      }
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private setStep(step: GuestStep): void {
    this.currentStep = step;
    sessionStorage.setItem('guestCurrentStep', step);
  }

  private buildForms(): void {
    this.paymentForm = this.fb.group({
      payer: ['', [Validators.required, Validators.pattern(/^(?:233|0)[2345][0-9]{8}$/)]],
      channel: ['', Validators.required],
      candidateName: ['', Validators.required]
    });

    this.biodataForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      dob: ['', Validators.required],
      gender: [''],
      region: ['', Validators.required]
    });

    this.examForm = this.fb.group({
      examYear: ['', Validators.required],
      examType: ['', Validators.required],
      indexNumber: ['', Validators.required]
    });

    this.entryForm = this.fb.group({
      indexNumber: [''],
      examBoard: [''],
      examYear: [''],
      examType: [''],
      subject: [''],
      grade: [''],
      sitting: ['']
    });

    const currentYear = new Date().getFullYear();
    this.examYears = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);
  }

  private loadRegions(): void {
    this.manualService.getAllRegions().subscribe({
      next: (regions: any) => { this.allRegions = Array.isArray(regions) ? regions : []; },
      error: () => { this.allRegions = []; }
    });
  }

  private loadCategories(): void {
    this.manualService.getAllCategories().subscribe({
      next: (cats: any) => { this.categories = Array.isArray(cats) ? cats : []; },
      error: () => { this.categories = []; }
    });
  }

  get planAmount(): number {
    if (this.selectedPlan === 'BASIC') return 10;
    if (this.selectedPlan === 'PREMIUM') return 15;
    return 25;
  }

  // ---- Session Recovery --

  recoverSession(): void {
    const trimmed = this.recoverySessionId.trim();
    if (!trimmed) return;

    const storedId = this.guestService.getSessionId();
    const storedStep = sessionStorage.getItem('guestCurrentStep') as GuestStep | null;
    const nonRestorable: GuestStep[] = ['payment', 'otp', 'pending'];

    if (storedId === trimmed && storedStep && !nonRestorable.includes(storedStep)) {
      this.sessionId = storedId;
      this.externalRef = this.guestService.getExternalRef() || '';
      this.recordId = this.guestService.getRecordId() || '';
      this.currentStep = storedStep;
      this.showRecoveryInput = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.guestService.getSessionProgress(trimmed).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.sessionId = data.sessionId;
        this.externalRef = data.externalRef;
        this.recordId = data.recordId;
        this.guestService.saveSessionId(this.sessionId);
        this.guestService.saveGuestMeta(this.externalRef, this.recordId);
        if (data.paymentStatus === 'PAID') {
          if (data.checkStatus === 'CHECKED') {
            this.isEligibilityChecked = true;
          }
          this.setStep(data.checkStatus === 'CHECKED' ? 'result' : 'grades');
          this.showRecoveryInput = false;
        } else {
          this.errorMessage = 'Session found but payment is not yet confirmed. Please complete payment first.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Session ID not found. Please start a new check.';
      }
    });
  }

  copySessionId(): void {
    navigator.clipboard.writeText(this.sessionId).then(() => {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Session ID copied!', showConfirmButton: false, timer: 2000 });
    });
  }

  // ---- Step 1: Payment ----

  submitPayment(): void {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';
    const { payer, channel, candidateName } = this.paymentForm.value;

    this.guestService.initiateGuestPayment({
      payer, channel, amount: this.planAmount,
      subscriptionType: this.selectedPlan, candidateName
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.sessionId) {
          this.sessionId = res.sessionId;
          this.externalRef = res.externalRef;
          this.recordId = res.recordId;
          this.guestService.saveSessionId(this.sessionId);
          this.guestService.saveGuestMeta(this.externalRef, this.recordId);
          this.setStep('otp');
          this.listenForSmsOtp();
        } else {
          this.errorMessage = res?.userMessage || 'Payment initiation failed. Please try again.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Payment initiation failed. Please try again.';
      }
    });
  }

  // ---- Step 2: OTP ----

  trackByIndex(index: number): number { return index; }

  onOtpFocus(event: FocusEvent): void {
    // Select all text on focus so typing always replaces, never appends
    (event.target as HTMLInputElement).select();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.otpDigits[index] = '';
      input.value = '';
      if (index > 0) this.focusBox(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft')  { event.preventDefault(); this.focusBox(index - 1); return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); this.focusBox(index + 1); return; }
    if (event.key === 'Tab') return;

    // Block anything that is not a single digit
    if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }

    // Digit: prevent browser default entirely, set value ourselves, then move
    event.preventDefault();
    this.otpDigits[index] = event.key;
    input.value = event.key;
    if (index < 5) this.focusBox(index + 1);
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    const boxes = this.otpBoxes.toArray();
    digits.split('').forEach((d, i) => {
      this.otpDigits[i] = d;
      if (boxes[i]) boxes[i].nativeElement.value = d;
    });
    this.focusBox(Math.min(digits.length - 1, 5));
  }

  private focusBox(index: number): void {
    const boxes = this.otpBoxes.toArray();
    if (boxes[index]) boxes[index].nativeElement.focus();
  }

  private async listenForSmsOtp(): Promise<void> {
    if (!('OTPCredential' in window)) return;
    try {
      const credential: any = await (navigator.credentials as any).get({ otp: { transport: ['sms'] } });
      if (credential?.code) {
        const digits = credential.code.replace(/\D/g, '').slice(0, 6);
        digits.split('').forEach((d: string, i: number) => { this.otpDigits[i] = d; });
        setTimeout(() => {
          const boxes = this.otpBoxes.toArray();
          boxes.forEach((box, i) => { if (digits[i]) box.nativeElement.value = digits[i]; });
          this.focusBox(Math.min(digits.length - 1, 5));
        }, 0);
      }
    } catch {
      // SMS OTP API unavailable or user dismissed — silent fail, manual entry still works
    }
  }

  submitOtp(): void {
    const otpCode = this.otpDigits.join('');
    if (otpCode.length !== 6) { this.errorMessage = 'Please enter the complete 6-digit OTP.'; return; }

    this.payee.amount = this.planAmount;
    this.payee.channel = this.paymentForm.value.channel;
    this.payee.payer = this.paymentForm.value.payer;
    this.payee.otpcode = otpCode;
    this.payee.subscriptionType = this.selectedPlan;

    this.isLoading = true;
    this.errorMessage = '';

    this.guestService.verifyGuestOtp(this.payee, this.sessionId).subscribe({
      next: () => {
        this.isLoading = false;
        this.setStep('pending');
        this.startPolling();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'OTP verification failed. Please try again.';
      }
    });
  }

  // ---- Step 3: Pending ----

  private startPolling(): void {
    this.statusPollingInterval = setInterval(() => {
      this.guestService.getGuestPaymentStatus(this.externalRef).subscribe({
        next: (status: any) => {
          if (status && status.txStatus === 1) {
            this.stopPolling();
            this.setStep('biodata');
          } else if (status && status.txStatus === -1) {
            this.stopPolling();
            this.errorMessage = 'Payment failed. Please restart the process.';
            this.setStep('payment');
          }
        },
        error: () => {}
      });
    }, 3000);
  }

  private stopPolling(): void {
    if (this.statusPollingInterval) {
      clearInterval(this.statusPollingInterval);
      this.statusPollingInterval = null;
    }
  }

  // ---- Step 4: Biodata ----

  submitBiodata(): void {
    if (this.biodataForm.invalid) { this.biodataForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMessage = '';

    const payload = { ...this.biodataForm.value, record: { id: this.recordId } };

    this.manualService.addBiodata(payload).subscribe({
      next: () => { this.isLoading = false; this.setStep('grades'); },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Failed to save biodata. Please try again.';
      }
    });
  }

  // ---- Step 5: Grades — Board/ExamType change handlers (mirrors user-grades-entry) ----

  onBoardChange(event: any): void {
    const selectedBoard = event.target.value;
    if (selectedBoard === 'WAEC') {
      this.availableExamTypes = ['WASSCE School', 'WASSCE Private'];
    } else if (selectedBoard === 'CTVET') {
      this.availableExamTypes = ['NAPTEX', 'TEU'];
    } else {
      this.availableExamTypes = [];
    }
    this.entryForm.patchValue({ examType: '' });
    this.currentSubjects = [];
    this.currentGrades = [];
  }

  onExamTypeChangeEntryForm(event: any): void {
    const selectedExamType = event.target.value;
    const selectedBoard = this.entryForm.value.examBoard;
    this.currentSubjects = [];
    this.currentGrades = [];
    if (selectedBoard === 'WAEC') {
      if (selectedExamType === 'WASSCE School') {
        this.currentSubjects = this.subjectDatabase.WAEC.WASSCE_SCHOOL;
        this.currentGrades = this.gradeOptions.WASSCE_SCHOOL;
      } else if (selectedExamType === 'WASSCE Private') {
        this.currentSubjects = this.subjectDatabase.WAEC.WASSCE_PRIVATE;
        this.currentGrades = this.gradeOptions.WASSCE_PRIVATE;
      }
    } else if (selectedBoard === 'CTVET') {
      if (selectedExamType === 'NAPTEX') {
        this.currentSubjects = this.subjectDatabase.CTVET.NAPTEX;
        this.currentGrades = this.gradeOptions.NAPTEX;
      } else if (selectedExamType === 'TEU') {
        this.currentSubjects = this.subjectDatabase.CTVET.TEU;
        this.currentGrades = this.gradeOptions.TEU;
      }
    }
    this.entryForm.patchValue({ subject: '', grade: '' });
  }

  addEntry(): void {
    const entry = this.entryForm.value;
    if (entry.indexNumber && entry.indexNumber.toString().trim() !== '' &&
        entry.examBoard && entry.examBoard.toString().trim() !== '' &&
        entry.examYear && entry.examYear.toString().trim() !== '' &&
        entry.subject && entry.subject.toString().trim() !== '' &&
        entry.grade && entry.grade.toString().trim() !== '' &&
        entry.examType && entry.examType.toString().trim() !== '' &&
        entry.sitting && entry.sitting.toString().trim() !== '') {
      this.entries.push({ ...entry });
      this.entryForm.patchValue({ subject: '', grade: '', sitting: '' });
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
  }

  // ---- Step 5: Grades — WAEC Auto-fetch ----

  async submitFormCheck(): Promise<void> {
    if (this.examForm.valid) {
      try {
        const firstResult = await Swal.fire({
          title: 'Re-enter Index Number',
          input: 'text',
          inputLabel: 'Please re-enter your index number for verification',
          inputPlaceholder: 'Enter your index number',
          showCancelButton: true,
          confirmButtonText: 'Verify',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => { if (!value) return 'Please enter your index number'; return null; }
        });
        if (firstResult.isConfirmed) {
          const reenteredIndex = firstResult.value;
          const originalIndex = this.examForm.value.indexNumber;
          if (reenteredIndex === originalIndex) {
            const secondResult = await Swal.fire({
              title: 'CONFIRM INDEX NUMBER',
              html: `<h3 style="margin:0;font-weight:bold;">${originalIndex}</h3>`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, submit',
              cancelButtonText: 'No, cancel',
              reverseButtons: true
            });
            if (secondResult.isConfirmed) { this.fetchResultAutoAssign(); }
          } else {
            await Swal.fire({ title: 'Error', text: 'Index number does not match. Please try again.', icon: 'error' });
          }
        }
      } catch (error) { console.error('Error in form submission:', error); }
    } else {
      this.examForm.markAllAsTouched();
    }
  }

  fetchResultAutoAssign(): void {
    this.isLoading = true;
    const payload = {
      cindex: this.examForm.value.indexNumber,
      examyear: this.examForm.value.examYear,
      examtype: this.examForm.value.examType,
    };
    this.waec.verifyWaecResult({ body: payload, recordId: this.recordId }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (!this.waecresults) {
          this.waecresults = res;
          this.candinateName = res.cname;
          this.openNameComparisonModal();
        } else if (!this.waecresults2) {
          this.waecresults2 = res;
          this.secondResultFetched = true;
        } else {
          this.snackBar.open('You can only compare two results.', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to fetch WAEC results. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  clearWaecResult(): void {
    this.waecresults = null;
    this.waecresults2 = null;
    this.secondResultFetched = false;
    this.candinateName = null;
  }

  confirmRemoveResult(): void { this.showRemoveConfirmModal = true; }
  cancelRemove(): void { this.showRemoveConfirmModal = false; }
  confirmRemove(): void { this.clearWaecResult(); this.showRemoveConfirmModal = false; }

  get enteredName(): string {
    const f = this.biodataForm.value;
    return `${f.firstName || ''} ${f.lastName || ''}`.trim();
  }

  normalizeName(name: string): string {
    if (!name) return '';
    return name.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
      .split(' ').sort().join(' ');
  }

  namesMatch(): boolean {
    return this.normalizeName(this.enteredName) === this.normalizeName(this.candinateName);
  }

  openNameComparisonModal(): void {
    if (this.enteredName && this.candinateName) {
      this.showNameComparisonModal = true;
    }
  }

  closeNameComparisonModal(): void {
    this.showNameComparisonModal = false;
  }

  private getBetterGrade(g1: string, g2: string): string {
    const i1 = this.gradeOrder2.indexOf(g1);
    const i2 = this.gradeOrder2.indexOf(g2);
    return i1 <= i2 ? g1 : g2;
  }

  private normalizeSubject(subject: string): string {
    const map: Record<string, string> = {
      'ENGLISH LANG': 'ENGLISH LANGUAGE',
      'ENGLISH LANGUAGE': 'ENGLISH LANGUAGE',
      'MATHS': 'MATHEMATICS',
      'MATHEMATICS(CORE)': 'MATHEMATICS',
      'MATHEMATICS ELECTIVE': 'MATHEMATICS (ELECTIVE)',
    };
    const key = subject.trim().toUpperCase();
    return map[key] || key;
  }

  private getMergedResultDetails(): { subject: string; grade: string }[] {
    const r1 = this.waecresults;
    const r2 = this.waecresults2;
    const map: Record<string, { subject: string; grade: string }> = {};
    for (const res of r1.resultDetails) {
      const norm = this.normalizeSubject(res.subject);
      map[norm] = { subject: norm, grade: res.grade };
    }
    if (r2 && r2.resultDetails) {
      for (const res of r2.resultDetails) {
        const norm = this.normalizeSubject(res.subject);
        if (map[norm]) {
          map[norm] = { subject: norm, grade: this.getBetterGrade(map[norm].grade, res.grade) };
        } else {
          map[norm] = { subject: norm, grade: res.grade };
        }
      }
    }
    return Object.values(map);
  }

  get maxCategories(): number {
    if (this.selectedPlan === 'BASIC') return 10;
    if (this.selectedPlan === 'PREMIUM') return 15;
    return 25;
  }

  toggleCategory(categoryId: number): void {
    const idx = this.selectedCategoryIds.indexOf(categoryId);
    if (idx === -1) {
      if (this.selectedCategoryIds.length >= this.maxCategories) {
        this.selectedCategoryIds = [...this.selectedCategoryIds.slice(1), categoryId];
      } else {
        this.selectedCategoryIds.push(categoryId);
      }
    } else {
      this.selectedCategoryIds.splice(idx, 1);
    }
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  submitGrades(): void {
    let resultDetails: { subject: string; grade: string }[];

    if (this.activeGradeTab === 'auto') {
      if (!this.waecresults || !this.waecresults.resultDetails?.length) {
        this.errorMessage = 'Please fetch your WAEC results first.';
        return;
      }
      resultDetails = this.waecresults2
        ? this.getMergedResultDetails()
        : this.waecresults.resultDetails.map((r: any) => ({ subject: r.subject, grade: r.grade }));
    } else {
      if (this.entries.length === 0) {
        this.errorMessage = 'Please add at least one subject entry.';
        return;
      }
      resultDetails = this.entries.map(e => ({ subject: e.subject, grade: e.grade }));
    }

    if (this.selectedCategoryIds.length === 0) {
      this.errorMessage = 'Please select at least one programme category.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.guestService.checkGuestEligibility({
      sessionId: this.sessionId,
      checkRecordId: this.recordId,
      resultDetails,
      categoryIds: this.selectedCategoryIds,
      universityType: this.universityType
    }).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        this.eligibilityResult = result;
        this.isEligibilityChecked = true;
        const unis = this.getUniversities();
        unis.slice(0, 2).forEach((u: any) => this.expandedUniversities.add(u.universityName));
        this.setStep('result');
        this.showSaveModal();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Eligibility check failed. Please try again.';
      }
    });
  }

  // ---- Step 6: Result ----

  toggleUniversity(uniName: string): void {
    this.expandedUniversities.has(uniName)
      ? this.expandedUniversities.delete(uniName)
      : this.expandedUniversities.add(uniName);
  }

  isUniversityExpanded(uniName: string): boolean {
    return this.expandedUniversities.has(uniName);
  }

  getUniversities(): any[] {
    return this.eligibilityResult?.universities || [];
  }

  getEligiblePrograms(uni: any): any[] {
    return (uni.programs || []).filter((p: any) => p.status === 'ELIGIBLE');
  }

  getAlternativePrograms(uni: any): any[] {
    return (uni.programs || []).filter((p: any) => p.status === 'ALTERNATIVE');
  }

  getTopPrograms(programs: any[], count: number = 2): any[] {
    if (!programs?.length) return [];
    return [...programs]
      .sort((a, b) => (b.eligibilityPercentage ?? 0) - (a.eligibilityPercentage ?? 0))
      .slice(0, count);
  }

  hasProgramsInCategory(programs: any[], category: string): boolean {
    if (!programs || !category) return false;
    return programs.some(p => p.categories?.includes(category));
  }

  getProgramsByCategory(programs: any[], category: string): any[] {
    if (!programs || !category) return [];
    return programs.filter(p => p.categories?.includes(category));
  }

  // ---- Recommendation parsing ----

  toggleShowAll(programId: string, section: SectionKey): void {
    if (!this.showAll[programId]) {
      this.showAll[programId] = { core: false, alternative: false, recommendations: false };
    }
    this.showAll[programId][section] = !this.showAll[programId][section];
  }

  isShowingAll(programId: string, section: SectionKey): boolean {
    return this.showAll[programId]?.[section] ?? false;
  }

  getVisibleItems(sections: RecommendationSections, section: 'core' | 'alternative', programId: string, limit = 3): ParsedLine[] {
    const items = sections[section] || [];
    return this.isShowingAll(programId, section) ? items : items.slice(0, limit);
  }

  hasMoreItems(sections: RecommendationSections, section: SectionKey, limit = 3): boolean {
    if (section === 'recommendations') return sections.recommendations.length > limit;
    return sections[section].length > limit;
  }

  getStatusIcon(line: ParsedLine): string {
    switch (line.status) {
      case 'excellent': return '✅';
      case 'pass':      return '✅';
      case 'fail':      return '❌';
      default:          return 'ℹ️';
    }
  }

  getStatusClass(status: string): string { return `status-${status}`; }

  parseRecommendation(text: string): RecommendationSections {
    if (!text) return { core: [], alternative: [], recommendations: [] };
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const sections: RecommendationSections = { core: [], alternative: [], recommendations: [] };
    let currentSection: SectionKey | null = null;

    for (const line of lines) {
      if (this.isCoreSection(line))            { currentSection = 'core';            continue; }
      if (this.isAlternativeSection(line))     { currentSection = 'alternative';     continue; }
      if (this.isRecommendationsSection(line)) { currentSection = 'recommendations'; continue; }
      if (this.isHeaderLine(line))             { continue; }

      if (currentSection === 'core' || currentSection === 'alternative') {
        const parsed = this.parseLine(line);
        if (parsed) sections[currentSection].push(parsed);
      } else if (currentSection === 'recommendations') {
        const clean = this.cleanRecommendationLine(line);
        if (clean) sections.recommendations.push(clean);
      }
    }
    return sections;
  }

  private isCoreSection(line: string): boolean {
    return line.includes(SECTION_MARKERS.CORE_HEADER) ||
           line.includes('CORE SUBJECTS ANALYSIS') ||
           line.includes('CORE SUBJECTS') ||
           /^[📘🎯📚]\s*CORE/i.test(line);
  }

  private isAlternativeSection(line: string): boolean {
    return line.includes(SECTION_MARKERS.ALTERNATIVE_HEADER) ||
           line.includes('ALTERNATIVE REQUIREMENTS') ||
           /^[🔄]\s*ALTERNATIVE REQUIREMENTS/i.test(line);
  }

  private isRecommendationsSection(line: string): boolean {
    return line.includes(SECTION_MARKERS.RECOMMENDATIONS_HEADER) ||
           line.includes('RECOMMENDATIONS:') ||
           /^[💡]\s*RECOMMENDATIONS/i.test(line);
  }

  private isHeaderLine(line: string): boolean {
    if (line.startsWith('[') && line.includes(']') && !line.includes(':')) return true;
    if (/^[⚠️📚🔄💡🎯⭐📋]\s*[A-Z\s]+:?\s*$/.test(line)) return true;
    if (/^[⚠️]\s*(ELIGIBLE|ALTERNATIVE|NOT ELIGIBLE)/i.test(line)) return true;
    return false;
  }

  private cleanRecommendationLine(line: string): string {
    return line.replace(/^\[(?:PASS|FAIL|INFO|EXCELLENT)\]\s*/, '').replace(/^[📋⭐💡]\s*/, '').trim();
  }

  private parseLine(line: string): ParsedLine | null {
    const cleanLine = line
      .replace(/^\[(?:PASS|FAIL|INFO|EXCELLENT)\]\s*/, '')
      .replace(/^[✅❌ℹ️]\s*/, '').trim();
    if (!cleanLine) return null;

    const status = this.getLineStatus(line);

    const gradePattern = /^([^:]+):\s*([A-DF]\d+)\s*\(Required:\s*([A-DF]\d+)\)\s*-\s*(.+)$/;
    const gradeMatch = cleanLine.match(gradePattern);
    if (gradeMatch) {
      return { status, subject: gradeMatch[1].trim(), yourGrade: gradeMatch[2].trim(),
               requirement: gradeMatch[3].trim(), remarks: gradeMatch[4].trim(), originalLine: line };
    }

    const missingPattern = /^([^:]+):\s*Missing\s*\(Required:\s*([A-DF]\d+)\)$/;
    const missingMatch = cleanLine.match(missingPattern);
    if (missingMatch) {
      return { status: 'fail', subject: missingMatch[1].trim(),
               requirement: missingMatch[2].trim(), remarks: 'Missing', originalLine: line };
    }

    const groupPattern = /No matching subjects found in group:\s*\[([^\]]+)\]/;
    const groupMatch = cleanLine.match(groupPattern);
    if (groupMatch) {
      return { status: 'fail', subject: 'Group Requirement',
               remarks: `No match in: ${groupMatch[1].trim()}`, originalLine: line };
    }

    if (cleanLine.includes('Alternative') && cleanLine.includes('requirement met')) {
      return { status: 'pass', subject: 'Alternative Requirement', remarks: cleanLine, originalLine: line };
    }

    return { status, subject: cleanLine, remarks: '', originalLine: line };
  }

  private getLineStatus(line: string): 'pass' | 'fail' | 'excellent' | 'neutral' {
    if (line.includes('[EXCELLENT]') || (line.includes('[PASS]') && line.includes('Excellent!'))) return 'excellent';
    if (line.includes('[PASS]')) return 'pass';
    if (line.includes('[FAIL]')) return 'fail';
    const clean = line.replace(/^\[(?:PASS|FAIL|INFO|EXCELLENT)\]\s*/, '');
    if (clean.includes('Excellent!') || clean.includes('requirement met')) return 'excellent';
    if (clean.includes('Missing') || clean.includes('Does not meet') || clean.includes('No matching subjects found')) return 'fail';
    const match = clean.match(/([A-DF]\d+)\s*\(Required:\s*([A-DF]\d+)\)/);
    if (match) {
      const vals: Record<string, number> = { A1:1,B2:2,B3:3,C4:4,C5:5,C6:6,D7:7,E8:8,F9:9 };
      return (vals[match[2]]||99) - (vals[match[1]]||99) >= 0
        ? (clean.includes('Excellent!') ? 'excellent' : 'pass')
        : 'fail';
    }
    return 'neutral';
  }

  // ---- Modal ----

  private showSaveModal(): void {
    Swal.fire({
      title: 'Save Your Results?',
      html: '<p>Create a free account or log in to save and access your eligibility report anytime.</p>',
      icon: 'info',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Register',
      denyButtonText: 'Log In',
      cancelButtonText: 'Continue without saving',
      confirmButtonColor: '#4f46e5',
      denyButtonColor: '#10b981'
    }).then((result) => {
      if (result.isConfirmed) this.router.navigate(['/'], { queryParams: { sessionId: this.sessionId } });
      else if (result.isDenied) this.router.navigate(['/'], { queryParams: { sessionId: this.sessionId, mode: 'login' } });
    });
  }

  openSaveModal(): void { this.showSaveModal(); }

  isDone(step: GuestStep): boolean {
    const order: GuestStep[] = ['payment', 'otp', 'pending', 'biodata', 'grades', 'result'];
    return order.indexOf(this.currentStep) > order.indexOf(step);
  }
}
