// models/eligibility.model.ts
export interface CutoffPoints {
  [subject: string]: string;
}
export interface AIRecommendation {
  id?: number;
  programName?: string;
  careerPath?: string | null;
  jobOpportunities?: string;
  futureProspects?: string;
  alternativeOptions?: string | null;
  improvementTips?: string | null;
  eligibleProgram?: any | null;
  alternativeProgram?: any | null;
}

export interface Program {
  id: string;
  name: string;
  cutoffPoints: CutoffPoints;
  percentage?: number;
  admissionProbability?: number;
  explanations?: string[];
   aiRecommendation?: AIRecommendation; // Add this line
}

export interface University {
  id: string;
  universityName: string;
  location: string;
  type: 'PUBLIC' | 'PRIVATE';
  eligiblePrograms: Program[];
  alternativePrograms: Program[];
}

export interface ExamCheckRecord {
  id: string;
  candidateName: string | null;
  paymentStatus: string;
  checkStatus: string | null;
  createdAt: string;
  lastUpdated: string;
  externalRef: string;
  waecCandidateEntity: any | null;
}

export interface EligibilityResult {
  id: string;
  userId: string;
  createdAt: string;
  examCheckRecord: ExamCheckRecord | null;
  universities: University[];
}