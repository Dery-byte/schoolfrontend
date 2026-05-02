import { EligibilityRecord } from './eligibility-record';

export interface UserWithReportsDto {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  reports?: Array<EligibilityRecord>;
}
