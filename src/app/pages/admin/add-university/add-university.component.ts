import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniversityControllerService } from 'src/app/services/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WaecControllersService } from 'src/app/services/services';

import { EligibilityControllerService } from 'src/app/services/services';

@Component({
  selector: 'app-add-university',
  templateUrl: './add-university.component.html',
  styleUrls: ['./add-university.component.css']
})
export class AddUniversityComponent {
  
  addUniForm!: FormGroup;

  constructor(private fb: FormBuilder,
    private unive: UniversityControllerService,
    private snackBar: MatSnackBar,
    private waec: WaecControllersService,
    private elig:EligibilityControllerService
  ) {}

  categories = ['PUBLIC', 'PRIVATE'];

  ngOnInit(): void {
    this.addUniForm = this.fb.group({
      universityName: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      // price: [null, Validators.required],
      // quantity: [null, Validators.required],
      // farmId: ['', Validators.required],
      // imageUrl: [null]
    });

    this.initForm();
    this.loadresults();
  }




  
  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.productForm.patchValue({ imageUrl: file });
  //   }
  // }

  submitForm() {
    if (this.addUniForm.valid) {
      const payload = [{
        name: this.addUniForm.value.universityName,
        location: this.addUniForm.value.location,
        type: this.addUniForm.value.category
      }];

      console.log('Submitting:', payload);
      const universityName = this.addUniForm.get('universityName')?.value;
      // Call your service to send this data to the backend
      this.unive.addUniversity({ body:payload}).subscribe({
        next: (res) => {
          console.log('Success:', res); // ← Make sure this logs
          this.snackBar.open(`${universityName} added!`, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'] // optional CSS styling
          });
          this.addUniForm.reset();
        },
        error: (err) => {
          console.error('Error:', err); // ← See if any error shows
          this.snackBar.open('Failed to add university. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'] // optional CSS styling
          });
        }
      });
      
    } else {
      console.log('Form is invalid');
      this.addUniForm.markAllAsTouched();
    }
  }
  





























































  // GET RESULTS

  examYears: number[] = Array.from(
    {length: (new Date().getFullYear() - 1999)}, 
    (_, i) => new Date().getFullYear() - i
  );
   // Initialize your form
  // Class property declaration
examForm!: FormGroup;

initForm() {
  this.examForm = this.fb.group({
    examYear: ['', Validators.required],
    examType: ['', Validators.required],
    indexNumber: ['', Validators.required]
    // other form controls...
  });
}
waecresults:any;
  examTypes = {
    '1': 'WASSCE School Candidate',
    '2': 'WASSCE Private Candidate',
    '3': 'GBCE Candidate',
    '4': 'ABCE Candidate'
  };
 // Convert to array for the template
 goups = Object.entries(this.examTypes).map(([key, value]) => ({
  id: key,
  name: value
}));

getExamType(examtype: number): string {
  const examTypes: Record<number, string> = {
    1: "WASSCE School Candidate",
    2: "WASSCE Private Candidate",
    3: "Nov/Dec",
    4: "BECE"
  };
  return examTypes[examtype] || 'Unknown';
}

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



candidate:any;
eligible:any;
loadresults(){
  this.candidate =  JSON.parse(localStorage.getItem("candidate") || '{}'); // Adjust as per your data storage
}

submitCandidate() {
  
  console.log('Candidate submitted:', this.candidate);

  this.elig.checkEligibility({body:this.candidate}).subscribe((data)=>{
    this.eligible=data;
    console.log(this.eligible);
  });
  // Send data to backend or handle it here
}

getProbabilityClass(probability: number): string {
  if (probability >= 0.8) return 'high';
  if (probability >= 0.5) return 'medium';
  if (probability > 0.1) return 'low';
  return 'very-low';
}
getSubjects(cutoffPoints: any): string[] {
  return Object.keys(cutoffPoints);
}
hasCutoffPoints(cutoffPoints: any): boolean {
  return cutoffPoints && Object.keys(cutoffPoints).length > 0;
}

}
