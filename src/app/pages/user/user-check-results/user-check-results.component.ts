import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UniversityControllerService } from 'src/app/services/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaecControllersService } from 'src/app/services/services';
import { EligibilityControllerService } from 'src/app/services/services';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

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
  // Payment and Check Management
  paymentSuccess = false;
  currentCheck: EligibilityCheck | null = null;
  userChecks: EligibilityCheck[] = [];
  newCheckForm: FormGroup;

  // Existing properties
  examBoards = ['WAEC', 'CTVET'];
  availableExamTypes: string[] = [];
  entryForm: FormGroup;
  entries: any[] = [];
  examYears: number[] = Array.from(
    {length: (new Date().getFullYear() - 1999)}, 
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
    private elig: EligibilityControllerService
  ) {
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
  }

  ngOnInit(): void {
    this.initForm();
    this.manualForm();
    this.loadChecks();
  }

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

  simulatePayment() {
    if (this.currentCheck) {
      this.currentCheck.paymentStatus = 'paid';
      this.currentCheck.checkStatus = 'in_progress';
      this.currentCheck.lastUpdated = new Date();
      this.saveChecks();
      this.paymentSuccess = true;
    }
  }

  resumeCheck(checkId: string) {
    this.currentCheck = this.userChecks.find(c => c.id === checkId) || null;
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

  submitFormCheck() {
    if (this.examForm.valid) {
        this.isLoading = true;

      const requestPayload = {
        cindex: this.examForm.value.indexNumber,
        examyear: this.examForm.value.examYear,
        examtype: this.examForm.value.examType
      };
  
      console.log(requestPayload);
      this.waec.verifyWaecResult({body: requestPayload}).subscribe({
        next: (res) => {
          this.waecresults = res;
                this.isLoading = false;

          localStorage.setItem("candidate", JSON.stringify(this.waecresults));
          console.log('Success:', res);
          this.examForm.reset();
          
          // Mark check as completed if payment was made
          if (this.currentCheck) {
            this.currentCheck.result = res;
            this.currentCheck.checkStatus = 'completed';
            this.saveChecks();
          }
        },
        error: (err) => {
                this.isLoading = false;

          console.error('Error:', err);
        }
      });
    } else {
      this.examForm.markAllAsTouched();
    }
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







}