export interface Patient {
  patient_id?: string;
  name?: string;
  age?: number | string | null;
  gender?: string | null;
  blood_pressure?: string | null;
  temperature?: number | string | null;
  visit_date?: string | null;
  diagnosis?: string | null;
  medications?: string | null;
}

export interface PatientsResponse {
  data?: Patient[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
  metadata?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
  };
}

export interface SubmissionPayload {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}