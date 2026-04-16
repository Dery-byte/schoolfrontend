import {
  Component, Input, Output, EventEmitter, OnInit,
  ViewChild, ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaecControllersService } from 'src/app/services/services';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { BlurService } from 'src/app/shared/blur/blur.service';
import { Router } from '@angular/router';
import {
  ExamBoard, WASSCEType, GradeOptions, SubjectDatabase,
  CATEGORIES, COMBINED_SUBJECTS, SUBJECT_DATABASE, GRADE_OPTIONS,
} from './grades-entry.data';

declare var bootstrap: any;

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExamType {
  id: number;
  name: string;
  key: WASSCEType;
}

interface ExistingColleges {
  id: number;
  name: string;
  isRequired: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-user-grades-entry',
  templateUrl: './user-grades-entry.component.html',
  styleUrls: ['./user-grades-entry.component.css']
})
export class UserGradesEntryComponent implements OnInit {

  // ── Inputs from parent ──────────────────────────────────────────────────────
  @Input() recordId: any;
  @Input() subscriptionType: string | undefined;
  @Input() checkLimit: number = 0;
  @Input() fullName: string = '';

  // ── Outputs to parent ───────────────────────────────────────────────────────
  /** Tells parent to refresh its user-checks list (updates checkLimit, etc.) */
  @Output() refreshChecks = new EventEmitter<void>();
  /** Tells parent the user clicked "Back to List" */
  @Output() backToList = new EventEmitter<void>();

  // ── Loading / UI state ─────────────────────────────────────────────────────
  isLoading = false;

  // ── Tab navigation ─────────────────────────────────────────────────────────
  activeTab: string = 'auto';

  // ── WAEC auto-fetch results ────────────────────────────────────────────────
  waecresults: any;
  waecresults2: any;
  errorMessage: any;
  secondResultFetched = false;
  isIndexConfirmed: boolean = false;
  candinateName: any;

  // ── Name comparison modal ──────────────────────────────────────────────────
  showNameComparisonModal: boolean = false;
  showRemoveConfirmModal = false;

  // ── Confirm-index modal (Bootstrap) ────────────────────────────────────────
  showMismatchError = false;
  modalInstance: any;
  confirmInput: string = '';

  // ── Eligibility check state ────────────────────────────────────────────────
  isCheckingEligibility: boolean = false;
  checkingEligibility = false;
  elligibilityResults: any;

  // ── College / field-of-study selection ─────────────────────────────────────
  allColleges: ExistingColleges[] = [];
  showDropdown = false;
  searchTerm = '';

  // ── Subject search dropdown (Premium manual entry) ────────────────────────
  showSubjectDropdownP = false;
  subjectSearchTermP = '';
  subjectPanelRect = { top: '0px', left: '0px', width: '200px' };

  get filteredSubjectsP(): string[] {
    const pool = this.currentSubjects.length > 0
      ? this.currentSubjects
      : this.subjectDatabase.WAEC.WASSCE_SCHOOL;
    const term = this.subjectSearchTermP.trim().toLowerCase();
    if (!term) return pool;
    return pool.filter(s => s.toLowerCase().includes(term));
  }

  toggleSubjectDropdownP(event: Event) {
    event.stopPropagation();
    const btn = (event.currentTarget as HTMLElement);
    const rect = btn.getBoundingClientRect();
    // position: fixed uses viewport coords — no scroll offset needed
    this.subjectPanelRect = {
      top:   `${rect.bottom + 4}px`,
      left:  `${rect.left}px`,
      width: `${rect.width}px`
    };
    this.showSubjectDropdownP = !this.showSubjectDropdownP;
    if (this.showSubjectDropdownP) this.subjectSearchTermP = '';
  }

  selectSubjectP(subject: string) {
    this.entryForm.get('subject')?.setValue(subject);
    this.showSubjectDropdownP = false;
    this.subjectSearchTermP = '';
  }

  // ── Manual-entry state ─────────────────────────────────────────────────────
  entries: any[] = [];

