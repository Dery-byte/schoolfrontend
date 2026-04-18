import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class GuestService {

  constructor(private http: HttpClient) {}

  // --- Session storage helpers ---

  saveSessionId(sessionId: string): void {
    sessionStorage.setItem('eligibilitySessionId', sessionId);
  }

  getSessionId(): string | null {
    return sessionStorage.getItem('eligibilitySessionId');
  }

  saveGuestMeta(externalRef: string, recordId: string): void {
    sessionStorage.setItem('guestExternalRef', externalRef);
    sessionStorage.setItem('guestRecordId', recordId);
  }

  getExternalRef(): string | null {
    return sessionStorage.getItem('guestExternalRef');
  }

  getRecordId(): string | null {
    return sessionStorage.getItem('guestRecordId');
  }

  clearSession(): void {
    sessionStorage.removeItem('eligibilitySessionId');
    sessionStorage.removeItem('guestExternalRef');
    sessionStorage.removeItem('guestRecordId');
  }

  // --- Guest payment API calls (no auth token needed) ---

  initiateGuestPayment(payload: {
    payer: string;
    channel: string;
    amount: number;
    subscriptionType: string;
    candidateName: string;
  }): Observable<any> {
    return this.http.post(`${baseUrl}/guest/payment/initiate`, payload);
  }

  verifyGuestOtp(payload: any, sessionId: string): Observable<any> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post(`${baseUrl}/guest/payment/verify-otp`, payload, { params });
  }

  getGuestPaymentStatus(externalRef: string): Observable<any> {
    return this.http.get(`${baseUrl}/guest/payment/status/${externalRef}`);
  }

  checkGuestEligibility(payload: {
    sessionId: string;
    checkRecordId: string;
    resultDetails: { subject: string; grade: string; interpretation?: string; subjectcode?: string }[];
    categoryIds: number[];
    universityType?: string;
  }): Observable<any> {
    return this.http.post(`${baseUrl}/guest/eligibility/check`, payload);
  }

  saveTempRecord(sessionId: string, eligibilityRecordId: string): Observable<any> {
    return this.http.post(`${baseUrl}/guest/eligibility/save-temp`, { sessionId, eligibilityRecordId });
  }

  getSessionProgress(sessionId: string): Observable<any> {
    return this.http.get(`${baseUrl}/guest/payment/session/${sessionId}`);
  }

  // --- Authenticated attach call (requires JWT token in localStorage) ---

  attachTempReportToUser(sessionId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${baseUrl}/eligibility/attach-temp-report-to-user`, { sessionId }, { headers });
  }
}
