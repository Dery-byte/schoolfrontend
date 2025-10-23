import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
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
import { Router, TitleStrategy } from '@angular/router';


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
  paymentStatus: 'PENDING' | 'PAID';
  checkStatus: 'NOT_CHECKED' | 'IN_PROGRESS' | 'CHECKED';
  createdAt: Date;
  lastUpdated: Date;
  result?: any;
  checkLimit?: number;
  subscriptionType?: string;
}


interface ExistingColleges {
  id: number;
  name: string;
  isRequired: boolean;
  selected: boolean;
}


interface Biodata {
  id: string,
  firstName: string;
  middleName?: string;  // Optional field
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dob: string;  // or Date if you prefer
  gender?: string;  // Optional field
  region: string;  // Optional field
  //record?: string;  // If you need to associate with a record
}
@Component({
  selector: 'app-user-check-results',
  templateUrl: './user-check-results.component.html',
  styleUrls: ['./user-check-results.component.css']
})
export class UserCheckResultsComponent implements OnInit {

  @ViewChild('target') targetElement!: ElementRef;
  isLoading = false;     // Loading state
  submitSuccess = false; // Track submission success
  proceedButtonClicked = false; // Track if "Proceed" was clicked
  allRegions: string[] = []; // Stores raw region names from API
  // regionOptions: { apiValue: GhanaRegion, display: string }[] = [];

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
    // record:''
  };
  @Output() selectedAttendees = new EventEmitter<ExistingColleges[]>();

  showDropdown = false;
  searchTerm = '';

  // Current attendees (both selected and available)
  allColleges: ExistingColleges[] = [
    { id: 1, name: 'Nancy King', isRequired: false, selected: false },
    { id: 2, name: 'Nancy Davolio', isRequired: false, selected: false },
    { id: 3, name: 'Robert Davolio', isRequired: false, selected: false },
    { id: 4, name: 'Michael Smith', isRequired: false, selected: false },
    { id: 5, name: 'Emily Johnson', isRequired: false, selected: false }
  ];

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

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (!this.showDropdown) {
      this.searchTerm = '';
    }
  }

  // addAttendee(attendee: Attendee): void {
  //   attendee.selected = true;
  //   this.showDropdown = false;
  //   this.searchTerm = '';
  //   this.emitSelectedAttendees();
  // }

  removeAttendee(event: Event, attendee: ExistingColleges): void {
    event.stopPropagation();
    if (!attendee.isRequired) {
      attendee.selected = false;
      this.emitSelectedAttendees();
    }
  }

  private emitSelectedAttendees(): void {
    const selected = this.allColleges.filter(a => a.selected || a.isRequired);
    this.selectedAttendees.emit(selected);
  }



  get hasMinimumSelection(): boolean {
    const selectedCount = this.allColleges.filter(a => a.selected || a.isRequired).length;
    return selectedCount >= 3;
  }

  // logSelectedAttendeeIds(): void {
  //   if (!this.hasMinimumSelection) {
  //     alert('Please select at least 3 colleges');
  //     return;
  //   }

  //   const selectedAttendees = this.allAttendees.filter(a => a.selected || a.isRequired);
  //   const selectedIds = selectedAttendees.map(a => a.id);
  //   console.log('Selected College IDs:', selectedIds);
  // }








  get selectedCount(): number {
    return this.allColleges.filter(a => a.selected || a.isRequired).length;
  }

  get reachedMaxSelection(): boolean {
    return this.selectedCount >= 3;
  }

  addAttendee(attendee: ExistingColleges): void {
    if (!this.reachedMaxSelection) {
      attendee.selected = true;
      this.showDropdown = false;
      this.searchTerm = '';
      this.emitSelectedAttendees();
    }
  }

  logSelectedAttendeeIds(): void {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);

    console.log('Selected College IDs:', selectedIds);
    // alert(`Selected College IDs: ${selectedIds.join(', ')}`);

    // In a real app, you might:
    // - Send to an API
    // - Update a form control
    // - Navigate to another page
  }






































































  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @Input() statusData: any;
  @Input() paymentCompleted: boolean = false;
  @Input() webhookResponse: any = null;
  // @Output() closeModal = new EventEmitter<void>();
  @ViewChild('paymentConfirmation', { static: false })
  paymentConfirmation!: ElementRef<HTMLDivElement>;

  confirmInput: string = '';

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
  // getButtonText(check: any): string {
  //   if (check.checkLimit >= 2) {
  //     return 'Pay & Continue'; // Disabled but shows same text
  //   }
  //   return check.paymentStatus === 'PAID' ? 'Continue' : 'Pay & Continue ';
  // }

  getButtonText(check: any): string {
    return check.paymentStatus === 'PAID' ? 'Continue' : 'Pay & Continue';
  }

  // Existing properties
  examBoards = ['WAEC', 'CTVET'];
  // availableExamTypes: {key: string, display: string}[] = [];

  availableExamTypes: string[] = [];
  entryForm: FormGroup;
  entries: any[] = [];
  examYears: number[] = Array.from(
    { length: (new Date().getFullYear() - 1999) },
    (_, i) => new Date().getFullYear() - i
  );
  examForm!: FormGroup;
  manualEntryForm!: FormGroup;
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
        'MATHEMATICS (CORE)', 'MATHEMATICS (ELECTIVE)', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS',
        'ENGLISH LANG', 'MATHEMATICS (CORE)', 'INTEGRATED SCIENCE', 'SOCIAL STUDIES',
        'CIVIC EDUCATION', 'GENERAL AGRICULTURE', 'ANIMAL HUSBANDRY',
        'CROP HUSBANDRY AND HORTICULTURE', 'FISHERIES',
        'COMPUTER SCIENCE', 'FURTHER MATHEMATICS', 'PHYSICAL EDUCATION',
        'DATA PROCESSING', 'ECONOMICS', 'GEOGRAPHY', 'GOVERNMENT', 'HISTORY',
        'LITERATURE-IN-ENGLISH', 'CHRISTIAN RELIGIOUS STUDIES', 'ISLAMIC STUDIES',
        'FRENCH', 'ARABIC', 'HAUSA', 'IGBO', 'YORUBA', 'EDO', 'EFIK', 'IBIBIO',
        'FINANCIAL ACCOUNTING', 'COMMERCE', 'COST ACCOUNTING', 'BUSINESS MANAGEMENT',
        'TECHNICAL DRAWING', 'GENERAL KNOWLEDGE IN ART', 'APPLIED ELECTRICITY',
        'ELECTRONICS', 'AUTO MECHANICS', 'BUILDING CONSTRUCTION', 'METALWORK', 'WOODWORK',
        'MANAGEMENT IN LIVING', 'FOODS AND NUTRITION', 'CLOTHING AND TEXTILES', 'GRAPHIC DESIGN',
        'PICTURE MAKING', 'SCULPTURE', 'CERAMICS', 'TEXTILES', 'MUSIC'
      ],
      WASSCE_PRIVATE: [
        'MATHEMATICS (CORE)', 'MATHEMATICS (ELECTIVE)', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS',
        'ENGLISH LANG', 'MATHEMATICS (CORE)', 'INTEGRATED SCIENCE', 'SOCIAL STUDIES',
        'CIVIC EDUCATION', 'GENERAL AGRICULTURE', 'ANIMAL HUSBANDRY',
        'CROP HUSBANDRY AND HORTICULTURE', 'FISHERIES',
        'COMPUTER SCIENCE', 'FURTHER MATHEMATICS', 'PHYSICAL EDUCATION',
        'DATA PROCESSING', 'ECONOMICS', 'GEOGRAPHY', 'GOVERNMENT', 'HISTORY',
        'LITERATURE-IN-ENGLISH', 'CHRISTIAN RELIGIOUS STUDIES', 'ISLAMIC STUDIES',
        'FRENCH', 'ARABIC', 'HAUSA', 'IGBO', 'YORUBA', 'EDO', 'EFIK', 'IBIBIO',
        'FINANCIAL ACCOUNTING', 'COMMERCE', 'COST ACCOUNTING', 'BUSINESS MANAGEMENT',
        'TECHNICAL DRAWING', 'GENERAL KNOWLEDGE IN ART', 'APPLIED ELECTRICITY',
        'ELECTRONICS', 'AUTO MECHANICS', 'BUILDING CONSTRUCTION', 'METALWORK', 'WOODWORK',
        'MANAGEMENT IN LIVING', 'FOODS AND NUTRITION', 'CLOTHING AND TEXTILES', 'GRAPHIC DESIGN',
        'PICTURE MAKING', 'SCULPTURE', 'CERAMICS', 'TEXTILES', 'MUSIC'
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
    private router: Router,
    private modalService: NgbModal) {
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


  paymentAmount: number = 0;


  ngOnInit(): void {
    this.initializeForm(); // Sets fixed amount to GHS 50.00
    this.initForm();
    this.manualForm();
    this.loadChecks();
    this.getResultsByUser();
    this.getColleges();
    this.getAllRegions();

  }


  simulatePayment() {
    if (this.currentCheck) {
      this.currentCheck.paymentStatus = 'PAID';
      this.currentCheck.checkStatus = 'IN_PROGRESS';
      this.currentCheck.lastUpdated = new Date();
      //this.saveChecks();
      this.paymentSuccess = true;
    }
  }


  getColleges() {
    this.manualService.getAllCategories().subscribe({
      next: (colleges: any) => {
        this.allColleges = colleges;

        console.log(this.allColleges);
      },
      error: (err) => {
        console.error('Failed to load Colleges:', err);
        this.snackBar.open('Failed to load Collegesy details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    })
  }

  resumeCheck(checkId: string) {
    console.log(checkId);
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
    this.recordId = '';  // Clear the stored ID
    this.showH2Message = false;

  }


  get fullName(): string {
    if (!this.biodata) return '';
    const firstName = this.biodata.firstName || '';
    const middleName = this.biodata.middleName || '';
    const lastName = this.biodata.lastName || '';
    return [firstName, middleName, lastName]
      .filter(name => name?.trim()) // Optional chaining + trim
      .join(' ');
  }

  isBioDataLoading: boolean = false;

  getBiodataBYRecordId() {
    this.isBioDataLoading = true;
    this.manualService.getBoidataByRecordId(this.recordId).subscribe({
      next: (data: any) => {
        this.biodata = data;
        this.enteredName = this.fullName; // Use the getter
        console.log(this.biodata);
        //this.recordId='';
        this.isBioDataLoading = false;
      },
      error: (err) => {
        this.isBioDataLoading = false;
        console.error('Failed to load BoidData:', err);

        // this.snackBar.open('Please Kindly provide your Biodata', 'Close', {
        //   duration: 3000,
        //   panelClass: ['error-snackbar']
        // });
      },
      complete: () => {
        this.isBioDataLoading = false;
      }
    })

  }
































  //isLoading = false;  // Loading state flag
  //submitSuccess = false;  // Success state flag



  submitBiodata() {
    // Check if we're creating new biodata or updating existing
    if (this.biodata.id) {
      this.updateBiodata();
    } else {
      this.createBiodata();

    }
  }

  // Scroll to target H2
  scrollToTarget() {
    this.showH2Message = true
    this.proceedButtonClicked = true; // Hide form and show H2
    if (this.hasBiodata()) { // Only scroll if biodata is valid/submitted
      this.targetElement.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  showH2Message = false;       // Toggles h2 visibility
  premium = true;


  private createBiodata() {
    const formattedData = {
      ...this.biodata,
      dob: this.formatDate(this.biodata.dob),
      record: { id: this.recordId },
      //id: this.biodata.id
    };
    console.log(formattedData);
    this.isLoading = true;
    this.submitSuccess = false;

    this.manualService.addBiodata(formattedData).subscribe({
      next: (response) => {
        this.handleSuccessResponse(response, 'Biodata submitted successfully!');
        this.getBiodataBYRecordId(); // Refresh the data after creation
        // this.setMessageDisplayTime();

      },





      error: (err) => {
        this.isLoading = false;
        console.log('Full error object:', err);  // 🔍 check this in browser console

        this.errorMsg = [];
        // try to read message
        if (err.error?.message) {
          this.errorMsg.push(err.error.message);
        } else if (typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            if (parsed.message) {
              this.errorMsg.push(parsed.message);
            }
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


  errorMsg: Array<string> = [];

  errorMsgReg: Array<string> = [];
  setMessageDisplayTime(): void {
    setTimeout(() => {
      this.errorMsg = [];
      this.errorMsgReg = [];
      this.submitSuccess = false;

    }, 3000);
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

  private formatDate(dateString: string): string | null {
    return dateString ? new Date(dateString).toISOString().split('T')[0] : null;
  }

  private handleSuccessResponse(response: any, message: string) {
    this.isLoading = false;
    this.submitSuccess = true;
    console.log('Success:', response);
    // alert(message);
  }


  hasBiodata(): boolean {
    return (this.isValidBiodata() || this.submitSuccess);
  }

  private isValidBiodata(): boolean {
    return !!this.biodata.id &&
      !!this.biodata.firstName &&
      !!this.biodata.lastName &&
      !!this.biodata.email;
  }


  resetForm() {
    this.biodata = {
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
      //record: ''
    };
    this.submitSuccess = false;
  }


  // submitBiodata(){
  //   alert(this.recordId);
  // }

  cancelCurrentCheck() {
    this.currentCheck = null;
    this.paymentSuccess = false;
  }

  completeCurrentCheck() {
    if (this.currentCheck) {
      this.currentCheck.checkStatus = 'CHECKED';
      this.currentCheck.lastUpdated = new Date();
      //this.saveChecks();
      this.currentCheck = null;
      this.paymentSuccess = false;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // private saveChecks() {
  //   localStorage.setItem('userChecks', JSON.stringify(this.userChecks));
  // }

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
    console.log('Selected Board:', selectedBoard);

    if (selectedBoard === 'WAEC') {
      this.availableExamTypes = ['WASSCE School', 'WASSCE Private'];
    } else if (selectedBoard === 'CTVET') {
      this.availableExamTypes = ['NAPTEX', 'TEU'];
    } else {
      this.availableExamTypes = [];
    }

    console.log('Available Exam Types:', this.availableExamTypes);

    // Reset dependent fields
    this.entryForm.patchValue({ examType: '' });
    this.currentSubjects = [];
    this.currentGrades = [];
  }

  logCurrentState(): void {
    console.log('Current Board:', this.entryForm.value.examBoard);
    console.log('Current Exam Type:', this.entryForm.value.examType);
    console.log('Available Exam Types:', this.availableExamTypes);
    console.log('Current Subjects:', this.currentSubjects);
    console.log('Current Grades:', this.currentGrades);
    console.log('Subject Database WAEC:', this.subjectDatabase.WAEC);
    console.log('Subject Database CTVET:', this.subjectDatabase.CTVET);
  }

  // Add a method to handle exam type selection

  onExamTypeChangeEntryForm(event: any): void {
    const selectedExamType = event.target.value;
    const selectedBoard = this.entryForm.value.examBoard;

    console.log('Selected Exam Type:', selectedExamType);
    console.log('Selected Board:', selectedBoard);

    // Reset current arrays
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

    console.log('Updated Current Subjects:', this.currentSubjects);
    console.log('Updated Current Grades:', this.currentGrades);

    // Reset subject and grade selections
    this.entryForm.patchValue({ subject: '', grade: '' });
  }


  addEntry(): void {
    const entry = this.entryForm.value;
    console.log("This is the entry information:", entry);


    // Validate all required fields
    if (entry.indexNumber && entry.indexNumber.toString().trim() !== '' &&
      entry.examBoard && entry.examBoard.toString().trim() !== '' &&
      entry.examYear && entry.examYear.toString().trim() !== '' &&
      entry.subject && entry.subject.toString().trim() !== '' &&
      entry.grade && entry.grade.toString().trim() !== '' &&
      entry.examType && entry.examType.toString().trim() !== '' &&
      entry.sitting && entry.sitting.toString().trim() !== '') {

      this.entries.push({ ...entry });

      // Reset only subject-related fields
      this.entryForm.patchValue({
        subject: '',
        grade: '',
        sitting: ''
      });

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










  async submitFormCheck() {
    if (this.examForm.valid) {
      try {
        // First prompt for index number re-entry
        const firstResult = await Swal.fire({
          title: 'Re-enter Index Number',
          input: 'text',
          inputLabel: 'Please re-enter your index number for verification',
          inputPlaceholder: 'Enter your index number',
          showCancelButton: true,
          confirmButtonText: 'Verify',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'Please enter your index number';
            }
            return null;
          }
        });

        if (firstResult.isConfirmed) {
          const reenteredIndex = firstResult.value;
          const originalIndex = this.examForm.value.indexNumber;

          if (reenteredIndex === originalIndex) {
            // Index numbers match, proceed with confirmation
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
            // Index numbers don't match
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

  // submitFormCheck() {
  //   if (this.examForm.valid && this.isIndexConfirmed) {
  //     // Use SweetAlert2 for confirmation dialog
  //     Swal.fire({
  //       title: 'CONFIRM INDEX NUMBER',
  //       html: `<h3 style="margin: 0; font-weight: bold;">${this.examForm.value.indexNumber}</h3>`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes, submit',
  //       cancelButtonText: 'No, cancel',
  //       reverseButtons: true,
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         // this.openNameComparisonModal();
  //         this.fetchResultAutoAssign(); // Proceed only if user confirms
  //       }
  //       // else do nothing if canceled
  //     });
  //   } else {
  //     this.examForm.markAllAsTouched();
  //   }
  // }







  // Add this method to your component class
  getSimplifiedResults(): { subject: string, grade: string }[] {
    if (!this.waecresults || !this.waecresults.resultDetails) {
      return [];
    }

    return this.waecresults.resultDetails.map((result: any) => ({
      subject: result.subject,
      grade: result.grade
    }));
  }



  elligibilityResults: any;
  isCheckingEligibility: boolean = false;
  // In eligibility-results.component.ts
  getSubjects(cutoffPoints: any): string[] {
    return Object.keys(cutoffPoints);
  }

  get isLimitReached(): boolean {
    return (this.currentCheck?.checkLimit ?? 0) >= 2;
  }









  // constructor(
  //   private manualService: ManualService,
  //   private snackBar: MatSnackBar,
  //   private router: Router
  // ) {}

  checkingEligibility = false;

  analyzeOneResults() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    console.log(selectedIds);

    console.log('Selected College IDs:', selectedIds);
    // alert(`Selected College IDs: ${selectedIds.join(', ')}`);
    if (!this.waecresults || !this.waecresults.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;
    this.checkingEligibility = true

    const analysisData = {
      resultDetails: this.waecresults.resultDetails.map((result: any) => ({
        subject: result.subject,
        grade: result.grade,
      })),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };

    console.log('Analysis Data:', analysisData);

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
          this.router.navigate(['/user/checkEligilibilty'], {
          });
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





  checkEligibilityManualEntry(): void {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);
    console.log(selectedIds);
    console.log(this.recordId);
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
          this.router.navigate(['/user/checkEligilibilty'], {
          });
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
    console.log('Formatted Response:', response);
  }







  normalizeSubject(subject: string): string {
    const map: Record<string, string> = {
      'ENGLISH LANG': 'ENGLISH LANGUAGE',
      'ENGLISH LANGUAGE': 'ENGLISH LANGUAGE',
      'MATHS': 'MATHEMATICS',
      'MATHEMATICS(CORE)': 'MATHEMATICS',
      'MATHEMATICS ELECTIVE': 'MATHEMATICS (ELECTIVE)',
      // Add more if needed
    };

    const key = subject.trim().toUpperCase();
    return map[key] || key;
  }
  candinateName: any;

  gradeOrder = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  getBetterGrade(g1: string, g2: string): string {
    const i1 = this.gradeOrder.indexOf(g1);
    const i2 = this.gradeOrder.indexOf(g2);
    return i1 <= i2 ? g1 : g2;
  }

  analyzeTwoResults() {
    const selectedAttendees = this.allColleges.filter(a => a.selected || a.isRequired);
    const selectedIds = selectedAttendees.map(a => a.id);

    console.log(selectedIds);

    console.log('Selected College IDs:', selectedIds);
    const r1 = this.waecresults;
    const r2 = this.waecresults2;

    if (!r1 || !r1.resultDetails) {
      console.warn('No results available to analyze');
      return;
    }

    this.isCheckingEligibility = true;

    let finalResultMap: Record<string, { subject: string, grade: string }> = {};

    // Step 1: Add all from first result
    for (const res of r1.resultDetails) {
      const norm = this.normalizeSubject(res.subject);

      finalResultMap[norm] = { subject: norm, grade: res.grade };
    }

    // Step 2: If second result exists, compare and update
    if (r2 && r2.resultDetails) {
      for (const res of r2.resultDetails) {
        const norm = this.normalizeSubject(res.subject);

        const existing = finalResultMap[norm];
        if (existing) {
          const better = this.getBetterGrade(existing.grade, res.grade);
          finalResultMap[norm] = { subject: norm, grade: better };
        } else {
          finalResultMap[norm] = { subject: norm, grade: res.grade };
        }
      }
    }

    // Step 3: Prepare analysis data
    const analysisData = {
      resultDetails: Object.values(finalResultMap),
      categoryIds: selectedIds,
      checkRecordId: this.recordId
    };



    //    const analysisData = {
    //   resultDetails: this.waecresults.resultDetails.map((result: any) => ({
    //     subject: result.subject,
    //     grade: result.grade,
    //   })),
    //   categoryIds: selectedIds,
    //   checkRecordId: this.recordId
    // };

    console.log('Best Grades Analysis:', analysisData);
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



  // Separate function for API call (cleaner code)

  waecresults: any;
  waecresults2: any;
  errorMessage: any;
  secondResultFetched = false;


  // candinateName:any;
  normalizeName(name: string): string {
    if (!name) return '';

    // Step 1: Replace hyphens with spaces and normalize
    let normalized = name
      .toLowerCase()
      .replace(/-/g, ' ')   // Replace hyphens with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    // Step 2: Split into parts, sort alphabetically, and rejoin
    const nameParts = normalized.split(' ');
    const sortedParts = nameParts.sort(); // Alphabetical order
    return sortedParts.join(' ');
  }

  //   normalizeName(name: string): string {
  //   if (!name) return '';
  //   return name
  //     .toLowerCase()    // Case insensitive
  //     .replace(/\s+/g, ' ')  // Replace multiple spaces with one
  //     .trim()           // Remove leading/trailing spaces
  //     .replace(/[^a-z ]/g, ''); // Remove special chars (optional)
  // }

  namesMatch(): boolean {
    return this.normalizeName(this.enteredName) === this.normalizeName(this.candinateName);
  }








  enteredName: any;


  fetchResultAutoAssign() {
    this.isLoading = true;

    const payload = {
      cindex: this.examForm.value.indexNumber,
      examyear: this.examForm.value.examYear,
      examtype: this.examForm.value.examType,
      // recordId: this.recordId
    };

    console.log(payload);

    console.log("This is the record ID ", this.recordId);
    this.waec.verifyWaecResult({ body: payload, recordId: this.recordId }).subscribe({
      next: (res) => {
        this.isLoading = false;
        // this.getResultsByUser();
        if (!this.waecresults) {
          this.waecresults = res;
          this.currentCheck!.checkLimit = (this.currentCheck!.checkLimit ?? 0) + 1;

          this.candinateName = this.waecresults.cname;
          this.resumeCheck(this.recordId);
          console.log("This is the record ID ", this.recordId)
          this.getResultsByUser();
          this.openNameComparisonModal();
          console.log("Results 1 ", this.waecresults);
        } else if (!this.waecresults2) {
          this.waecresults2 = res;
          this.resumeCheck(this.recordId);
          this.currentCheck!.checkLimit = (this.currentCheck!.checkLimit ?? 0) + 1;


          // this.getResultsByUser();

          this.secondResultFetched = true; // 🚨 set flag to true
          console.log("Results 2 ", this.waecresults2);
          // this.openNameComparisonModal();

        } else {
          // Both already filled
          this.errorMessage = 'You can only compare two results.';
        }
      }
    });
  }

  getAlignedSubjects(): {
    subjectcode: string;
    subject: string;
    result1: {
      subjectcode: string;
      subject: string;
      grade: string;
      interpretation: string;
    } | null;
    result2: {
      subjectcode: string;
      subject: string;
      grade: string;
      interpretation: string;
    } | null;
  }[] {
    if (!this.waecresults) return [];

    const subjects1 = this.waecresults.resultDetails;
    const subjects2 = this.waecresults2?.resultDetails || [];

    return subjects1.map((sub1: {
      subjectcode: string;
      subject: string;
      grade: string;
      interpretation: string;
    }) => {
      const sub2 = subjects2.find((s: {
        subjectcode: string;
        subject: string;
        grade: string;
        interpretation: string;
      }) => s.subjectcode === sub1.subjectcode) || null;

      return {
        subjectcode: sub1.subjectcode,
        subject: sub1.subject,
        result1: sub1,
        result2: sub2
      };
    });
  }



  handleSuccess(res: any) {
    this.isLoading = false;
    this.waecresults = res;
    localStorage.setItem("candidate", JSON.stringify(res));

    if (this.currentCheck) {
      this.currentCheck.result = res;
      this.currentCheck.checkStatus = 'CHECKED';
      // this.saveChecks();
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
        this.currentCheck.checkStatus = 'CHECKED';
        // this.saveChecks();
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


  // Check Management Methods
  initiateCheck() {
    const newCheck: EligibilityCheck = {
      id: this.generateId(),
      userId: 'current-user-id', // Replace with actual user ID from auth
      candidateName: this.newCheckForm.value.candidateName,
      examDetails: this.newCheckForm.value,
      paymentStatus: 'PENDING',
      checkStatus: 'NOT_CHECKED',
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.userChecks.unshift(newCheck);
    this.currentCheck = newCheck;
    //this.saveChecks();
    this.newCheckForm.reset();
  }



  // REAL API FOR THE FLOW

  // 1st Step

  isCreatingRecord = false;
  createRecords() {
    this.isCreatingRecord = true;
    this.manualService.startFirstStep().subscribe({
      next: (data: any) => {
        this.currentCheck = data;
        this.userChecks.unshift(data);
        // this.saveChecks();
        //alert("Successfully started check");

        // Extract the record ID from the response
        this.recordId = data.id || data._id || data.recordId || data.checkId;

        // Optional: Save the ID to localStorage or service if needed elsewhere
        // localStorage.setItem('currentRecordId', this.recordId);

        console.log('Record created with ID:', this.recordId);
        this.isCreatingRecord = false;

      },
      error: (err) => {
        this.isCreatingRecord = false;

        console.error(err);
        this.recordId = null; // Reset on error

        //alert("Failed to start check");
      }
    });
  }



  //2nd Step
  updatePayment(recordsId: number, paymentStatus: any) {
    this.manualService.startSecondStep(recordsId, paymentStatus).subscribe((data => {
      console.log("succeffully created the records");
    }))
  }

  //3rd Step
  updateCandidate(recordId: number, payload: any) {
    this.manualService.startThirdStep(recordId, payload).subscribe((data => {
      this.getResultsByUser();
      console.log("succeffully created the records");
    }))
  }
  isLoadingChecks: boolean = false;


  getResultsByUser() {
    this.isLoadingChecks = true;
    this.manualService.getAllRecordsByUserID().subscribe({
      next: (data) => {
        this.userChecks = data;
        console.log('User checks loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load user checks:', err);
        // Optional: Show error message to user
        // this.toast.error('Failed to load verification history. Please try again.');
      },
      complete: () => {
        this.isLoadingChecks = false;
      }
    });
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
  totalPrice: number = 0;




  // Submit payment
  externalRef: string = ''; // Add this at the top of your component

  recordId: any;

  submitPayment(): void {
    if (this.paymentForm.valid) {
      this.processingPayment = true;
      // Get the recordId from wherever it's stored in your component
      const recordId = this.recordId; // Or this.paymentForm.get('recordId')?.value;
      console.log("This is the record ID: ", recordId);

      const paymentPayload = {
        ...this.paymentForm.value,
        subscriptionType: this.selectedPlan
      };
      this.manualService.initializePayment(paymentPayload, recordId).subscribe({
        next: (data: any) => {
          // Save externalRef for later use
          this.externalRef = data.externalref;
          console.log("This is the external ref ", this.externalRef);
          console.log("This is the record ID: ", recordId);
          // Store the recordId for future reference if needed
          if (recordId) {
            this.recordId = recordId;
          }
          console.log(paymentPayload);
          this.closePaymentModal();
          this.openOtpModal();
          this.processingPayment = false;
        },
        error: (err) => {
          console.error('Payment failed:', err);
          this.processingPayment = false;
          // Handle error (show message to user, etc.)
        }
      });

      this.openPaymentModal(this.selectedPlan);
    }
  }



  //GET PAYMENT STATUS
  intervalId: any;
  paymentsucceDetails: any;
  startPaymentStatusCheck() {
    this.intervalId = setInterval(() => {
      this.manualService.getPaymentStatus(this.externalRef).subscribe((paymentStatus: any) => {
        if (paymentStatus.txStatus === 1) {
          this.paymentsucceDetails = paymentStatus;
          console.log("This is the payment Status ", paymentStatus);
          clearInterval(this.intervalId); // Stop polling on success
          this.loadChecks();
          this.getResultsByUser();
          this.cancelCurrentCheck();
          // this.handlePaymentSuccess();
        } else if (paymentStatus.txStatus === -1) {
          console.log("This is the payment Status ", paymentStatus);

          clearInterval(this.intervalId); // Stop polling on failure
          //  this.handlePaymentFailure();
        }
      });
    }, 3000); // Poll every 3 seconds

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

  selectedPlan: string = '';

  openPaymentModal(subscriptionType: string) {
    this.selectedPlan = subscriptionType;
    this.showPaymentModal = true;
    document.body.style.overflow = 'hidden';
    this.blurService.setBlur(true);
    console.log("The plane chosing is : ", subscriptionType)
    const fixedAmount = subscriptionType === 'PREMIUM' ? 1 : 1; // pick amount based on plan
    // ✅ Update only the relevant fields instead of resetting whole form
    this.paymentForm.patchValue({
      amount: fixedAmount.toFixed(2),
      subscriptionType: this.selectedPlan
    });
    // this.initializeForm(fixedAmount);

  }


  ngOnDestroy() {
    // Clean up when component is destroyed
    this.blurService.setBlur(false);
    document.body.style.overflow = '';
  }




  showOtpModal = false;
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






































































































  otpForm!: FormGroup;
  otpError = '';
  verifyingOTP = false;
  resendCooldown = 0;
  // lastFourDigits = '1234'; // Replace with actual last digits

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




  payee = {
    amount: "",
    channel: "",
    payer: "",
    otpcode: "",
    subscriptionType: ""   // <-- add plan

  }

  verifyOTP() {
    if (this.otpForm.invalid) {
      this.otpError = 'Please enter a valid 6-digit code';
      this.shakeOtpInput(); // Add visual feedback
      return;
    }

    this.verifyingOTP = true;
    this.otpError = '';
    // Combine OTP digits
    const otpValue = Object.values(this.otpForm.value).join('');

    this.payee.amount = this.paymentForm.get('amount')?.value;
    this.payee.channel = this.paymentForm.value.channel;
    this.payee.payer = this.paymentForm.value.payer;
    this.payee.otpcode = otpValue;
    this.payee.subscriptionType = this.selectedPlan; // ✅ include selected plan


    console.log("This is the OTP entered", this.payee);

    console.log("This is the channel : ", this.payee.channel)
    this.manualService.verifyOTP(this.payee).subscribe({
      next: (response) => {
        // Successful OTP verification
        this.handleOtpSuccess(response);
      },
      error: (error) => {
        // Handle verification failure
        this.handleOtpError(error);
      }
    });
    //this.verifyingOTP = false;
    // this.showOtpModal = false; // Uncomment on successful verification
    //this.otpError = 'Invalid verification code'; // Uncomment if verification fails

  }


  private handleOtpError(error: any) {
    this.verifyingOTP = false;

    // Handle different error cases
    if (error.status === 400) {
      this.otpError = 'Invalid OTP code. Please try again.';
      this.shakeOtpInput();
    } else if (error.status === 429) {
      this.otpError = 'Too many attempts. Please wait before trying again.';
    } else {
      this.otpError = 'Verification failed. Please try again later.';
    }

    // Log error for debugging
    console.error('OTP Verification Error:', error);
  }



  // private listenForPaymentConfirmation(referenceId: string) {
  //   // Implementation depends on your webhook/polling mechanism
  //   // This is a conceptual example using a mock service

  //   this.paymentService.listenForPaymentStatus(referenceId).subscribe({
  //     next: (paymentStatus) => {
  //       if (paymentStatus.status === 'SUCCESS') {
  //         this.handlePaymentSuccess(paymentStatus);
  //       } else if (paymentStatus.status === 'FAILED') {
  //         this.handlePaymentFailure(paymentStatus);
  //       }
  //       // Other statuses can be handled as needed
  //     },
  //     error: (err) => {
  //       console.error('Payment status listening error:', err);
  //       this.handlePaymentError();
  //     }
  //   });
  // }


  // private handlePaymentSuccess(paymentStatus: any) {
  //   // Update modal with success state
  //   this.paymentCompleted = true;
  //   this.webhookResponse = paymentStatus;

  //   // Track successful payment
  //   this.analyticsService.trackPaymentSuccess(this.payee.amount);

  //   // Auto-close after delay (optional)
  //   setTimeout(() => {
  //     this.router.navigate(['/payment/success'], {
  //       state: { paymentData: this.paymentStatusData }
  //     });
  //   }, 3000);
  // }

  // private handlePaymentFailure(paymentStatus: any) {
  //   // Update modal with failure state
  //   this.paymentFailed = true;
  //   this.webhookResponse = paymentStatus;

  //   // Show retry option
  //   this.retryAvailable = true;
  // }

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

  private shakeOtpInput() {
    // Add visual feedback for invalid OTP
    const otpContainer = document.querySelector('.otp-container');
    if (otpContainer) {
      otpContainer.classList.add('shake');
      setTimeout(() => {
        otpContainer.classList.remove('shake');
      }, 500);
    }
  }


  paymentStatusData: any;

  // private handlePaymentError() {
  //   // Handle connection/technical errors
  //   this.paymentStatusError = true;
  //   this.webhookResponse = {
  //     message: 'Unable to verify payment status. Please check your transactions later.'
  //   };
  // }


  private handleOtpSuccess(response: any) {
    // Close OTP modal and show payment status modal
    this.showOtpModal = false;
    this.verifyingOTP = false;
    this.showWebHook = true;
    this.startPaymentStatusCheck();
    // Store response data for the payment status modal
    this.paymentStatusData = {
      ...response,
      amount: this.payee.amount // Include amount in the display data
    }
  };

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















  // WEBHOOK STAFF
  amount: number = 0;
  showWebHook = false;

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


  // In your component.ts
  proceedToPaymentConfirmation() {
    this.closeWebhook();
    setTimeout(() => {
      this.paymentConfirmation.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }




  proceed(checkId: string) {
    console.log(checkId);
    if (this.currentCheck?.paymentStatus === 'PAID') {
      this.paymentSuccess = true;
    }
  }











  showNameComparisonModal: boolean = false;

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


  showRemoveConfirmModal = false;

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





  regionOptions: { apiValue: GhanaRegion, display: string }[] = [];
  // biodata = { region: null as GhanaRegion | null }; // Stores enum value


  getAllRegions() {
    this.manualService.getAllRegions().subscribe({
      next: (regions: any) => {
        this.allRegions = regions;
        this.prepareRegionOptions();

        console.log(this.allRegions);
      },
      error: (err) => {
        console.error('Failed to load Colleges:', err);
        // this.snackBar.open('Failed to load Collegesy details', 'Close', {
        //   duration: 3000,
        //   panelClass: ['error-snackbar']
        // });
      }
    })
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

