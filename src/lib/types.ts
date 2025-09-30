
export type PatientStatus = 'Waiting for Triage' | 'Waiting for Doctor' | 'Discharged';

export type Vitals = {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
};

export type Patient = {
  _id: string; // From MongoDB
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  avatarUrl: string;
  registeredAt: string;
  status: PatientStatus;
  paid?: boolean;
  medicalHistory?: string;
  vitals?: Vitals;
  symptoms?: string;
  diagnosis?: string;
  aiSuggestedDiagnosis?: string;
  medication?: string;
  dischargedAt?: string;
};
