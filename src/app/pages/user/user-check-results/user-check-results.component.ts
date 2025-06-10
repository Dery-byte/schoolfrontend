import { Component, OnInit,ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UniversityControllerService } from 'src/app/services/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaecControllersService } from 'src/app/services/services';
import { EligibilityControllerService } from 'src/app/services/services';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { ConfirmationModalComponent } from '../../utilities/confirmation-modal/confirmation-modal.component';
declare var bootstrap: any; // Required for Bootstrap JS modal handling
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { BlurService } from 'src/app/shared/blur/blur.service';

// interface EligibilityCheck {
//   id: string;
//   userId: string;
//   candidateName: string | null;
//   paymentStatus: string | null;
//   checkStatus: 'not_started' | 'in_progress' | 'completed' | string;
//   createdAt: string;
//   lastUpdated: string;
//   waecCandidateEntity: any | null;
// }




declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type ExamBoard = 'WAEC' | 'CTVET';
type WASSCEType = 'WASSCE_SCHOOL' | 'WASSCE_PRIVATE';
type GradeOptions = Record<WASSCEType | 'NAPTEX' | 'TEU', string[]>;

interface University {
  id: number;
  name: string;
  type: string;
  location?: string;
}

interface ExamType {
  id: number;
  name: string;
  key: WASSCEType;
}

interface SubjectDatabase {
  WAEC: Record<WASSCEType, string[]>;
  CTVET: {
    NAPTEX: string[];
    TEU: string[];
  };
}


interface EligibilityCheck {
  id: string;
  userId: string;
  candidateName: string;
  examDetails: any;
  paymentStatus: 'pending' | 'paid' | 'failed';
  checkStatus: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
  lastUpdated: Date;
  result?: any;
}

@Component({
  selector: 'app-user-check-results',
  templateUrl: './user-check-results.component.html',
  styleUrls: ['./user-check-results.component.css']
})
export class UserCheckResultsComponent implements OnInit {
@ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;


  paymentForm!: FormGroup;
  isSubmitting = false;
  showPaymentModal = false;

  showNewPassword = false;
  showConfirmPassword = false;


  // Payment and Check Management
  paymentSuccess = false;
  currentCheck: EligibilityCheck | null = null;
  userChecks: any;

  // userChecks: EligibilityCheck[] = [];
  newCheckForm: FormGroup;

  // Existing properties
  examBoards = ['WAEC', 'CTVET'];
  availableExamTypes: string[] = [];
  entryForm: FormGroup;
  entries: any[] = [];
  examYears: number[] = Array.from(
    { length: (new Date().getFullYear() - 1999) },
    (_, i) => new Date().getFullYear() - i
  );
  examForm!: FormGroup;
  manualEntryForm!: FormGroup;
  waecresults: any;
  examTypes: ExamType[] = [
    { id: 1, name: 'WASSCE School Candidate', key: 'WASSCE_SCHOOL' },
    { id: 2, name: 'WASSCE Private Candidate', key: 'WASSCE_PRIVATE' }
  ];
  groups = this.examTypes;
  grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  showExamType = false;
  showCTVETOptions = false;
  currentGrades: string[] = [];
  currentSubjects: string[] = [];

  subjectDatabase: SubjectDatabase = {
    WAEC: {
      WASSCE_SCHOOL: [
        'ENGLISH LANG', 'MATHEMATICS (CORE)', 'INTEGRATED SCIENCE',
        'SOCIAL STUDIES', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'
      ],
      WASSCE_PRIVATE: [
        'ENGLISH LANGUAGE', 'MATHEMATICS (CORE)', 'ELECTIVE MATHEMATICS',
        'BIOLOGY', 'CHEMISTRY', 'PHYSICS'
      ]
    },
    CTVET: {
      NAPTEX: [
        'TECHNICAL DRAWING', 'BUILDING CONSTRUCTION', 'METALWORK', 'WOODWORK'
      ],
      TEU: [
        'ELECTRICAL TECHNOLOGY', 'ELECTRONICS', 'AUTO MECHANICS'
      ]
    }
  };

  gradeOptions: GradeOptions = {
    WASSCE_SCHOOL: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
    WASSCE_PRIVATE: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'],
    NAPTEX: ['PASS', 'FAIL'],
    TEU: ['DISTINCTION', 'CREDIT', 'PASS', 'FAIL']
  };