  // ── Exam boards / types / years ────────────────────────────────────────────
  examBoards = ['WAEC', 'CTVET'];
  availableExamTypes: string[] = [];
  examYears: number[] = Array.from(
    { length: (new Date().getFullYear() - 1999) },
    (_, i) => new Date().getFullYear() - i
  );
  examTypes: ExamType[] = [
    { id: 1, name: 'WASSCE School Candidate', key: 'WASSCE_SCHOOL' },
    { id: 2, name: 'WASSCE Private Candidate', key: 'WASSCE_PRIVATE' }
  ];
  groups = this.examTypes;
  grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  gradeOrder = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  showExamType = false;
  showCTVETOptions = false;
  currentGrades: string[] = [];
  currentSubjects: string[] = [];
  availableSubjects: string[] = [];
  objectKeys = Object.keys;
  cTVETOptions = ['NAPTEX', 'TEU'];

  categories:       { [key: string]: string[] } = CATEGORIES;
  combinedSubjects: string[]                    = COMBINED_SUBJECTS;
  subjectDatabase:  SubjectDatabase             = SUBJECT_DATABASE;
  gradeOptions:     GradeOptions                = GRADE_OPTIONS;















  
  // ── Forms ──────────────────────────────────────────────────────────────────
  examForm!: FormGroup;
  entryForm!: FormGroup;
  manualEntryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private waec: WaecControllersService,
    private manualService: ManaulServiceService,
    private blurService: BlurService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initEntryForm();
    this.manualForm();
    this.getColleges();
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  get isLimitReached(): boolean {
    return (this.checkLimit ?? 0) >= 2;
  }

  get enteredName(): string {
    return this.fullName;
  }

  // College computed getters
  get requiredColleges(): ExistingColleges[] {
    return this.allColleges.filter(a => a.isRequired);
  }

  get optionalColleges(): ExistingColleges[] {
    return this.allColleges.filter(a => !a.isRequired && a.selected);
  }

  get availableColleges(): ExistingColleges[] {
    return this.allColleges.filter(a =>
      !a.isRequired &&
      !a.selected &&
      a.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get selectedCount(): number {
    return this.allColleges.filter(a => a.selected || a.isRequired).length;
  }

  get reachedMaxSelection(): boolean {
    return this.selectedCount >= 3;
  }

  get hasMinimumSelection(): boolean {
    return this.allColleges.filter(a => a.selected || a.isRequired).length >= 3;
  }

  // ── Form initialisation ────────────────────────────────────────────────────
  private initForm() {
    this.examForm = this.fb.group({
      examYear: ['', Validators.required],
      examType: ['', Validators.required],
      indexNumber: ['', Validators.required]
    });
  }

  private initEntryForm() {
    this.entryForm = this.fb.group({
      indexNumber: [''],
      examBoard: [''],
      examYear: [''],
      examType: [''],
      subject: [''],
      grade: [''],
      sitting: ['']
    });
  }

  manualForm() {
    this.manualEntryForm = this.fb.group({
      examBoard: ['', Validators.required],
      examYear: ['', Validators.required],
      examType: ['', Validators.required],
      cTVETExamType: [''],
      indexNumber: ['', Validators.required],
      fullName: ['Prospective Applicant'],
      resultDetails: this.fb.array([])
    });
  }

  // ── Manual-entry form array helpers ───────────────────────────────────────
  get resultsDetails(): FormArray {
    return this.manualEntryForm.get('resultDetails') as FormArray;
  }

  addSubjects() {
    this.resultsDetails.push(this.fb.group({
      subject: ['', Validators.required],
      grade: ['', Validators.required]
    }));
  }

  removeSubjects(index: number) {
    this.resultsDetails.removeAt(index);
  }

  // ── Board / exam-type change handlers ─────────────────────────────────────
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

  onExamBoardChange(event: Event) {
    const examBoard = (event.target as HTMLSelectElement).value as ExamBoard;
    this.showExamType = examBoard === 'WAEC';
    this.showCTVETOptions = examBoard === 'CTVET';
    this.manualEntryForm.get('examType')?.reset();
    this.manualEntryForm.get('cTVETExamType')?.reset();
    this.currentGrades = [];
    this.currentSubjects = [];
    while (this.resultsDetails.length !== 0) {
      this.resultsDetails.removeAt(0);
    }
  }

  onCTVETExamTypeChange(event: Event) {
    const cTVETExamType = (event.target as HTMLSelectElement).value;
    if (cTVETExamType === 'NAPTEX') {
      this.currentSubjects = this.subjectDatabase.CTVET.NAPTEX;
      this.currentGrades = this.gradeOptions.NAPTEX;
    } else if (cTVETExamType === 'TEU') {
      this.currentSubjects = this.subjectDatabase.CTVET.TEU;
      this.currentGrades = this.gradeOptions.TEU;
    }
    while (this.resultsDetails.length !== 0) {
      this.resultsDetails.removeAt(0);
    }
    this.addSubjects();
  }

  onExamTypeChange(event: Event) {
    const examType = (event.target as HTMLSelectElement).value as WASSCEType;
    const examBoard = this.manualEntryForm.get('examBoard')?.value as ExamBoard;
    if (examBoard === 'WAEC' && examType) {
      this.currentSubjects = this.subjectDatabase.WAEC[examType];
      this.currentGrades = this.gradeOptions[examType];
    }
    while (this.resultsDetails.length !== 0) {
      this.resultsDetails.removeAt(0);
    }
    this.addSubjects();
  }

  logCurrentState(): void {
    console.log('Current Board:', this.entryForm.value.examBoard);
    console.log('Current Exam Type:', this.entryForm.value.examType);
    console.log('Available Exam Types:', this.availableExamTypes);
    console.log('Current Subjects:', this.currentSubjects);
    console.log('Current Grades:', this.currentGrades);
  }

  // ── Manual entry add/remove ────────────────────────────────────────────────
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
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
  }

  submitFormManu() {
    if (this.manualEntryForm.valid) {
      console.log('Form submitted:', this.manualEntryForm.value);
    } else {
      this.manualEntryForm.markAllAsTouched();
    }
  }

  // ── WAEC auto-fetch ────────────────────────────────────────────────────────
  async submitFormCheck() {
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
          inputValidator: (value) => {
            if (!value) return 'Please enter your index number';
            return null;
          }
        });

