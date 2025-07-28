import { Component } from '@angular/core';
import { UniversityControllerService } from 'src/app/services/services';
import { University } from 'src/app/services/models';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
@Component({
  selector: 'app-all-universities',
  templateUrl: './all-universities.component.html',
  styleUrls: ['./all-universities.component.css'],
})
export class AllUniversitiesComponent {
  selectedType = 'ALL';
  universities: University[] = [];
  filteredUniversities: University[] = [];




  constructor(private fb: FormBuilder,
    private manualService: ManaulServiceService,
    private snackBar: MatSnackBar,
    private uni: UniversityControllerService/* other dependencies */) {
    this.editUniversityForm = this.fb.group({
      universityName: ['', Validators.required],
      category: ['', Validators.required],
      location: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.allUniversity();
  }

  allUniversity() {
    this.uni.getAllUniversities().subscribe((data) => {
      this.universities = data;
      this.filterUniversities();
    });
  }
  filterUniversities(): void {
    if (this.selectedType === 'ALL') {
      this.filteredUniversities = this.universities;
    } else {
      this.filteredUniversities = this.universities.filter(
        (university) => university.type === this.selectedType
      );
    }
  }

  onTypeChange(event: any): void {
    this.selectedType = event.target.value;
    this.filterUniversities();
  }

  editUniversity(university: any) {
    // Handle the logic to edit the university
    console.log('Editing university:', university);
  }

  removeUniversity(university: any) {
    // Handle the logic to remove the university
    console.log('Removing university:', university);
  }

  // Add these properties to your component
  showEditUniversityModal = false;
  editUniversityData: any = null;
  categories: string[] = ['PUBLIC', 'PRIVATE']; // Add your university categories

  // University Form
  editUniversityForm: FormGroup;

  // Initialize the form in constructor

  selectedUniversityId: number | null = null;

  // Add these methods
  openEditUniversityModal(universityid: number): void {
    this.selectedUniversityId = universityid;
    this.manualService.getUniversityById(this.selectedUniversityId).subscribe({
      next: (universities) => {
        this.editUniversityData = universities;
        this.editUniversityData = universities;
        this.editUniversityForm.patchValue({
          universityName: this.editUniversityData.name,
          category: this.editUniversityData.type,
          location: this.editUniversityData.location
        });
        this.showEditUniversityModal = true;
      },
      error: (err) => {
        console.error('Failed to load program:', err);
        this.snackBar.open('Failed to load University details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.showEditUniversityModal = false;
      }
    });
  }

  closeEditUniversityModal(): void {
    this.showEditUniversityModal = false;
  }
  isUpdating = false;



  updateUniversity(): void {
    if (this.editUniversityForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const formValue = this.editUniversityForm.value;
    const payload = {
      id: this.editUniversityData.id,
      name: formValue.universityName,
      type: formValue.category,
      location: formValue.location
    };

    this.isUpdating = true;
    this.manualService.updateUniverity(payload).subscribe({
      next: () => {
        this.isUpdating = false;
        this.snackBar.open('University updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeEditUniversityModal();
        this.allUniversity(); // Refresh data
      },
      error: (err) => {
        this.isUpdating = false;
        this.snackBar.open(`Update failed: ${err.error?.message || err.message}`, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }



  onDeleteUniversity(university: any): void {
    console.log(university.id);
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${university.name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.manualService.deleteUniversity(university.id).subscribe({
          next: () => {
            this.snackBar.open(`"${university.name}" deleted successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.allUniversity();
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
}
