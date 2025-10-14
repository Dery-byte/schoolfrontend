import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UniversityControllerService, ProgramControllerService } from 'src/app/services/services';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';

// Type Definitions
// type ExamBoard = 'WAEC' | 'CTVET' | 'NAPTEX' | 'TEU';

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
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrls: ['./add-courses.component.css']
})
export class AddCoursesComponent implements OnInit {
  // University Program Form
  programForm: FormGroup;
  universities: University[] = [];
  filteredUniversities: University[] = [];
  selectedUniType: string = '';
  grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  // Manual Entry Form
  manualEntryForm!: FormGroup;
  examYears: number[] = Array.from(
    { length: (new Date().getFullYear() - 1999) },
    (_, i) => new Date().getFullYear() - i
  );
  showExamType = false;
  showCTVETOptions = false;
  currentGrades: string[] = [];
  currentSubjects: string[] = [];

  // Data Structures
  subjectDatabase: SubjectDatabase = {
    WAEC: {
      WASSCE_SCHOOL: [
        'ENGLISH LANGUAGE', 'MATHEMATICS (CORE)', 'INTEGRATED SCIENCE',
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

  examTypes: ExamType[] = [
    { id: 1, name: 'WASSCE School Candidate', key: 'WASSCE_SCHOOL' },
    { id: 2, name: 'WASSCE Private Candidate', key: 'WASSCE_PRIVATE' }
  ];

  cTVETOptions = ['NAPTEX', 'TEU'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private unive: UniversityControllerService,
    private prog: ProgramControllerService,
    private snackBar: MatSnackBar,
    private manualService: ManaulServiceService
  ) {
    // Initialize University Program Form
    this.programForm = this.fb.group({
      universityId: ['', Validators.required],
      programName: ['', [Validators.required, Validators.minLength(3)]],
      uniType: ['', Validators.required],
      categoryIds: ['', Validators.required],
      // cutoffPoints: this.fb.array([]),
      coreSubjects: this.fb.array([]),
      alternativeSubjects: this.fb.array([]),
    });

    // Initialize Manual Entry Form
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

  ngOnInit(): void {
    this.allUniversities();
    this.getAllCategories();
    this.initiatOneSelectForm();
  }



  initiatOneSelectForm(){
      this.programForm = this.fb.group({
    universityId: ['', Validators.required],
    programName: ['', Validators.required],
    categoryIds: ['', Validators.required],
    cutoffPoints: this.fb.array([]),
    coreSubjects: this.fb.array([this.createSubjectFormGroup()]),  // ✅ show one by default
    alternativeSubjects: this.fb.array([this.createSubjectFormGroup()])  // ✅ show one by default
  });
  }

createSubjectFormGroup(): FormGroup {
  return this.fb.group({
    subject: ['', Validators.required],
    grade: ['', Validators.required]
  });
}



  // Add/remove handlers
  addCoreSubject() {
    this.coreSubjects.push(this.fb.group({ subject: [''], grade: [''] }));
  }
removeCoreSubject(index: number): void {
  if (this.coreSubjects.length > 1) {
    this.coreSubjects.removeAt(index);
  } else {
    alert('You must have at least one core subject.');
  }
}

  addAlternativeSubject() {
    this.alternativeSubjects.push(this.fb.group({ subject: [''], grade: [''] }));
  }

removeAlternativeSubject(index: number): void {
  const controls = this.alternativeSubjects;
  if (controls.length > 1) {
    controls.removeAt(index);
  } else {
    alert('You must have at least one alternative subject.');
  }
}

  addCutoffPoint() {
    this.cutoffPoints.push(this.fb.group({ subject: [''], grade: [''] }));
  }
  removeCutoffPoint(i: number) {
    this.cutoffPoints.removeAt(i);
  }

  get coreSubjects() {
    return this.programForm.get('coreSubjects') as FormArray;
  }
  get alternativeSubjects() {
    return this.programForm.get('alternativeSubjects') as FormArray;
  }
  // get cutoffPoints() {
  //   return this.programForm.get('cutoffPoints') as FormArray;
  // }
  // University Methods
  allUniversities() {
    this.unive.getAllUniversities().subscribe((data: any) => {
      this.universities = data;
      this.filteredUniversities = data;
    });
  }

  filterUniversities() {
    if (!this.selectedUniType) {
      this.filteredUniversities = this.universities;
    } else {
      this.filteredUniversities = this.universities.filter(
        uni => uni.type.toUpperCase() === this.selectedUniType.toUpperCase()
      );
    }
  }

  get cutoffPoints(): FormArray {
    return this.programForm.get('cutoffPoints') as FormArray;
  }

  addSubject() {
    this.cutoffPoints.push(
      this.fb.group({
        subject: ['', Validators.required],
        grade: ['', Validators.required]
      })
    );
  }

  removeSubject(index: number) {
    this.cutoffPoints.removeAt(index);
  }




  // submitForm() {
  //   if (this.programForm.invalid) {
  //     this.programForm.markAllAsTouched();
  //     return;
  //   }

  
  //   const formData = this.programForm.value;

  //   const payload = {
  //     universityId: Number(formData.universityId),
  //     programs: [
  //       {
  //         name: formData.programName,
  //         cutoffPoints: formData.cutoffPoints.reduce((obj: any, curr: any) => {
  //           if (curr.subject && curr.grade) {
  //             obj[curr.subject] = curr.grade;
  //           }
  //           return obj;
  //         }, {}),
  //         categoryIds: [
  //           { id: Number(formData.categoryIds) }  // Changed to match Insomnia structure
  //         ]
  //       }
  //     ]
  //   };


  //   console.log(payload);
  //   this.prog.addProgramToUniversity({ body: payload }).subscribe({
  //     next: (res) => {
  //       this.snackBar.open(`${formData.programName} has been added!`, 'Close', {
  //         duration: 3000,
  //         panelClass: ['snackbar-success']
  //       });
  //       this.programForm.reset();
  //     },
  //     error: (err) => {
  //       this.snackBar.open('Failed to add program. Please try again.', 'Close', {
  //         duration: 3000,
  //         panelClass: ['snackbar-error']
  //       });
  //     }
  //   });
  // }






  submitForm() {
  if (this.programForm.invalid) {
    this.programForm.markAllAsTouched();
    return;
  }

  const formData = this.programForm.value;

  // --- Helper function to convert subject-grade pairs into an object ---
  const toSubjectGradeMap = (arr: any[]) =>
    arr.reduce((obj: any, curr: any) => {
      if (curr.subject && curr.grade) {
        obj[curr.subject] = curr.grade;
      }
      return obj;
    }, {});

  // --- Construct payload ---
  const payload = {
    universityId: Number(formData.universityId),
    programs: [
      {
        name: formData.programName,
        // cutoffPoints: toSubjectGradeMap(formData.cutoffPoints),
        coreSubjects: toSubjectGradeMap(formData.coreSubjects),
        alternativeSubjects: toSubjectGradeMap(formData.alternativeSubjects),
        categoryIds: [
          { id: Number(formData.categoryIds) } // matches backend DTO structure
        ]
      }
    ]
  };

  console.log('Payload being sent:', payload);

  // --- Send payload to backend ---
  this.prog.addProgramToUniversity({ body: payload }).subscribe({
    next: (res) => {
      this.snackBar.open(`${formData.programName} has been added!`, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.programForm.reset();
    },
    error: (err) => {
      console.error('Add Program Error:', err);
      this.snackBar.open('Failed to add program. Please try again.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  });
}


  objectKeys = Object.keys;

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.availableSubjects = this.categories[category] || [];

    // Reset cutoff points
    this.cutoffPoints.clear();
    this.addSubject(); // add initial input if needed
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
    this.showCTVETOptions = examBoard === 'CTVET';
    this.manualEntryForm.get('examType')?.reset();
    this.manualEntryForm.get('cTVETExamType')?.reset();
    this.currentGrades = [];
    this.currentSubjects = [];

    if (examBoard === 'WAEC') {
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











  // cat:any;

  colleges: { id: number, name: string }[] = [
    // { "id": 1, "name": "Engineering" }, 
    // { "id": 2, "name": "Social Sciences" }
  ];
  getAllCategories() {
    this.manualService.getAllCategories().subscribe({
      next: (res: any) => {
        this.colleges = res;
      },
      error: (err) => {
      }
    });
  }

  // categoryError: string = '';
  // isSubmitted: boolean = false;
  //   // Call this when submitting your form
  // validateCategory(): boolean {
  //   if (!this.categoryId) { // Assuming you store the selected category ID
  //     this.categoryError = 'Please select a category';
  //     this.isSubmitted = true;
  //     return false;
  //   }
  //   return true;
  // }


}