import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum SubscriptionType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  PREMIUM_PLUS = 'PREMIUM_PLUS'
}

export enum InstitutionTypeVisibility {
  PRIVATE_ONLY = 'PRIVATE_ONLY',
  PUBLIC_ONLY = 'PUBLIC_ONLY',
  BOTH = 'BOTH'
}

export interface PackageConfiguration {
  id?: number;
  subscriptionType: SubscriptionType;
  price: number;
  privateSchoolSlots: number;
  publicSchoolSlots: number;
  programsPerPrivateUniversity: number;
  programsPerPublicUniversity: number;
  maxCategorySelection: number;
  visibility: InstitutionTypeVisibility;
}

import { ApiConfiguration } from '../api-configuration';

@Injectable({
  providedIn: 'root'
})
export class PackageManagementService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfiguration
  ) { }

  private get apiUrl() {
    return `${this.apiConfig.rootUrl}/auth/admin/packages`;
  }

  getAllConfigurations(): Observable<PackageConfiguration[]> {
    return this.http.get<PackageConfiguration[]>(this.apiUrl);
  }

  updateConfiguration(config: PackageConfiguration): Observable<PackageConfiguration> {
    return this.http.put<PackageConfiguration>(this.apiUrl, config);
  }
}
