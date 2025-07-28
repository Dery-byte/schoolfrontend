import { Component } from '@angular/core';
import { UniversityControllerService } from 'src/app/services/services';
import { University } from 'src/app/services/models';
import { ManaulServiceService } from 'src/app/Utilities/manaul-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// interface University {
//   name: string;
//   type: string; // e.g., 'Private', 'Public', etc.
//   location: string;
//   // add other relevant fields if needed
// }

@Component({
  selector: 'app-all-universities',
  templateUrl: './all-universities.component.html',
  styleUrls: ['./all-universities.component.css'],
})
export class AllUniversitiesComponent {
  // universities = [
  // { id: 1, name: 'University of Ghana', location: 'Legon, Accra, Ghana', type: 'PUBLIC' },
  // { id: 2, name: 'Kwame Nkrumah University of Science and Technology', location: 'Kumasi, Ghana', type: 'PUBLIC' },
  // { id: 3, name: 'University of Cape Coast', location: 'Cape Coast, Ghana', type: 'PUBLIC' },
  // { id: 4, name: 'University for Development Studies', location: 'Tamale, Ghana', type: 'PUBLIC' },
  // { id: 5, name: 'University of Education, Winneba', location: 'Winneba, Ghana', type: 'PUBLIC' },
  // { id: 6, name: 'Ashesi University', location: 'Berekuso, Eastern Region, Ghana', type: 'PRIVATE' },
  // { id: 7, name: 'Ghana Institute of Management and Public Administration', location: 'Accra, Ghana', type: 'PUBLIC' },
  // { id: 8, name: 'University of Energy and Natural Resources', location: 'Sunyani, Ghana', type: 'PUBLIC' },
  // { id: 9, name: 'Accra Institute of Technology', location: 'Accra, Ghana', type: 'PRIVATE' },
  // { id: 10, name: 'Central University', location: 'Miotso near Dawhenya, Ghana', type: 'PRIVATE' },
  // { id: 11, name: 'Presbyterian University, Ghana', location: 'Abetifi-Kwahu, Ghana', type: 'PRIVATE' },
  // { id: 12, name: 'Pentecost University', location: 'Sowutuom, Accra, Ghana', type: 'PRIVATE' },
  // { id: 13, name: 'Valley View University', location: 'Oyibi, Accra, Ghana', type: 'PRIVATE' },
  // { id: 14, name: 'Koforidua Technical University', location: 'Koforidua, Eastern Region, Ghana', type: 'PUBLIC' },
  // { id: 15, name: 'Takoradi Technical University', location: 'Takoradi, Western Region, Ghana', type: 'PUBLIC' },
  // { id: 16, name: 'Tamale Technical University', location: 'Tamale, Northern Region, Ghana', type: 'PUBLIC' },
  // { id: 17, name: 'Ho Technical University', location: 'Ho, Volta Region, Ghana', type: 'PUBLIC' },
  // { id: 18, name: 'Sunyani Technical University', location: 'Sunyani, Bono Region, Ghana', type: 'PUBLIC' },
  // { id: 19, name: 'Bolgatanga Technical University', location: 'Bolgatanga, Upper East Region, Ghana', type: 'PUBLIC' },
  // { id: 20, name: 'Cape Coast Technical University', location: 'Cape Coast, Central Region, Ghana', type: 'PUBLIC' }
  // ];

  // filteredUniversities = this.universities;

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
        this.snackBar.open('Failed to load program details', 'Close', {
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
isUpdating=false;



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
  // this.unive.updateUniversity(payload).subscribe({
  //   next: () => {
  //     this.isUpdating = false;
  //     this.snackBar.open('University updated successfully!', 'Close', {
  //       duration: 3000,
  //       panelClass: ['success-snackbar']
  //     });
  //     this.closeEditUniversityModal();
  //     this.allUniversity(); // Refresh data
  //   },
  //   error: (err) => {
  //     this.isUpdating = false;
  //     this.snackBar.open(`Update failed: ${err.error?.message || err.message}`, 'Close', {
  //       duration: 5000,
  //       panelClass: ['error-snackbar']
  //     });
  //   }
  // });
}
}
