'use server';

import { suggestDiagnosis } from '@/ai/flows/ai-suggested-diagnosis';
import { medicationSearch } from '@/ai/flows/ai-medication-search';
import { z } from 'zod';

const diagnosisSchema = z.object({
  symptoms: z.string(),
  vitals: z.string(),
  medicalHistory: z.string().optional(),
});

export async function getSuggestedDiagnosis(data: {
  symptoms: string;
  vitals: string;
  medicalHistory?: string;
}) {
  const parsedData = diagnosisSchema.safeParse(data);
  if (!parsedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await suggestDiagnosis(parsedData.data);
    return { suggestedDiagnoses: result.suggestedDiagnoses };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get AI diagnosis suggestion.' };
  }
}

const medicationSchema = z.object({
  medicationName: z.string().min(1, 'Medication name cannot be empty.'),
});

export async function searchMedication(data: { medicationName: string }) {
  const parsedData = medicationSchema.safeParse(data);
  if (!parsedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await medicationSearch(parsedData.data);
    return { searchResults: result.searchResults };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to search for medication.' };
  }
}
