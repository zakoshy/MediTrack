
import { z } from 'zod';

export const VitalsSchema = z.object({
  temperature: z.string(),
  bloodPressure: z.string(),
  heartRate: z.string(),
  respiratoryRate: z.string(),
});

export const PatientSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female', 'Other']),
  contact: z.string(),
  avatarUrl: z.string().url(),
  registeredAt: z.string().datetime(),
  status: z.enum(['Waiting for Triage', 'Waiting for Doctor', 'Discharged']),
  medicalHistory: z.string().optional(),
  vitals: VitalsSchema.optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  aiSuggestedDiagnosis: z.string().optional(),
  medication: z.string().optional(),
  dischargedAt: z.string().datetime().optional(),
});

export type Patient = z.infer<typeof PatientSchema> & { _id: string, id: string };
