import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-colleges',
  templateUrl: './colleges.component.html',
  styleUrls: ['./colleges.component.css']
})
export class CollegesComponent implements OnInit {
  // Forms
  collegeForm: FormGroup;
  editCollegeForm: FormGroup;
  
  // Data
  colleges: { id: number, name: string, description: string }[] = [];
  filteredColleges: { id: number, name: string, description: string }[] = [];
  
  // UI Controls
  searchText: string = '';
  showEditCollegeModal: boolean = false;
  isUpdating: boolean = false;
  selectedCollege: any;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private manualService: ManaulServiceService,
    private snackBar: MatSnackBar
  ) {
    // Initialize forms in constructor
    this.collegeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['',Validators.required]
    });

    this.editCollegeForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['',Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllCategories(); // Load data immediately
  }

  // Load all categories from API
  getAllCategories(): void {
    this.isLoading = true;
    this.manualService.getAllCategories().subscribe({
      next: (res: any) => {
        this.colleges = res;
            this.isLoading = false;

        this.filteredColleges = [...this.colleges]; // Initialize filtered list
      },
      error: (err) => {
            this.isLoading = false;

        this.snackBar.open('Failed to load categories', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  // Submit new college form
  submitCollegeForm(): void {
    if (this.collegeForm.valid) {
      const collegeData = {
        name: this.collegeForm.value.name,
        description: this.collegeForm.value.description,
      };

      this.manualService.addCollege(collegeData).subscribe({
        next: (res) => {
          this.snackBar.open(`${collegeData.name} added successfully!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.collegeForm.reset();
          this.getAllCategories(); // Refresh the list
        },
        error: (err) => {
          this.snackBar.open('Failed to add college', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  // Filter colleges based on search text
  filterColleges(): void {
    if (!this.searchText) {
      this.filteredColleges = [...this.colleges];
      return;
    }
    
    const searchTerm = this.searchText.toLowerCase();
    this.filteredColleges = this.colleges.filter(college => 
      college.name.toLowerCase().includes(searchTerm) || 
      (college.description && college.description.toLowerCase().includes(searchTerm))
    );
  }

  // College CRUD operations
  openEditCollegeModal(college: any): void {
    this.selectedCollege = college;
    this.editCollegeForm.patchValue({
      id: college.id,
      name: college.name,
      description: college.description || ''
    });
    this.showEditCollegeModal = true;
  }

  closeEditCollegeModal(): void {
    this.showEditCollegeModal = false;
    this.editCollegeForm.reset();
    this.selectedCollege = null;
  }

  updateCollege(): void {
    if (this.editCollegeForm.invalid) {
      this.editCollegeForm.markAllAsTouched();
      return;
    }
    this.isUpdating = true;
    const updatedCollege = this.editCollegeForm.value;
    console.log(updatedCollege);
    this.manualService.updateCollege(updatedCollege).subscribe({
      next: (res) => {
        const index = this.colleges.findIndex(c => c.id === updatedCollege.id);
        if (index !== -1) {
          this.colleges[index] = updatedCollege;
          this.filterColleges();
        }
        this.snackBar.open('College updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.isUpdating = false;
        this.closeEditCollegeModal();
      },
      error: (err) => {
        this.snackBar.open('Failed to update college', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isUpdating = false;
      }
    });
  }










onDeleteCollege(college: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${college.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.manualService.deleteCollege(college.id).subscribe({
          next: (res) => {
            this.colleges = this.colleges.filter(c => c.id !== college.id);
            this.filterColleges();
            this.snackBar.open('College deleted successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            Swal.fire(
              'Error!',
              'Failed to delete college.',
              'error'
            );
            
            this.snackBar.open('Failed to delete college', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }


  addNewCollege(): void {
    this.editCollegeForm.reset({
      id: null,
      name: '',
      description: ''
    });
    this.selectedCollege = null;
    this.showEditCollegeModal = true;
  }
}