  cTVETOptions = ['NAPTEX', 'TEU'];
  objectKeys = Object.keys;
  categories: { [key: string]: string[] } = {
    Science: ['ENGLISH LANG', 'INTEGRATED SCIENCE', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'MATHEMATICS(CORE)', 'MATHEMATICS(ELECT)'],
    Arts: ['ENGLISH LANG', 'SOCIAL STUDIES', 'GOVERNMENT', 'MATHEMATICS(CORE)', 'LITERATURE'],
    Business: ['ENGLISH LANG', 'MATHEMATICS(CORE)', 'ACCOUNTING', 'ECONOMICS', 'BUSINESS MANAGEMENT']
  };
  combinedSubjects: string[] = [
    ...this.categories['Science'],
    ...this.categories['Arts'],
    ...this.categories['Business']
  ];
  availableSubjects: string[] = [];

  constructor(
    private fb: FormBuilder,
    private unive: UniversityControllerService,
    private snackBar: MatSnackBar,
    private waec: WaecControllersService,
    private elig: EligibilityControllerService,
    private manualService: ManaulServiceService,
    private blurService: BlurService,
private modalService: NgbModal  ) {
    this.entryForm = this.fb.group({
      indexNumber: [''],
      examBoard: [''],
      examYear: [''],
      examType: [''],
      subject: [''],
      grade: [''],
      sitting: ['']
    });

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
      this.initializeForm(50.00); // Sets fixed amount to GHS 50.00

    this.initForm();
    this.manualForm();
    this.loadChecks();
    this.getResultsByUser();

  }


  simulatePayment() {
    if (this.currentCheck) {
      this.currentCheck.paymentStatus = 'paid';
      this.currentCheck.checkStatus = 'in_progress';
      this.currentCheck.lastUpdated = new Date();
      this.saveChecks();
      this.paymentSuccess = true;
    }
  }

  // resumeCheck(checkId: string) {
  //   this.currentCheck = this.userChecks.find(c => c.id === checkId) || null;
  //   if (this.currentCheck?.paymentStatus === 'paid') {
  //     this.paymentSuccess = true;
  //   }
  // }

  resumeCheck(checkId: string) {
    console.log(checkId);
  this.currentCheck = this.userChecks.find((c: EligibilityCheck) => c.id === checkId) || null;
  if (this.currentCheck?.paymentStatus === 'paid') {
    this.paymentSuccess = true;
  }
}

  cancelCurrentCheck() {
    this.currentCheck = null;
    this.paymentSuccess = false;
  }

