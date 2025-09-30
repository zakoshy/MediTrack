
'use client';
import * as React from 'react';
import { PlusCircle, Stethoscope, Search, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { usePatients } from '@/contexts/patient-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Patient } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().int().positive('Age must be a positive number.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  contact: z.string().min(1, 'Contact information is required.'),
  medicalHistory: z.string().optional(),
});

const vitalsSchema = z.object({
  temperature: z.string().min(1, 'Required'),
  bloodPressure: z.string().min(1, 'Required'),
  heartRate: z.string().min(1, 'Required'),
  respiratoryRate: z.string().min(1, 'Required'),
  symptoms: z.string().min(10, 'Please provide detailed symptoms.'),
  paid: z.boolean().default(false).refine(val => val === true, { message: "Payment must be confirmed to proceed." }),
});

export default function ReceptionPage() {
  const { patients, addPatient, updatePatient, isLoading } = usePatients();
  const [isPatientDialogOpen, setPatientDialogOpen] = React.useState(false);
  const [isVitalsDialogOpen, setVitalsDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const patientForm = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: '', age: undefined, gender: undefined, contact: '', medicalHistory: '' },
  });

  const vitalsForm = useForm<z.infer<typeof vitalsSchema>>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      symptoms: '',
      paid: false,
    }
  });

  const handleRegisterPatient = (values: z.infer<typeof patientSchema>) => {
    addPatient(values);
    patientForm.reset();
    setPatientDialogOpen(false);
  };
  
  const handleOpenVitalsDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    vitalsForm.reset(patient.vitals ? { ...patient.vitals, symptoms: patient.symptoms, paid: patient.paid || false } : {
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      symptoms: '',
      paid: false,
    });
    setVitalsDialogOpen(true);
  };

  const handleAddVitals = (values: z.infer<typeof vitalsSchema>) => {
    if (selectedPatient) {
      const { symptoms, paid, ...vitals } = values;
      updatePatient(selectedPatient.id, {
        vitals,
        symptoms,
        paid,
        status: 'Waiting for Doctor',
      });
      setVitalsDialogOpen(false);
      setSelectedPatient(null);
    }
  };
  
  const getBadgeVariant = (status: Patient['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Waiting for Doctor': return 'default';
      case 'Waiting for Triage': return 'secondary';
      case 'Discharged': return 'outline';
      default: return 'secondary';
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Registry</h2>
          <p className="text-muted-foreground">Manage patient registration and initial assessment.</p>
        </div>
        <Dialog open={isPatientDialogOpen} onOpenChange={setPatientDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Register Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
              <DialogDescription>
                Fill in the details below to register a new patient.
              </DialogDescription>
            </DialogHeader>
            <Form {...patientForm}>
              <form onSubmit={patientForm.handleSubmit(handleRegisterPatient)} className="space-y-4 py-4">
                <FormField control={patientForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={patientForm.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" placeholder="42" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={patientForm.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
                 <FormField control={patientForm.control} name="contact" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Info</FormLabel>
                    <FormControl><Input placeholder="555-123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={patientForm.control} name="medicalHistory" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="Known allergies, chronic conditions, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button type="submit">Register Patient</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Patients</CardTitle>
              <CardDescription>A list of all patients registered in the system.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by patient name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
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
                    <TableCell><Badge variant={getBadgeVariant(patient.status)}>{patient.status}</Badge></TableCell>
                    <TableCell>{format(parseISO(patient.registeredAt), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      {patient.status === 'Waiting for Triage' && (
                        <Button variant="outline" size="sm" onClick={() => handleOpenVitalsDialog(patient)}>
                          <Stethoscope className="mr-2 h-4 w-4" />
                          Add Vitals
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {searchTerm ? `No patients found for "${searchTerm}".` : 'No patients registered yet.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isVitalsDialogOpen} onOpenChange={setVitalsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Vitals & Symptoms</DialogTitle>
            <DialogDescription>For patient: {selectedPatient?.name}</DialogDescription>
          </DialogHeader>
          <Form {...vitalsForm}>
            <form onSubmit={vitalsForm.handleSubmit(handleAddVitals)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={vitalsForm.control} name="temperature" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl><Input placeholder="e.g. 98.6°F" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                 <FormField control={vitalsForm.control} name="bloodPressure" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure</FormLabel>
                    <FormControl><Input placeholder="e.g. 120/80 mmHg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={vitalsForm.control} name="heartRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heart Rate</FormLabel>
                    <FormControl><Input placeholder="e.g. 72 bpm" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={vitalsForm.control} name="respiratoryRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respiratory Rate</FormLabel>
                    <FormControl><Input placeholder="e.g. 16 rpm" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <FormField control={vitalsForm.control} name="symptoms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl><Textarea placeholder="Describe patient's symptoms..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
               <FormField
                control={vitalsForm.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2"><CreditCard /> Confirm Payment</FormLabel>
                       <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <Button type="submit" disabled={!vitalsForm.formState.isValid}>Refer to Doctor</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