        if (firstResult.isConfirmed) {
          const reenteredIndex = firstResult.value;
          const originalIndex = this.examForm.value.indexNumber;

          if (reenteredIndex === originalIndex) {
            const secondResult = await Swal.fire({
              title: 'CONFIRM INDEX NUMBER',
              html: `<h3 style="margin: 0; font-weight: bold;">${originalIndex}</h3>`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Yes, submit',
              cancelButtonText: 'No, cancel',
              reverseButtons: true,
            });

            if (secondResult.isConfirmed) {
              this.isIndexConfirmed = true;
              this.fetchResultAutoAssign();
            }
          } else {
            await Swal.fire({
              title: 'Error',
              text: 'Index number does not match. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      } catch (error) {
        console.error('Error in form submission:', error);
      }
    } else {
      this.examForm.markAllAsTouched();
    }
  }

  fetchResultAutoAssign() {
    this.isLoading = true;

    const payload = {
      cindex: this.examForm.value.indexNumber,
      examyear: this.examForm.value.examYear,
      examtype: this.examForm.value.examType,
    };

    console.log('Fetching WAEC result, recordId:', this.recordId);
    this.waec.verifyWaecResult({ body: payload, recordId: this.recordId }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!this.waecresults) {
          this.waecresults = res;
          this.candinateName = (this.waecresults as any).cname;
          this.openNameComparisonModal();
          console.log('Results 1', this.waecresults);
          // Tell parent to refresh so checkLimit is updated from server
          this.refreshChecks.emit();
        } else if (!this.waecresults2) {
          this.waecresults2 = res;
          this.secondResultFetched = true;
          console.log('Results 2', this.waecresults2);
          this.refreshChecks.emit();
        } else {
          this.errorMessage = 'You can only compare two results.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('WAEC fetch error:', err);
        this.snackBar.open('Failed to fetch WAEC results. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }










  // ── Eligibility check methods ──────────────────────────────────────────────
  analyzeOneResults() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);

    if (!this.waecresults || !this.waecresults.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;
    this.checkingEligibility = true;

    const analysisData = {
      resultDetails: this.waecresults.resultDetails.map((result: any) => ({
        subject: result.subject,
        grade: result.grade,
      })),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibility(analysisData).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.checkingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        this.checkingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  analyzeTwoResults() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    const r1 = this.waecresults;
    const r2 = this.waecresults2;

    if (!r1 || !r1.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;
    let finalResultMap: Record<string, { subject: string, grade: string }> = {};

    for (const res of r1.resultDetails) {
      const norm = this.normalizeSubject(res.subject);
      finalResultMap[norm] = { subject: norm, grade: res.grade };
    }

    if (r2 && r2.resultDetails) {
      for (const res of r2.resultDetails) {
        const norm = this.normalizeSubject(res.subject);
        const existing = finalResultMap[norm];
        if (existing) {
          finalResultMap[norm] = { subject: norm, grade: this.getBetterGrade(existing.grade, res.grade) };
        } else {
          finalResultMap[norm] = { subject: norm, grade: res.grade };
        }
      }
    }

    const analysisData = {
      resultDetails: Object.values(finalResultMap),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibility(analysisData).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }



  checkEligibilityManualEntry(): void {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    this.isCheckingEligibility = true;

    const response = {
      resultDetails: this.entries.map((entry: any) => ({
        subject: entry.subject,
        grade: entry.grade,
      })),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibility(response).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }




  checkEligibilityManualEntryPrivate(): void {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    this.isCheckingEligibility = true;

    const response = {
      resultDetails: this.entries.map((entry: any) => ({
        subject: entry.subject,
        grade: entry.grade,
      })),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibilityPrivate(response).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  analyzeOneResultsPrivate() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);

    if (!this.waecresults || !this.waecresults.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;
    this.checkingEligibility = true;

    const analysisData = {
      resultDetails: this.waecresults.resultDetails.map((result: any) => ({
        subject: result.subject,
        grade: result.grade,
      })),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibilityPrivate(analysisData).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.checkingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        this.checkingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  analyzeTwoResultsPrivate() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    const r1 = this.waecresults;
    const r2 = this.waecresults2;

    if (!r1 || !r1.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;
    let finalResultMap: Record<string, { subject: string, grade: string }> = {};

    for (const res of r1.resultDetails) {
      const norm = this.normalizeSubject(res.subject);
      finalResultMap[norm] = { subject: norm, grade: res.grade };
    }

    if (r2 && r2.resultDetails) {
      for (const res of r2.resultDetails) {
        const norm = this.normalizeSubject(res.subject);
        const existing = finalResultMap[norm];
        if (existing) {
          finalResultMap[norm] = { subject: norm, grade: this.getBetterGrade(existing.grade, res.grade) };
        } else {
          finalResultMap[norm] = { subject: norm, grade: res.grade };
        }
      }
    }

    const analysisData = {
      resultDetails: Object.values(finalResultMap),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    this.manualService.checkEligibilityPrivate(analysisData).subscribe({
      next: (data: any) => {
        this.elligibilityResults = data;
        this.isCheckingEligibility = false;
        this.snackBar.open('Eligibility check successful!', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        setTimeout(() => {
          this.router.navigate(['/user/checkEligilibilty']);
        }, 4000);
      },
      error: (err) => {
        this.isCheckingEligibility = false;
        console.error('Eligibility check failed:', err);
        this.snackBar.open('Failed to check eligibility.', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          panelClass: ['snackbar-error']
        });
      }
    });
  }


















































  // ── Helper / utility methods ───────────────────────────────────────────────
  normalizeSubject(subject: string): string {
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

  getBetterGrade(g1: string, g2: string): string {
    const i1 = this.gradeOrder.indexOf(g1);
    const i2 = this.gradeOrder.indexOf(g2);
    return i1 <= i2 ? g1 : g2;
  }

  getSimplifiedResults(): { subject: string, grade: string }[] {
    if (!this.waecresults || !this.waecresults.resultDetails) return [];
    return this.waecresults.resultDetails.map((result: any) => ({
      subject: result.subject,
      grade: result.grade
    }));
  }

  getAlignedSubjects(): any[] {
    if (!this.waecresults) return [];
    const subjects1 = this.waecresults.resultDetails;
    const subjects2 = this.waecresults2?.resultDetails || [];
    return subjects1.map((sub1: any) => {
      const sub2 = subjects2.find((s: any) => s.subjectcode === sub1.subjectcode) || null;
      return { subjectcode: sub1.subjectcode, subject: sub1.subject, result1: sub1, result2: sub2 };
    });
  }

  getSubjects(cutoffPoints: any): string[] {
    return Object.keys(cutoffPoints);
  }

  getExamType(examtype: number): string {
    const examTypes: Record<number, string> = {
      1: 'WASSCE School Candidate',
      2: 'WASSCE Private Candidate',
      3: 'Nov/Dec',
      4: 'BECE'
    };
    return examTypes[examtype] || 'Unknown';
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.availableSubjects = this.categories[category] || [];
  }

  handleSuccess(res: any) {
    this.isLoading = false;
    this.waecresults = res;
    localStorage.setItem('candidate', JSON.stringify(res));
  }

  handleError(err: any) {
    this.isLoading = false;
    console.error('Error:', err);
  }

  // ── PDF download ───────────────────────────────────────────────────────────
  downloadResultsPDF() {
    if (!this.waecresults) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('WAEC RESULT SLIP', 105, 20, { align: 'center' });

    autoTable(doc, {
      startY: 30,
      head: [['Candidate Name', 'Index Number', 'Date of Birth', 'Exam Year']],
      body: [[
        this.waecresults.cname,
        this.waecresults.cindex,
        this.waecresults.dob,
        this.waecresults.examyear.toString()
      ]],
      theme: 'grid',
      headStyles: { fillColor: [78, 84, 200], textColor: 255 }
    });

    const resultsData = this.waecresults.resultDetails.map(
      (result: { subjectcode: string; subject: string; grade: string; interpretation: string }) =>
        [result.subjectcode, result.subject, result.grade, result.interpretation]
    );

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Subject Code', 'Subject', 'Grade', 'Interpretation']],
      body: resultsData,
      theme: 'grid',
      headStyles: { fillColor: [78, 84, 200], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 2: { cellWidth: 20 }, 3: { cellWidth: 40 } },
    });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by OTC - ' + new Date().toLocaleDateString(), 105,
      doc.internal.pageSize.height - 10, { align: 'center' });

    const filename = `WAEC_Result_${this.waecresults.cname.replace(/ /g, '_')}_${this.waecresults.examyear}.pdf`;
    doc.save(filename);
  }

  // ── Name-comparison modal ──────────────────────────────────────────────────
  normalizeName(name: string): string {
    if (!name) return '';
    let normalized = name.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    return normalized.split(' ').sort().join(' ');
  }

  namesMatch(): boolean {
    return this.normalizeName(this.enteredName) === this.normalizeName(this.candinateName);
  }

  openNameComparisonModal() {
    if (this.enteredName && this.candinateName) {
      this.showNameComparisonModal = true;
    }
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
  }

  closeNameComparisonModal() {
    this.showNameComparisonModal = false;
    this.candinateName = '';
    document.body.style.overflow = 'auto';
    this.blurService.setBlur(false);
  }

  // ── Remove result modal ────────────────────────────────────────────────────
  confirmRemoveResult() {
    this.showRemoveConfirmModal = true;
  }

  cancelRemove() {
    this.showRemoveConfirmModal = false;
  }

  confirmRemove() {
    this.clearWaecResult();
    this.showRemoveConfirmModal = false;
  }

  clearWaecResult() {
    this.waecresults = null;
    this.waecresults2 = null;
    this.secondResultFetched = false;
  }

  // ── Bootstrap confirm-index modal ─────────────────────────────────────────
  openConfirmModal() {
    this.confirmInput = '';
    this.showMismatchError = false;
    const modalElement = document.getElementById('confirmModal');
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  verifyConfirmation() {
    const original = this.examForm.get('indexNumber')?.value;
    if (this.confirmInput === original) {
      this.isIndexConfirmed = true;
      this.showMismatchError = false;
      this.closeModal();
    } else {
      this.showMismatchError = true;
    }
  }

  // ── College (field-of-study) selection ────────────────────────────────────
  getColleges() {
    this.manualService.getAllCategories().subscribe({
      next: (colleges: any) => {
        this.allColleges = colleges;
      },
      error: (err) => {
        console.error('Failed to load colleges:', err);
        this.snackBar.open('Failed to load colleges', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (!this.showDropdown) this.searchTerm = '';
  }

  addAttendee(attendee: ExistingColleges): void {
    if (!this.reachedMaxSelection) {
      attendee.selected = true;
      this.showDropdown = false;
      this.searchTerm = '';
      this.emitSelectedAttendees();
    }
  }

  removeAttendee(event: Event, attendee: ExistingColleges): void {
    event.stopPropagation();
    if (!attendee.isRequired) {
      attendee.selected = false;
      this.emitSelectedAttendees();
    }
  }

  private emitSelectedAttendees(): void {
    // no-op: kept for future use
  }
}
