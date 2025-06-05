import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { UniversityControllerService } from 'src/app/services/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaecControllersService } from 'src/app/services/services';
import { EligibilityControllerService } from 'src/app/services/services';





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



@Component({
  selector: 'app-user-check-results',
  templateUrl: './user-check-results.component.html',
  styleUrls: ['./user-check-results.component.css']
})
export class UserCheckResultsComponent {


  constructor(private fb: FormBuilder,
    private unive: UniversityControllerService,
    private snackBar: MatSnackBar,
    private waec: WaecControllersService,
    private elig:EligibilityControllerService
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
  }
  examBoards = ['WAEC', 'CTVET'];


  // categories = ['PUBLIC', 'PRIVATE'];

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
    // const subjectcode = this.subjectCodeMap[entry.subject] || 'UNK000';
    // const interpretation = this.interpretationMap[entry.grade] || 'Unknown';

    return {
      // subjectcode,
      subject: entry.subject,
      grade: entry.grade,
      // interpretation
    };
  });

  console.log('Formatted Response:', response);
}

entryForm: FormGroup;
entries: any[] = [];
// examYears = [2024, 2023, 2022]; // Example years

  availableExamTypes: string[] = [];


// addEntry() {
//   if (this.entryForm.invalid) {
//     this.entryForm.markAllAsTouched();
//     return;
//   }

//   this.entries.push({ ...this.entryForm.value });
//   this.entryForm.reset();
// }

// removeEntry(index: number) {
//   this.entries.splice(index, 1);
// }

submitResults() {
  if (this.entries.length === 0) {
    alert('No entries to submit.');
    return;
  }

  console.log('Submitting:', this.entries);
  // Submit this.entries to your backend or service here
}

 
  ngOnInit(): void {
    this.initForm();
    this.manualForm();
  }
    // GET RESULTS
  
    examYears: number[] = Array.from(
      {length: (new Date().getFullYear() - 1999)}, 
      (_, i) => new Date().getFullYear() - i
    );
     // Initialize your form
    // Class property declaration
  examForm!: FormGroup;
  manualEntryForm!: FormGroup;

  
  initForm() {
    this.examForm = this.fb.group({
      examYear: ['', Validators.required],
      examType: ['', Validators.required],
      indexNumber: ['', Validators.required]
      // other form controls...
    });
  }
  waecresults:any;
   
    getExamType(examtype: number): string {
      const examTypes: Record<number, string> = {
        1: "WASSCE School Candidate",
        2: "WASSCE Private Candidate",
        3: "Nov/Dec",
        4: "BECE"
      };
      return examTypes[examtype] || 'Unknown';
    }

    examTypes: ExamType[] = [
      { id: 1, name: 'WASSCE School Candidate', key: 'WASSCE_SCHOOL' },
      { id: 2, name: 'WASSCE Private Candidate', key: 'WASSCE_PRIVATE' }
    ];

    groups = this.examTypes;
 // Convert to array for the template
 goups = Object.entries(this.examTypes).map(([key, value]) => ({
  id: key,
  name: value
}));


 
  
  submitFormCheck() {
    if (this.examForm.valid) {
      // console.log("✅ Form submitted!", this.examForm.value);
      const requestPayload = {
        cindex: this.examForm.value.indexNumber,
        examyear: this.examForm.value.examYear,
        examtype: this.examForm.value.examType
      };
  
  
      this.waec.verifyWaecResult({body:requestPayload}).subscribe({
        next: (res) => {
          this.waecresults=res;
          localStorage.setItem("candidate",JSON.stringify(this.waecresults));
          console.log('Success:', res); // ← Make sure this logs
          // this.snackBar.open(`added!`, 'Close', {
          //   duration: 3000,
          //   panelClass: ['snackbar-success'] // optional CSS styling
          // });
          this.examForm.reset();
        },
        error: (err) => {
          console.error('Error:', err); // ← See if any error shows
          // this.snackBar.open('Failed to add university. Please try again.', 'Close', {
          //   duration: 3000,
          //   panelClass: ['snackbar-error'] // optional CSS styling
          // });
        }
      });
  console.log(requestPayload);    
      // You can now send this data to your backend
    } else {
      console.log("❌ Form is invalid.");
      this.examForm.markAllAsTouched(); // Show validation messages
    }
  }
  
  







  
    grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  
    showExamType = false;
    showCTVETOptions = false;
    currentGrades: string[] = [];
    currentSubjects: string[] = [];
  
    // Data Structures
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
  
    
  
      // Initialize Manual Entry Form
manualForm(){  
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
  
  
  
 
  
  
  
 
  
  
    objectKeys = Object.keys;
  
    onCategoryChange(event: Event): void {
      const selectElement = event.target as HTMLSelectElement;
      const category = selectElement.value;
      this.availableSubjects = this.categories[category] || [];
    
      // add initial input if needed
    }
  
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
      // this.examTypes = [];
      this.showCTVETOptions = examBoard === 'CTVET';
      this.manualEntryForm.get('examType')?.reset();
      this.manualEntryForm.get('cTVETExamType')?.reset();
      this.currentGrades = [];
      this.currentSubjects = [];

  
      if (examBoard === 'WAEC') {
        this.examTypes = this.examTypes;
        // WAEC specific logic remains the same
      } else if (examBoard === 'CTVET') {
        // CTVET selected, but we need to wait for NAPTEX/TEU selection
      } else if (examBoard === 'NAPTEX') {
        this.currentSubjects = this.subjectDatabase.CTVET.NAPTEX;
        this.currentGrades = this.gradeOptions.NAPTEX;
      } else if (examBoard === 'TEU') {
        this.currentSubjects = this.subjectDatabase.CTVET.TEU;
        this.currentGrades = this.gradeOptions.TEU;
      }

      
      // Clear existing result details
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
      
      // Clear existing result details and add one empty row
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
      
      // Clear existing result details and add one empty row
      while (this.resultsDetails.length !== 0) {
        this.resultsDetails.removeAt(0);
      }
      this.addSubjects();
    }
  
    submitFormManu() {
      if (this.manualEntryForm.valid) {
        console.log('Form submitted:', this.manualEntryForm.value);
        // Add your API call here
      } else {
        this.manualEntryForm.markAllAsTouched();
      }
    }


}
