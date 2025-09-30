'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { initialPatients } from '@/lib/data';
import type { Patient } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface PatientContextType {
  patients: Patient[];
  getPatientById: (id: string) => Patient | undefined;
  addPatient: (patient: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'avatarUrl'>) => void;
  updatePatient: (id: string, updatedData: Partial<Patient>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const addPatient = (patientData: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'avatarUrl'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: (patients.length + 1).toString(),
      registeredAt: new Date().toISOString(),
      status: 'Waiting for Triage',
      avatarUrl: `https://picsum.photos/seed/p${patients.length + 1}/40/40`,
    };
    setPatients(prev => [newPatient, ...prev]);
    toast({
      title: 'Patient Registered',
      description: `${newPatient.name} has been successfully registered.`,
    });
  };

  const updatePatient = (id: string, updatedData: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedData } : p))
    );
     toast({
      title: 'Patient Record Updated',
      description: `Changes for patient ${id} have been saved.`,
    });
  };

  return (
    <PatientContext.Provider value={{ patients, getPatientById, addPatient, updatePatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
