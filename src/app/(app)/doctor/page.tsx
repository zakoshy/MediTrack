'use client';
import * as React from 'react';
import { FileText, Lightbulb, Pill, Send, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { usePatients } from '@/contexts/patient-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getSuggestedDiagnosis } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const diagnosisSchema = z.object({
  diagnosis: z.string().min(10, 'Diagnosis must be at least 10 characters.'),
  medication: z.string().min(3, 'Medication recommendation is required.'),
});

const SymptomList = ({ symptoms }: { symptoms?: string }) => {
  if (!symptoms) return null;
  const symptomPoints = symptoms.split(/, ?|\n/g).filter(s => s.trim().length > 0);
  return (
    <ul className="list-disc list-inside text-muted-foreground space-y-1">
      {symptomPoints.map((symptom, index) => (
        <li key={index}>{symptom.trim()}</li>
      ))}
    </ul>
  );
};


export default function DoctorPage() {
  const { patients, updatePatient, isLoading: arePatientsLoading } = usePatients();
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const diagnosisForm = useForm<z.infer<typeof diagnosisSchema>>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: { diagnosis: '', medication: '' },
  });

  const waitingPatients = patients.filter(p => p.status === 'Waiting for Doctor');

  const handleOpenDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    diagnosisForm.reset({
      diagnosis: patient.diagnosis || '',
      medication: patient.medication || '',
    });
    // Clear previous AI suggestion
    if (patient.aiSuggestedDiagnosis) {
      updatePatient(patient.id, { aiSuggestedDiagnosis: '' });
    }
    setDialogOpen(true);
  };

  const handleGetAiSuggestion = async () => {
    if (!selectedPatient || !selectedPatient.symptoms || !selectedPatient.vitals) return;
    setIsAiLoading(true);

    const vitalsString = `Temp: ${selectedPatient.vitals.temperature}, BP: ${selectedPatient.vitals.bloodPressure}, HR: ${selectedPatient.vitals.heartRate}, RR: ${selectedPatient.vitals.respiratoryRate}`;
    
    const result = await getSuggestedDiagnosis({
      symptoms: selectedPatient.symptoms,
      vitals: vitalsString,
      medicalHistory: selectedPatient.medicalHistory,
    });
    
    setIsAiLoading(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'AI Error', description: result.error });
    } else if(result.suggestedDiagnoses) {
      // Optimistically update the patient in the sheet
      setSelectedPatient(prev => prev ? {...prev, aiSuggestedDiagnosis: result.suggestedDiagnoses} : null);
      // Persist the change
      updatePatient(selectedPatient.id, { aiSuggestedDiagnosis: result.suggestedDiagnoses });
      toast({ title: 'AI Suggestion Ready', description: 'The AI has provided a diagnostic suggestion.' });
    }
  };
  
  const handleDischargePatient = (values: z.infer<typeof diagnosisSchema>) => {
    if (selectedPatient) {
      updatePatient(selectedPatient.id, {
        ...values,
        status: 'Discharged',
        dischargedAt: new Date().toISOString(),
      });
      toast({ title: 'Patient Discharged', description: `${selectedPatient.name} has been discharged.` });
      setDialogOpen(false);
      setSelectedPatient(null);
    }
  };
  
  // To update dialog content when AI suggestion arrives via context
  const patientInDialog = patients.find(p => p.id === selectedPatient?.id) || selectedPatient;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Doctor's Queue</h2>
        <p className="text-muted-foreground">Review patients waiting for diagnosis.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Waiting Patients</CardTitle>
          <CardDescription>{waitingPatients.length} patient(s) are waiting for consultation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Symptoms Summary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {arePatientsLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <TableRow key={index}>
                     <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : waitingPatients.length > 0 ? waitingPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
                        <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell className="max-w-xs truncate">{patient.symptoms}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(patient)}>
                      Review Patient
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No patients waiting.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if (!isOpen) setSelectedPatient(null); }}>
        <DialogContent className="sm:max-w-4xl p-0">
          {patientInDialog ? (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl">Patient File: {patientInDialog.name}</DialogTitle>
              <DialogDescription>
                Age: {patientInDialog.age} | Gender: {patientInDialog.gender} | Contact: {patientInDialog.contact}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto px-6 space-y-6 pb-6">
              <Card>
                <CardHeader><CardTitle>Vitals & Symptoms</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {patientInDialog.vitals && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Temperature</p><p>{patientInDialog.vitals.temperature}</p></div>
                      <div><p className="text-muted-foreground">Blood Pressure</p><p>{patientInDialog.vitals.bloodPressure}</p></div>
                      <div><p className="text-muted-foreground">Heart Rate</p><p>{patientInDialog.vitals.heartRate}</p></div>
                      <div><p className="text-muted-foreground">Resp. Rate</p><p>{patientInDialog.vitals.respiratoryRate}</p></div>
                    </div>
                  )}
                  <Separator />
                  <div>
                    <p className="font-medium">Symptoms Reported</p>
                     <SymptomList symptoms={patientInDialog.symptoms} />
                  </div>
                  {patientInDialog.medicalHistory && <>
                    <Separator />
                    <div>
                      <p className="font-medium">Medical History</p>
                      <p className="text-muted-foreground">{patientInDialog.medicalHistory}</p>
                    </div>
                  </>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnosis & Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     <div className="rounded-lg border bg-accent/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="text-yellow-500"/> AI Suggested Diagnosis</h3>
                            <Button size="sm" variant="outline" onClick={handleGetAiSuggestion} disabled={isAiLoading}>
                                <Sparkles className="mr-2 h-4 w-4"/>
                                {isAiLoading ? 'Generating...' : 'Get Suggestion'}
                            </Button>
                        </div>
                        {isAiLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>}
                        {patientInDialog.aiSuggestedDiagnosis && !isAiLoading && (
                            <p className="text-sm text-muted-foreground">{patientInDialog.aiSuggestedDiagnosis}</p>
                        )}
                        {!patientInDialog.aiSuggestedDiagnosis && !isAiLoading && (
                            <p className="text-sm text-muted-foreground">Click 'Get Suggestion' to use AI to analyze patient data.</p>
                        )}
                     </div>

                    <Form {...diagnosisForm}>
                      <form onSubmit={diagnosisForm.handleSubmit(handleDischargePatient)} className="space-y-4">
                        <FormField control={diagnosisForm.control} name="diagnosis" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><FileText /> Final Diagnosis</FormLabel>
                            <FormControl><Textarea placeholder="Enter your final diagnosis here..." {...field} rows={4} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <FormField control={diagnosisForm.control} name="medication" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Pill /> Medication & Prescription</FormLabel>
                            <FormControl><Input placeholder="e.g., Paracetamol 500mg, twice a day for 3 days" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <DialogFooter className="pt-4 bg-background sticky bottom-0 py-4 px-6 border-t">
                          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                          <Button type="submit"><Send className="mr-2 h-4 w-4" /> Save & Discharge</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Please select a patient to review.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
