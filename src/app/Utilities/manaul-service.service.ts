import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse } from '@angular/common/http';
import baseUrl from './helper';
import { Observable } from 'rxjs';

interface ApiCategory {
  id: number;
  name: string;
}



@Injectable({
  providedIn: 'root'
})
export class ManaulServiceService {

  constructor(private http: HttpClient) { }

   checkEligibility(payload: any) {
        const token = localStorage.getItem('token'); // Retrieve token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
    return this.http.post(`${baseUrl}/auth/check-eligibilityAll`, payload, 
    { headers }

  )};

//   checkEligibility(candidate: any, recordId: string) {
//     const token = localStorage.getItem('token'); // Retrieve token
//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });
//   return this.http.post(
//     `${baseUrl}/auth/check-eligibilityAll?recordId=${recordId}`,
//     candidate,
//     { headers }
//   );
// }





  // GETTING STARTED

  // startFirstStep() {
  //   const token = localStorage.getItem('token'); // Retrieve token
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`, // Ensure correct format
  //     // 'Content-Type': 'application/json' // Specify JSON content
  //   });
  //   return this.http.post(`${baseUrl}/auth/records/createCheckRecords`, {
  //     headers: headers,
  //   });
  // }

startFirstStep() {
  const token = localStorage.getItem('token'); // Retrieve token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  // Actual request body
  const body = {
    checkStatus: "not_started",
    // createdAt: new Date().toISOString(),
    // lastUpdated: new Date().toISOString()
  };

  return this.http.post(`${baseUrl}/auth/records/createCheckRecords`, body, { headers });
}

  startSecondStep(recordId: number, paymentStatus: any) {
    const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Ensure correct format
      // 'Content-Type': 'application/json' // Specify JSON content
    });
    // const payload = { status: newStatus }; // Or any other structure your backend expects
    return this.http.patch(
      `${baseUrl}/auth/records/${recordId}/paymentStatus`,
      paymentStatus
    );
  }


   startThirdStep(recordId: number,payload: any) {
    const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Ensure correct format
      // 'Content-Type': 'application/json' // Specify JSON content
    });
    // const payload = { status: newStatus }; // Or any other structure your backend expects
    return this.http.patch(
      `${baseUrl}/auth/records/${recordId}/candidate`,
      payload
    );
  }



     getAllRecordsByUserID() {
    // const payload = { status: newStatus }; // Or any other structure your backend expects
       const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Ensure correct format
      // 'Content-Type': 'application/json' // Specify JSON content
    });
    return this.http.get(
      `${baseUrl}/auth/records/RecordsByUserId`,{
              headers: headers,
      }
    );
  }


  


  
//  initializePayment(payload:any) {
//   const token = localStorage.getItem('token'); // Retrieve token
//   const headers = new HttpHeaders({
//     Authorization: `Bearer ${token}`
//   });
//   return this.http.post(`${baseUrl}/auth/payments/initiate`, payload, { headers });
// }

 // Option 2: Include recordId in the payload (recommended)
 initializePayment(payload: any, recordId?: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
let params = new HttpParams();
 if (recordId) {
    params = params.set('recordId', recordId);
  }
    return this.http.post(`${baseUrl}/auth/payments/initiate`, payload, { 
      headers,
      params 
    });
  }


 

 verifyOTP(payload:any) {
  const token = localStorage.getItem('token'); // Retrieve token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
        //'ngrok-skip-browser-warning': 'true',

    'Content-Type': 'application/json' // Specify JSON content

  });
  return this.http.post(`${baseUrl}/auth/payments/verify-otp`, payload, { headers });
}


getPaymentStatus(externalRef: String){
    const headers = new HttpHeaders({
      //  'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json' // Specify JSON content
  });
    return this.http.get(
      `${baseUrl}/auth/payments/payment-status/${externalRef}`,
          { headers });
}




 eligibilityRecordsByUser() {
  const token = localStorage.getItem('token'); // Retrieve token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json' // Specify JSON content
  });
  return this.http.get(`${baseUrl}/auth/eligibilityRecords/my-eligibility-records`, { headers });
}










resetPassword(token: string, newPassword: string): Observable<any> {
  return this.http.post(`${baseUrl}/auth/update-password`, { token, newPassword });
}
requestPasswordReset(email: any): Observable<any> {
  return this.http.post(`${baseUrl}/auth/forgotten-password`, { email });
}


  // getAllCategories(): Observable<ApiCategory[]> {
  //   return this.http.get<ApiCategory[]>(`${baseUrl}/auth/categories/getAll`);
  // }

    getAllCategories() {
    return this.http.get(`${baseUrl}/auth/categories/getAll`);
  }

deleteProgram(programId: number) {
  const payload = { programId }; // This creates { programId: [value] }
  return this.http.delete(`${baseUrl}/auth/programs/deleteById`, {
    body: payload,
    headers: { 'Content-Type': 'application/json' }
  });
}








// updateProgram(programId: number, updateData: any) {
//   const payload = {
//     programId: programId,
//     name: updateData.name,
//     cutoffPoints: updateData.cutoffPoints,
//     categoryIds: updateData.categories.map((cat: any) => ({ id: cat.id }))
//   };
//   return this.http.put(`${baseUrl}/auth/programs/updateProgram`, payload, {
//     headers: { 'Content-Type': 'application/json' }
//   });
// }

updateProgram(payload: any): Observable<any> {
  return this.http.put(`${baseUrl}/auth/programs/updateProgram`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}

getProgramById(productId: number){
  return this.http.get(`${baseUrl}/auth/programs/getProgramById/${productId}`)
}


getUniversityById(uiversityId: number){
  return this.http.get(`${baseUrl}/auth/getUniversityById/${uiversityId}`)
}


deleteUniversity(universityId: number) {
  const payload = { universityId }; // This creates { programId: [value] }
  return this.http.delete(`${baseUrl}/auth/deleteUniversityById/${universityId}`)
}


updateUniverity(payload: any): Observable<any> {
  return this.http.put(`${baseUrl}/auth/updateUniverity`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
}


}