  completeCurrentCheck() {
    if (this.currentCheck) {
      this.currentCheck.checkStatus = 'completed';
      this.currentCheck.lastUpdated = new Date();
      this.saveChecks();
      this.currentCheck = null;
      this.paymentSuccess = false;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private saveChecks() {
    localStorage.setItem('userChecks', JSON.stringify(this.userChecks));
  }

  private loadChecks() {
    const saved = localStorage.getItem('userChecks');
    this.userChecks = saved ? JSON.parse(saved) : [];
  }

  // Existing Form Methods
  initForm() {
    this.examForm = this.fb.group({
      examYear: ['', Validators.required],
      examType: ['', Validators.required],
      indexNumber: ['', Validators.required]
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

  onBoardChange(event: any): void {
    const selectedBoard = event.target.value;
    if (selectedBoard === 'WAEC') {
      this.availableExamTypes = ['WASSCE Private', 'WASSCE School'];
    } else if (selectedBoard === 'CTVET') {
      this.availableExamTypes = ['NAPTEX', 'SSCE'];
    } else {
      this.availableExamTypes = [];
    }
    this.entryForm.patchValue({ examType: '' });
  }

  addEntry(): void {
    const entry = this.entryForm.value;
    if (entry.indexNumber && entry.examBoard && entry.examYear && entry.subject && entry.grade && entry.examType && entry.sitting) {
      this.entries.push({ ...entry });
      this.entryForm.patchValue({ subject: '', grade: '', examType: '', sitting: '' });
    }
  }

  removeEntry(index: number): void {
    this.entries.splice(index, 1);
  }

  getFormattedResponse(): void {
    const response = this.entries.map(entry => {
      return {
        subject: entry.subject,
        grade: entry.grade,
      };
    });
    console.log('Formatted Response:', response);
  }

  isLoading: boolean = false;


  // confirmAction() {
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: "You won't be able to revert this!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Yes, proceed!',
  //     cancelButtonText: 'No, cancel',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // User confirmed
  //       console.log('Confirmed!');
  //     } else {
  //       // User cancelled or dismissed
  //       console.log('Cancelled');
  //     }
  //   });
  // }


  // submitFormCheck() {
  //   if (this.examForm.valid) {
  //     this.isLoading = true;

  //     const requestPayload = {
  //       cindex: this.examForm.value.indexNumber,
  //       examyear: this.examForm.value.examYear,
  //       examtype: this.examForm.value.examType
  //     };

  //     console.log(requestPayload);
  //     this.waec.verifyWaecResult({ body: requestPayload }).subscribe({
  //       next: (res) => {
  //         this.waecresults = res;
  //         this.isLoading = false;

  //         localStorage.setItem("candidate", JSON.stringify(this.waecresults));
  //         console.log('Success:', res);
  //         this.examForm.reset();

  //         // Mark check as completed if payment was made
  //         if (this.currentCheck) {
  //           this.currentCheck.result = res;
  //           this.currentCheck.checkStatus = 'completed';
  //           this.saveChecks();
  //         }
  //       },
  //       error: (err) => {
  //         this.isLoading = false;

  //         console.error('Error:', err);
  //       }
  //     });
  //   } else {
  //     this.examForm.markAllAsTouched();
  //   }
  // }
submitFormCheck() {
  if (this.examForm.valid && this.isIndexConfirmed) {
    // Use SweetAlert2 for confirmation dialog
    Swal.fire({
      title: 'CONFIRM INDEX NUMBER',
      html: `<h3 style="margin: 0; font-weight: bold;">${this.examForm.value.indexNumber}</h3>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'No, cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.fetchResults(); // Proceed only if user confirms
      }
      // else do nothing if canceled
    });
  } else {
    this.examForm.markAllAsTouched();
  }
}

// Add this method to your component class
getSimplifiedResults(): {subject: string, grade: string}[] {
  if (!this.waecresults || !this.waecresults.resultDetails) {
    return [];
  }

  return this.waecresults.resultDetails.map((result: any) => ({
    subject: result.subject,
    grade: result.grade
  }));
}



elligibilityResults:any;
isCheckingEligibility: boolean = false;
// In eligibility-results.component.ts
getSubjects(cutoffPoints: any): string[] {
  return Object.keys(cutoffPoints);
}
analyzeResults() {
  if (!this.waecresults || !this.waecresults.resultDetails) {
    console.warn('No results available to analyze');
    return;
  }

    this.isCheckingEligibility = true;

  // Create the properly formatted JSON structure
  const analysisData = {
    resultDetails: this.waecresults.resultDetails.map((result: any) => ({
      subject: result.subject,
      grade: result.grade,
    }))
  };

  // Log to console
  console.log('Analysis Data:', analysisData);
  console.log('Formatted Analysis Data:', JSON.stringify(analysisData, null, 2));
  // Send to eligibility service
  this.manualService.checkEligibility(analysisData).subscribe({
    next: (data: any) => {
      this.elligibilityResults = data;
            this.isCheckingEligibility = false; // Reset loading state

    },
    error: (err) => {
            this.isCheckingEligibility = false; // Additional safety

      console.error('Eligibility check failed:', err);
    }
  });
}
// Separate function for API call (cleaner code)



fetchResults() {
  this.isLoading = true;

  const requestPayload = {
    cindex: this.examForm.value.indexNumber,
    examyear: this.examForm.value.examYear,
    examtype: this.examForm.value.examType
  };

  this.waec.verifyWaecResult({ body: requestPayload }).subscribe({
    next: (res) => {
      this.handleSuccess(res);
    },
    error: (err) => {
      this.handleError(err);
    }
  });
}

handleSuccess(res: any) {
  this.isLoading = false;
  this.waecresults = res;
  localStorage.setItem("candidate", JSON.stringify(res));
  
  if (this.currentCheck) {
    this.currentCheck.result = res;
    this.currentCheck.checkStatus = 'completed';
    this.saveChecks();
  }
}

handleError(err: any) {
  this.isLoading = false;
  console.error('Error:', err);
  // Optionally show an error toast/message
}












  // Manual Entry Methods
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

  onExamBoardChange(event: Event) {
    const examBoard = (event.target as HTMLSelectElement).value as ExamBoard;
    this.showExamType = examBoard === 'WAEC';
    this.showCTVETOptions = examBoard === 'CTVET';
    this.manualEntryForm.get('examType')?.reset();
    this.manualEntryForm.get('cTVETExamType')?.reset();
    this.currentGrades = [];
    this.currentSubjects = [];

    if (examBoard === 'WAEC') {
      // WAEC specific logic
    } else if (examBoard === 'CTVET') {
      // CTVET selected
    }

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

  submitFormManu() {
    if (this.manualEntryForm.valid) {
      console.log('Form submitted:', this.manualEntryForm.value);

      // Mark check as completed if payment was made
      if (this.currentCheck) {
        this.currentCheck.result = this.manualEntryForm.value;
        this.currentCheck.checkStatus = 'completed';
        this.saveChecks();
      }
    } else {
      this.manualEntryForm.markAllAsTouched();
    }
  }
  activeTab: string = 'auto'; // or 'manual', or whatever your tab IDs are

  getExamType(examtype: number): string {
    const examTypes: Record<number, string> = {
      1: "WASSCE School Candidate",
      2: "WASSCE Private Candidate",
      3: "Nov/Dec",
      4: "BECE"
    };
    return examTypes[examtype] || 'Unknown';
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.availableSubjects = this.categories[category] || [];
  }
























  //  DOWNLOAD RESULTS AS PDF


  downloadResultsPDF() {
    if (!this.waecresults) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('WAEC RESULT SLIP', 105, 20, { align: 'center' });

    // Candidate Info Table
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
      headStyles: {
        fillColor: [78, 84, 200],
        textColor: 255
      }
    });

    // Results Data
    const resultsData = this.waecresults.resultDetails.map(
      (result: { subjectcode: string; subject: string; grade: string; interpretation: string }) => [
        result.subjectcode,
        result.subject,
        result.grade,
        result.interpretation
      ]
    );

    // Results Table
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Subject Code', 'Subject', 'Grade', 'Interpretation']],
      body: resultsData,
      theme: 'grid',
      headStyles: {
        fillColor: [78, 84, 200],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        2: { cellWidth: 20 },
        3: { cellWidth: 40 }
      },
      // didDrawCell: (data: any) => {
      //   if (data.section === 'body' && data.column.index === 2) {
      //     const grade = data.cell.raw;
      //     const ctx = doc;

      //     let fillColor: [number, number, number] | null = null;
      //     if (['A1', 'B2', 'B3'].includes(grade)) fillColor = [46, 125, 50];      // Green
      //     else if (['C4', 'C5', 'C6'].includes(grade)) fillColor = [30, 136, 229]; // Blue
      //     else if (['D7', 'E8'].includes(grade)) fillColor = [255, 193, 7];       // Yellow
      //     else if (grade === 'F9') fillColor = [198, 40, 40];                     // Red

      //     if (fillColor) {
      //       ctx.setFillColor(...fillColor);
      //       ctx.circle(data.cell.x + 10, data.cell.y + 7, 5, 'F');
      //       ctx.setTextColor(255, 255, 255);
      //       ctx.text(grade, data.cell.x + 10, data.cell.y + 9, { align: 'center' });
      //       ctx.setTextColor(0, 0, 0); // Reset for next cell
      //     }
      //   }
      // }


    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Generated by OTC - ' + new Date().toLocaleDateString(),
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Save the file
    const filename = `WAEC_Result_${this.waecresults.cname.replace(/ /g, '_')}_${this.waecresults.examyear}.pdf`;
    doc.save(filename);
  }












  // MODAL TS CLASS



  confirmInput = '';
  showMismatchError = false;
  modalInstance: any;

  // constructor(private fb: FormBuilder) {}

  openConfirmModal() {
    this.confirmInput = '';
    this.showMismatchError = false;
    const modalElement = document.getElementById('confirmModal');
    this.modalInstance = new bootstrap.Modal(modalElement);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance.hide();
  }
  isIndexConfirmed: boolean = false; // Track confirmation status


  verifyConfirmation() {
    const original = this.examForm.get('indexNumber')?.value;
    if (this.confirmInput === original) {
      this.isIndexConfirmed = true;
      this.showMismatchError = false;
      this.closeModal();
      // Proceed to next step (e.g. enable next section or allow form submission)
    } else {
      this.showMismatchError = true;
    }
  }


















  
  // openConfirmationModal() {
  //   const modalRef = this.modalService.open(ConfirmationModalComponent, {
  //     centered: true,
  //     backdrop: 'static'
  //   });

  //   // Customize modal inputs
  //   modalRef.componentInstance.title = 'Confirm Index Number';
  //   modalRef.componentInstance.message = `You entered: }. Is this correct?`;
  //   modalRef.componentInstance.confirmText = 'Yes, Retrieve Results';
  //   modalRef.componentInstance.cancelText = 'No, Edit';

  //   modalRef.result.then((result) => {
  //     if (result) {
  //     }
  //   }).catch(() => {
  //     // Handle dismissal
  //     console.log('Modal dismissed');
  //   });
  // }

































































































  // Check Management Methods
  initiateCheck() {
    const newCheck: EligibilityCheck = {
      id: this.generateId(),
      userId: 'current-user-id', // Replace with actual user ID from auth
      candidateName: this.newCheckForm.value.candidateName,
      examDetails: this.newCheckForm.value,
      paymentStatus: 'pending',
      checkStatus: 'not_started',
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.userChecks.unshift(newCheck);
    this.currentCheck = newCheck;
    this.saveChecks();
    this.newCheckForm.reset();
  }



// REAL API FOR THE FLOW

// 1st Step
createRecords() {
    this.manualService.startFirstStep().subscribe({
      next: (data: any) => {
        this.currentCheck = data;
        this.userChecks.unshift(data);
        this.saveChecks();
        alert("Successfully started check");
      },
      error: (err) => {
        console.error(err);
        alert("Failed to start check");
      }
    });
  }



//2nd Step
updatePayment(recordsId:number, paymentStatus: any){
  this.manualService.startSecondStep(recordsId,paymentStatus).subscribe((data=>{
    console.log("succeffully created the records");
  }))
}

//3rd Step
updateCandidate(recordId: number,payload: any){
  this.manualService.startThirdStep(recordId,payload).subscribe((data=>{
    this.getResultsByUser();
    console.log("succeffully created the records");
  }))
}

getResultsByUser(){
  this.manualService.getAllRecordsByUserID().subscribe((data=>{
    this.userChecks=data;
    console.log(data);
  }));
}

// THE PAYMENT MODAL 

closePaymentModal() {
    this.showPaymentModal = false;
    this.isSubmitting = false;
    this.showPaymentModal = false;
    document.body.style.overflow = ''; // 🔓 Restore scroll
    this.blurService.setBlur(false);
  }


  
  processingPayment = false;
  // formatAmount(event: any): void {
  //   let value = event.target.value.replace(/[^0-9.]/g, '');
  //   // Handle multiple decimal points
  //   const decimalSplit = value.split('.');
  //   if (decimalSplit.length > 2) {
  //     value = decimalSplit[0] + '.' + decimalSplit[1];
  //   }

  //   // Limit to 2 decimal places
  //   if (decimalSplit.length > 1) {
  //     value = decimalSplit[0] + '.' + decimalSplit[1].slice(0, 2);
  //   }
  //   event.target.value = value;
  //   this.paymentForm.get('amount')?.setValue(this.totalPrice.toFixed(2), { emitEvent: false, onlySelf:true });
  // }
    totalPrice: number = 0;

    // Submit payment
  submitPayment(): void {
    if (this.paymentForm.valid) {
      this.processingPayment = true;    
      this.manualService.initializePayment(this.paymentForm.value).subscribe((data)=>{
        console.log(data);
      })
      // Simulate payment processing
      setTimeout(() => {
        this.processingPayment = false;
        // Handle payment success/failure here
        console.log('Payment submitted:', this.paymentForm.value);
      }, 2000);
    }
  }
    // Validate amount on blur
  validateAmount(): void {
    const amountControl = this.paymentForm.get('amount');
    if (amountControl?.value) {
      const numValue = parseFloat(amountControl.value);
      if (!isNaN(numValue)) {
        amountControl.setValue(numValue.toFixed(2));
      } else {
        amountControl.setValue('0.00');
      }
    }
  }

initializeForm(fixedAmount: number = 0.00) {
  this.paymentForm = this.fb.group({
    amount: [
      fixedAmount.toFixed(2), 
      [Validators.required, Validators.min(0.01)]
    ],
    payer: ['', [
      Validators.required,
      Validators.pattern(/^(?:233|0)[2345][0-9]{8}$/)
    ]],
    channel: ['', Validators.required]
  });

  // Make readonly instead of disabled to include in form value
  this.isAmountFixed = true;
}
isAmountFixed = true; // Add this property

openPaymentModal() {
  this.showPaymentModal = true;
  document.body.style.overflow = 'hidden';
      this.blurService.setBlur(true);

}


 ngOnDestroy() {
    // Clean up when component is destroyed
    this.blurService.setBlur(false);
    document.body.style.overflow = '';
  }




  showOtpModal=false;
openOtpModal() {
  this.showOtpModal = true;
  document.body.style.overflow = 'hidden';
      this.blurService.setBlur(true);

}
// closeOtpModal() {
//     this.isSubmitting = false;
//     this.showOtpModal = false;
//     document.body.style.overflow = ''; // 🔓 Restore scroll
//     this.blurService.setBlur(false);
//   }


  submitOTP(){
    console.log("Summmnoodoidi, OTP")
  }




































































































  otpForm!: FormGroup;
  otpError = '';
  verifyingOTP = false;
  resendCooldown = 0;
  lastFourDigits = '1234'; // Replace with actual last digits

  // constructor(private fb: FormBuilder) {
  
  // }

  handleOtpKeyDown(event: KeyboardEvent, index: number) {
    // Allow backspace, delete, tab, arrows
    if ([8, 9, 37, 39, 46].includes(event.keyCode)) {
      return;
    }
    
    // Only allow numbers
    if (event.keyCode < 48 || event.keyCode > 57) {
      if (event.keyCode < 96 || event.keyCode > 105) {
        event.preventDefault();
      }
    }
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    if (input.value.length === 1) {
      if (index < 5) {
        const nextInput = document.querySelector(`[formControlName="digit${index + 1}"]`) as HTMLInputElement;
        nextInput.focus();
      } else {
        input.blur();
      }
    }
  }

  // handlePaste(event: ClipboardEvent) {
  //   event.preventDefault();
  //   const pasteData = event.clipboardData?.getData('text/plain').trim();
  //   if (pasteData && pasteData.length === 6 && /^\d+$/.test(pasteData)) {
  //     for (let i = 0; i < 6; i++) {
  //       this.otpForm.get(`digit${i}`)?.setValue(pasteData[i]);
  //     }
  //   }
  // }

  verifyOTP() {
    if (this.otpForm.invalid) {
      this.otpError = 'Please enter a valid 6-digit code';
      return;
    }
    
    this.verifyingOTP = true;
    this.otpError = '';
    
    // Combine OTP digits
    const otp = Object.values(this.otpForm.value).join('');
    
    // Here you would call your OTP verification service
    // this.otpService.verifyOTP(otp).subscribe(...)
    
    // For demo purposes, we'll simulate a delay
    setTimeout(() => {
      this.verifyingOTP = false;
      // this.showOtpModal = false; // Uncomment on successful verification
      // this.otpError = 'Invalid verification code'; // Uncomment if verification fails
    }, 2000);
  }

  resendOTP() {
    if (this.resendCooldown > 0) return;
    
    // Reset OTP fields
    for (let i = 0; i < 6; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('');
    }
    
    // Set cooldown (60 seconds)
    this.resendCooldown = 60;
    const interval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    // Here you would call your OTP resend service
    // this.otpService.resendOTP().subscribe(...)
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }


handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pasteData = event.clipboardData?.getData('text/plain').replace(/\D/g, ''); // Remove non-digits
  if (pasteData && pasteData.length >= 6) {
    for (let i = 0; i < 6; i++) {
      const control = this.otpForm.get(`digit${i}`);
      if (control) {
        control.setValue(pasteData[i]);
      }
    }
    // Focus the last field after paste
    setTimeout(() => {
      const lastInput = document.querySelector('[formControlName="digit5"]') as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }, 10);
  }
}


handleInput(event: any, index: number): void {
  const input = event.target;
  const value = input.value;

  // Allow only digits
  if (!/^\d$/.test(value)) {
    input.value = '';
    return;
  }

  if (value && index < 5) {
    const inputsArray = this.otpInputs.toArray();
    inputsArray[index + 1].nativeElement.focus();
  }

  // Optionally mark field as touched
  this.otpForm.get(`digit${index}`)?.markAsTouched();
}

handleKeyDown(event: KeyboardEvent, index: number): void {
  const key = event.key;

  if (key === 'Backspace' && index > 0 && !this.otpForm.get(`digit${index}`)?.value) {
    const inputsArray = this.otpInputs.toArray();
    inputsArray[index - 1].nativeElement.focus();
  }
}



}

