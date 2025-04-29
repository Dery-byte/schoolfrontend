import { Component } from '@angular/core';
import { UniversityControllerService } from 'src/app/services/services';


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

  universities: University[] = [
    // { id: 1, name: 'University of Ghana', location: 'Legon, Accra, Ghana', type: 'PUBLIC', programs: ['Law', 'Engineering'] },
    // { id: 2, name: 'Ashesi University', location: 'Berekuso, Ghana', type: 'PRIVATE', programs: [] },
    // { id: 3, name: 'Kwame Nkrumah University of Science and Technology', location: 'Kumasi, Ghana', type: 'PUBLIC', programs: ['Computer Science', 'Physics','Law', 'Engineering', 'Mathematics','Statistic'] },
  ];


  constructor(private unive:UniversityControllerService){

  }

  ngOnInit(){
this.allPrograms();
  }


  allPrograms(){
    this.unive.getAllUniversities().subscribe((data:any)=>{
this.universities=data;
console.log(this.universities);
    });
  }

  // get filteredUniversities(): University[] {
  //   if (this.selectedType === 'ALL') {
  //     return this.universities;
  //   }
  //   return this.universities.filter(u => u.type === this.selectedType);
  // }

  // onTypeChange(event: any) {
  //   this.selectedType = event.target.value;
  // }

  get filteredUniversities(): University[] {
    return this.universities.filter(u => {
      const matchesType =
        this.selectedType === 'ALL' || u.type === this.selectedType;
  
      const matchesUni =
        !this.universitySearch ||
        u.name.toLowerCase().includes(this.universitySearch.toLowerCase());
  
      const matchesProgram =
        !this.programSearch ||
        u.programs?.some(
          (p: any) =>
            typeof p === 'object' &&
            p.name?.toLowerCase().includes(this.programSearch.toLowerCase())
        );
  
      return matchesType && matchesUni && matchesProgram;
    });
  }
  
  




  expandedUniversityIds = new Set<number>();

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



maxVisiblePrograms = 3;
showAll: { [universityId: number]: boolean } = {};



toggleShowAll(university: any): void {
  this.showAll[university.id] = !this.showAll[university.id];
}

getSubjects(program: any): string[] {
  return Object.keys(program.cutoffPoints || {});
}


getVisiblePrograms(university: any): any[] {
  const showAllPrograms = this.showAll[university.id];
  return showAllPrograms ? university.programs : university.programs.slice(0, this.maxVisiblePrograms);
}



onEditProgram(university: any, program: any): void {
  console.log('Edit Program:', program.name);
  // Add your edit logic
}

onDeleteProgram(university: any, program: any): void {
  const index = university.programs.findIndex((p: any) => p.id === program.id);
  if (index !== -1) {
    university.programs.splice(index, 1);
  }
}



// selectedType: string = 'ALL';
universitySearch: string = '';
programSearch: string = '';
// filteredUniversities: any[] = [];

}
