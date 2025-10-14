import { Component } from '@angular/core';
import { UniversityControllerService } from 'src/app/services/services';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

interface University {
  id: number;
  name: string;
  location: string;
  type: string;
  programs: string[];
}

interface Program {
  id: number;
  name: string;
  cutoffPoints: { [key: string]: string };
}

@Component({
  selector: 'app-all-programs',
  templateUrl: './all-programs.component.html',
  styleUrls: ['./all-programs.component.css']
})
export class AllProgramsComponent {
  selectedType: string = 'ALL';
  universitySearch: string = '';
  programSearch: string = '';
  showUpdateProgramModal: boolean = false;
  programFormSubmitted: boolean = false;
  isUpdating: boolean = false;
  showUpdateSuccess: boolean = false;
  updateError: string = '';
  selectedProgramId: number | null = null;
  currentProgram: any = null;
  isLoading = false;
  isLoadingUniversities = false;
  maxVisiblePrograms = 3;
  showAll: { [universityId: number]: boolean } = {};
  expandedUniversityIds = new Set<number>();
  editSelectedCategories: { [key: number]: boolean } = {};

  universities: University[] = [];
  colleges: { id: number, name: string }[] = [];
  grades: string[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
  
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

  updateProgramForm: FormGroup;

  constructor(
    private unive: UniversityControllerService,
    private manualService: ManaulServiceService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.updateProgramForm = this.fb.group({
      programName: ['', [Validators.required, Validators.minLength(3)]],
      // universityId: ['', Validators.required],
      categoryIds: ['', Validators.required],
      cutoffPoints: this.fb.array([]),
       coreSubjects: this.fb.array([]),
  alternativeSubjects: this.fb.array([])
    });
  }

  ngOnInit() {
    this.allPrograms();
    this.getAllCategories();
  }

  get cutoffPoints(): FormArray {
    return this.updateProgramForm.get('cutoffPoints') as FormArray;
  }


  get coreSubjects(): FormArray {
  return this.updateProgramForm.get('coreSubjects') as FormArray;
}

get alternativeSubjects(): FormArray {
  return this.updateProgramForm.get('alternativeSubjects') as FormArray;
}


showCoreSubjects = false;
showAlternativeSubjects = false;

// toggleCoreSubjects() {
//   this.showCoreSubjects = !this.showCoreSubjects;
// }

// toggleAlternativeSubjects() {
//   this.showAlternativeSubjects = !this.showAlternativeSubjects;
// }


toggleCoreSubjects(program: any) {
  program.showCoreSubjects = !program.showCoreSubjects;
  
  // Close alternative subjects when core is opened
  // if (program.showCoreSubjects) {
  //   program.showAlternativeSubjects = false;
  // }
}

toggleAlternativeSubjects(program: any) {
  program.showAlternativeSubjects = !program.showAlternativeSubjects;
  
  // Close core subjects when alternative is opened
  // if (program.showAlternativeSubjects) {
  //   program.showCoreSubjects = false;
  // }
}


  clearCutoffPoints(): void {
    while (this.cutoffPoints.length !== 0) {
      this.cutoffPoints.removeAt(0);
    }
  }

  populateCutoffPoints(): void {
    if (!this.currentProgram?.cutoffPoints) return;

    Object.entries(this.currentProgram.cutoffPoints).forEach(([subject, grade]) => {
      this.cutoffPoints.push(this.fb.group({
        subject: [subject, Validators.required],
        grade: [grade, Validators.required]
      }));
    });
  }

  addSubject(): void {
    this.cutoffPoints.push(this.fb.group({
      subject: ['', Validators.required],
      grade: ['', Validators.required]
    }));
  }

  removeSubject(index: number): void {
    this.cutoffPoints.removeAt(index);
  }

  openUpdateModal(programId: number): void {
    this.selectedProgramId = programId;
    this.isLoading = true;
    this.manualService.getProgramById(programId).subscribe({
      next: (program) => {
        this.currentProgram = program;

        console.log("This is the current program ", this.currentProgram);
        
        // Initialize the form
        this.updateProgramForm.patchValue({
          programName: this.currentProgram.name,
          // universityId: '', // Set this if available
          categoryIds: this.currentProgram.categories[0]?.id || ''
        });

        this.editSelectedCategories = {};
        if (this.currentProgram.categories) {
          this.currentProgram.categories.forEach((category: any) => {
            this.editSelectedCategories[category.id] = true;
          });
        }


      this.clearFormArray(this.coreSubjects);
      this.populateCoreSubjects();

      this.clearFormArray(this.alternativeSubjects);
      this.populateAlternativeSubjects();

        this.showUpdateProgramModal = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load program:', err);
        this.snackBar.open('Failed to load program details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  closeUpdateModal(): void {
    this.showUpdateProgramModal = false;
  }

  hasSelectedCategories(): boolean {
    return Object.values(this.editSelectedCategories).some(selected => selected);
  }
  // University and program listing methods
  allPrograms() {
    this.isLoadingUniversities =true;
    this.unive.getAllUniversities().subscribe((data: any) => {
      this.universities = data;
          this.isLoadingUniversities =false;
    });
  }

  getAllCategories() {
    this.manualService.getAllCategories().subscribe({
      next: (res: any) => {
        this.colleges = res;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  get filteredUniversities(): University[] {
    return this.universities.filter(u => {
      const matchesType = this.selectedType === 'ALL' || u.type === this.selectedType;
      const matchesUni = !this.universitySearch || 
        u.name.toLowerCase().includes(this.universitySearch.toLowerCase());
      const matchesProgram = !this.programSearch ||
        u.programs?.some((p: any) =>
          typeof p === 'object' &&
          p.name?.toLowerCase().includes(this.programSearch.toLowerCase())
        );
      return matchesType && matchesUni && matchesProgram;
    });
  }

  toggleProgramView(university: any): void {
    if (this.expandedUniversityIds.has(university.id)) {
      this.expandedUniversityIds.delete(university.id);
    } else {
      this.expandedUniversityIds.add(university.id);
    }
  }

  isExpanded(university: any): boolean {
    return this.expandedUniversityIds.has(university.id);
  }

  toggleShowAll(university: any): void {
    this.showAll[university.id] = !this.showAll[university.id];
  }

  getVisiblePrograms(university: any): any[] {
    const showAllPrograms = this.showAll[university.id];
    return showAllPrograms ? university.programs : university.programs.slice(0, this.maxVisiblePrograms);
  }



  getSubjects(subjectMap: { [key: string]: string }): string[] {
  return subjectMap ? Object.keys(subjectMap) : [];
}


  clearFormArray(formArray: FormArray): void {
  while (formArray.length !== 0) {
    formArray.removeAt(0);
  }
}


removeCoreSubject(index: number): void {
  this.coreSubjects.removeAt(index);
}

clearCoreSubjects(): void {
  while (this.coreSubjects.length !== 0) {
    this.coreSubjects.removeAt(0);
  }
}

clearAlternativeSubjects(): void {
  while (this.alternativeSubjects.length !== 0) {
    this.alternativeSubjects.removeAt(0);
  }
}


populateCoreSubjects(): void {
  const coreSubjectsArray = this.updateProgramForm.get('coreSubjects') as FormArray;
  coreSubjectsArray.clear();

  if (this.currentProgram.coreSubjects && typeof this.currentProgram.coreSubjects === 'object') {
    Object.entries(this.currentProgram.coreSubjects).forEach(([subject, grade]) => {
      coreSubjectsArray.push(
        this.fb.group({
          subject: [subject, Validators.required],
          grade: [grade, Validators.required]
        })
      );
    });
  }
}


// Method to add a new core subject row
addCoreSubject(): void {
  this.coreSubjects.push(this.fb.group({
    subject: ['', Validators.required],
    grade: ['', Validators.required]
  }));
}

// Method to add a new alternative subject row
addAlternativeSubject(): void {
  this.alternativeSubjects.push(this.fb.group({
    subject: ['', Validators.required],
    grade: ['', Validators.required]
  }));
}

populateAlternativeSubjects(): void {
  const altSubjectsArray = this.updateProgramForm.get('alternativeSubjects') as FormArray;
  altSubjectsArray.clear();

  if (this.currentProgram.alternativeSubjects && typeof this.currentProgram.alternativeSubjects === 'object') {
    Object.entries(this.currentProgram.alternativeSubjects).forEach(([subject, grade]) => {
      altSubjectsArray.push(
        this.fb.group({
          subject: [subject, Validators.required],
          grade: [grade, Validators.required]
        })
      );
    });
  }
}

private objectToArray(subjectObj: any): any[] {
  if (!subjectObj) return [];
  return Object.keys(subjectObj).map(key => ({
    subject: key,
    grade: subjectObj[key]
  }));
}


  onDeleteProgram(program: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${program.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.manualService.deleteProgram(program.id).subscribe({
          next: () => {
            this.snackBar.open(`"${program.name}" deleted successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.allPrograms();
          },
          error: (err) => {
            this.snackBar.open(`Failed to delete program: ${err.error.message || err.message}`, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }



























































//   // Update the updateProgram method to include core and alternative subjects



updateProgram(): void {
  this.programFormSubmitted = true;
  if (this.updateProgramForm.invalid) {
    this.snackBar.open('Please fill all required fields', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }
  
  const formValue = this.updateProgramForm.value;
  
  // Transform cutoff points array to object
  const cutoffPointsObj = formValue.cutoffPoints.reduce((acc: any, curr: any) => {
    if (curr.subject && curr.grade) {
      acc[curr.subject] = curr.grade;
    }
    return acc;
  }, {});

  // Transform core subjects array to object
  const coreSubjectsObj = formValue.coreSubjects.reduce((acc: any, curr: any) => {
    if (curr.subject && curr.grade) {
      acc[curr.subject] = curr.grade;
    }
    return acc;
  }, {});

  // Transform alternative subjects array to object
  const alternativeSubjectsObj = formValue.alternativeSubjects.reduce((acc: any, curr: any) => {
    if (curr.subject && curr.grade) {
      acc[curr.subject] = curr.grade;
    }
    return acc;
  }, {});

  const payload = {
    programId: this.currentProgram.id,
    name: formValue.programName,
    categoryIds: [{ id: formValue.categoryIds }],
    cutoffPoints: cutoffPointsObj,
    coreSubjects: coreSubjectsObj,
    alternativeSubjects: alternativeSubjectsObj
  };
  
  console.log('Update Payload:', payload);

  this.isUpdating = true;
  this.manualService.updateProgram(payload).subscribe({
    next: () => {
      this.isUpdating = false;
      this.showUpdateSuccess = true;
      this.snackBar.open('Program updated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      setTimeout(() => {
        this.closeUpdateModal();
        this.allPrograms(); // Refresh data
      }, 1500);
    },
    error: (err) => {
      this.isUpdating = false;
      this.updateError = err.error?.message || 'Failed to update program';
      this.snackBar.open(`Update failed: ${this.updateError}`, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}















}