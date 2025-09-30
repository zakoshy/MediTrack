
import type { Patient } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

// This data is now only for seeding/testing purposes and is not directly used by the app.
export const initialPatients: Omit<Patient, '_id' | 'id'>[] = [
  {
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    contact: '555-0101',
    avatarUrl: getImage('patient-1'),
    registeredAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    status: 'Waiting for Triage',
    medicalHistory: 'Hypertension, diagnosed in 2020. No known allergies.',
  },
  {
    name: 'Jane Smith',
    age: 34,
    gender: 'Female',
    contact: '555-0102',
    avatarUrl: getImage('patient-2'),
    registeredAt: new Date().toISOString(),
    status: 'Waiting for Doctor',
    medicalHistory: 'Seasonal allergies. History of migraines.',
    vitals: {
      temperature: '99.1°F',
      bloodPressure: '130/85 mmHg',
      heartRate: '88 bpm',
      respiratoryRate: '20 rpm',
    },
    symptoms: 'Persistent cough for 3 days, sore throat, and occasional headaches. Reports feeling fatigued.',
  },
  {
    name: 'Michael Johnson',
    age: 52,
    gender: 'Male',
    contact: '555-0103',
    avatarUrl: getImage('patient-3'),
    registeredAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    status: 'Discharged',
    medicalHistory: 'Type 2 Diabetes, managed with diet and medication.',
    vitals: {
      temperature: '98.6°F',
      bloodPressure: '125/80 mmHg',
      heartRate: '75 bpm',
      respiratoryRate: '16 rpm',
    },
    symptoms: 'Annual check-up, no new complaints.',
    diagnosis: 'Routine check-up, vitals stable.',
    medication: 'Continue current medication regimen for diabetes.',
    dischargedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  {
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    contact: '555-0104',
    avatarUrl: getImage('patient-4'),
    registeredAt: new Date().toISOString(),
    status: 'Waiting for Triage',
    medicalHistory: 'None',
  },
    {
    name: 'Chris Lee',
    age: 41,
    gender: 'Other',
    contact: '555-0105',
    avatarUrl: getImage('patient-5'),
    registeredAt: new Date().toISOString(),
    status: 'Waiting for Doctor',
    medicalHistory: 'Asthma, uses inhaler as needed.',
    vitals: {
        temperature: "98.7°F",
        bloodPressure: "118/76 mmHg",
        heartRate: "82 bpm",
        respiratoryRate: "18 rpm"
    },
    symptoms: "Reports shortness of breath and wheezing, especially after light exercise. Also complains of a tight feeling in the chest."
  },
];
