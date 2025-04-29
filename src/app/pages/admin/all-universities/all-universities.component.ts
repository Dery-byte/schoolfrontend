import { Component } from '@angular/core';
import { UniversityControllerService } from 'src/app/services/services';
import { University } from 'src/app/services/models';

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

  constructor(private uni: UniversityControllerService) {}

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
}
