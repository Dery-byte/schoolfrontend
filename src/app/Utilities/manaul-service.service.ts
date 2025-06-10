import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,HttpErrorResponse } from '@angular/common/http';
import baseUrl from './helper';



@Injectable({
  providedIn: 'root'
})
export class ManaulServiceService {

  constructor(private http: HttpClient) { }

   checkEligibility(payload: any) {
    return this.http.post(`${baseUrl}/auth/check-eligibilityAll`, payload, {
    }
  )};





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


  


  
 initializePayment(payload:any) {
  const token = localStorage.getItem('token'); // Retrieve token
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  return this.http.post(`${baseUrl}/auth/payments/initiate`, payload, { headers });
}








}
