import { User, Appointment, PatientRecord, Service } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@dentalclinic.com',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    phone: '(555) 123-4567',
    canLogin: true,
    createdAt: '2023-01-15T08:00:00Z',
    birthdate: '1975-03-20',
    address: {
      street: '789 Medical Plaza',
      city: 'Healthcare City',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    }
  },
  {
    id: '2', 
    email: 'dentist@dentalclinic.com',
    name: 'Dr. Michael Chen',
    role: 'dentist',
    phone: '(555) 234-5678',
    canLogin: true,
    createdAt: '2023-02-10T09:00:00Z',
    birthdate: '1980-08-15',
    address: {
      street: '456 Dental Avenue',
      city: 'Professional District',
      state: 'CA',
      zipCode: '90211',
      country: 'United States'
    }
  },
  {
    id: '3',
    email: 'patient@example.com',
    name: 'John Smith',
    role: 'patient',
    phone: '(555) 345-6789',
    canLogin: true,
    createdAt: '2023-06-01T10:30:00Z',
    birthdate: '1985-06-15',
    address: {
      street: '123 Main St',
      city: 'Hometown',
      state: 'CA',
      zipCode: '90212',
      country: 'United States'
    }
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '3',
    patientName: 'John Smith',
    patientEmail: 'patient@example.com',
    patientPhone: '(555) 345-6789',
    dentistId: '2',
    dentistName: 'Dr. Michael Chen',
    date: '2025-08-15',
    time: '10:00',
    service: 'Regular Cleaning',
    status: 'scheduled',
    notes: 'First visit',
    isAnonymous: false
  },
  {
    id: '2',
    patientId: 'anonymous-1',
    patientName: 'Jane Doe',
    patientEmail: 'jane.doe@email.com',
    patientPhone: '(555) 456-7890',
    dentistId: '1',
    dentistName: 'Dr. Sarah Johnson',
    date: '2025-08-16',
    time: '14:00',
    service: 'Dental Filling',
    status: 'scheduled',
    notes: 'Anonymous booking',
    isAnonymous: true
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'John Smith',
    patientEmail: 'patient@example.com',
    patientPhone: '(555) 345-6789',
    dentistId: '2',
    dentistName: 'Dr. Michael Chen',
    date: '2025-07-20',
    time: '09:00',
    service: 'Root Canal',
    status: 'completed',
    notes: 'Treatment completed successfully',
    isAnonymous: false
  }
];

export const mockPatientRecords: PatientRecord[] = [
  {
    id: '1',
    patientId: '3',
    appointmentId: '3',
    date: '2025-07-20',
    treatment: 'Root Canal - Tooth #14',
    diagnosis: 'Deep decay requiring root canal therapy',
    notes: 'Patient responded well to treatment. Prescribed antibiotics.',
    cost: 1200,
    dentistId: '2',
    dentistName: 'Dr. Michael Chen'
  },
  {
    id: '2',
    patientId: '3',
    appointmentId: '1',
    date: '2025-06-15',
    treatment: 'Regular Cleaning and Examination',
    diagnosis: 'Mild gingivitis, overall good oral health',
    notes: 'Recommended improved flossing routine',
    cost: 150,
    dentistId: '2',
    dentistName: 'Dr. Michael Chen'
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Regular Cleaning',
    duration: 60,
    price: 150,
    description: 'Comprehensive dental cleaning and examination'
  },
  {
    id: '2',
    name: 'Dental Filling',
    duration: 90,
    price: 300,
    description: 'Composite or amalgam filling for cavities'
  },
  {
    id: '3',
    name: 'Root Canal',
    duration: 120,
    price: 1200,
    description: 'Root canal therapy for infected teeth'
  },
  {
    id: '4',
    name: 'Teeth Whitening',
    duration: 90,
    price: 400,
    description: 'Professional teeth whitening treatment'
  },
  {
    id: '5',
    name: 'Dental Crown',
    duration: 120,
    price: 900,
    description: 'Custom dental crown placement'
  }
];

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];