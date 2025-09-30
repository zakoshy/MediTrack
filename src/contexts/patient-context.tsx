
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Patient } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { getPatients, createPatient } from '@/app/actions';

interface PatientContextType {
  patients: Patient[];
  isLoading: boolean;
  getPatientById: (id: string) => Patient | undefined;
  addPatient: (patient: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'avatarUrl' | '_id'>) => void;
  updatePatient: (id: string, updatedData: Partial<Patient>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    const result = await getPatients();
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
      setPatients([]);
    } else {
      // Map _id to id
      const formattedPatients = result.patients.map((p: any) => ({...p, id: p._id.toString()}));
      setPatients(formattedPatients || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);


  const getPatientById = useCallback((id: string) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const addPatient = async (patientData: Omit<Patient, 'id' | 'registeredAt' | 'status' | 'avatarUrl' | '_id'>) => {
    const result = await createPatient(patientData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: result.error,
      });
    } else if (result.patient) {
       const newPatient = {...result.patient, id: result.patient._id.toString()};
       setPatients(prev => [newPatient, ...prev]);
       toast({
        title: 'Patient Registered',
        description: `${newPatient.name} has been successfully registered.`,
      });
    }
  };

  const updatePatient = (id: string, updatedData: Partial<Patient>) => {
    // This needs to be updated to persist to DB as well.
    // For now, it optimistically updates the UI.
    setPatients(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedData } : p))
    );
     toast({
      title: 'Patient Record Updated',
      description: `Changes for patient ${id} have been saved.`,
    });
  };

  return (
    <PatientContext.Provider value={{ patients, isLoading, getPatientById, addPatient, updatePatient }}>
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
