'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define dental service types
export interface DentalService {
  id: string;
  name: string;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'surgical' | 'orthodontic';
  description: string;
  defaultPrice: number;
  estimatedDuration: number; // in minutes
  isActive: boolean;
}

export interface ServiceHistory {
  id: string;
  patientEmail: string;
  serviceId: string;
  serviceName: string;
  appointmentId?: string;
  performedBy: string; // dentist email
  performedByName: string;
  date: string;
  notes: string;
  cost: number;
  status: 'completed' | 'in-progress' | 'planned' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientEmail: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  notes: string;
  lastUpdated: string;
  updatedBy: string;
}

interface ServiceContextType {
  services: DentalService[];
  serviceHistory: ServiceHistory[];
  medicalHistories: { [patientEmail: string]: MedicalHistory };
  isLoading: boolean;
  error: string | null;
  
  // Service management
  fetchServices: () => Promise<void>;
  createService: (service: Omit<DentalService, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateService: (id: string, updates: Partial<DentalService>) => Promise<{ success: boolean; error?: string }>;
  
  // Service history management
  fetchServiceHistory: (patientEmail?: string) => Promise<void>;
  createServiceRecord: (record: Omit<ServiceHistory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>;
  updateServiceRecord: (id: string, updates: Partial<ServiceHistory>) => Promise<{ success: boolean; error?: string }>;
  getPatientServiceHistory: (patientEmail: string) => ServiceHistory[];
  
  // Medical history management
  fetchMedicalHistory: (patientEmail: string) => Promise<MedicalHistory | null>;
  updateMedicalHistory: (patientEmail: string, data: Omit<MedicalHistory, 'id' | 'patientEmail' | 'lastUpdated' | 'updatedBy'>) => Promise<{ success: boolean; error?: string }>;
  
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

// Default dental services
const DEFAULT_SERVICES: Omit<DentalService, 'id'>[] = [
  {
    name: 'Routine Cleaning',
    category: 'preventive',
    description: 'Regular dental cleaning and examination',
    defaultPrice: 120,
    estimatedDuration: 60,
    isActive: true
  },
  {
    name: 'Dental Filling',
    category: 'restorative',
    description: 'Tooth restoration using composite or amalgam filling',
    defaultPrice: 180,
    estimatedDuration: 45,
    isActive: true
  },
  {
    name: 'Root Canal Treatment',
    category: 'restorative',
    description: 'Endodontic treatment to save infected tooth',
    defaultPrice: 800,
    estimatedDuration: 90,
    isActive: true
  },
  {
    name: 'Teeth Whitening',
    category: 'cosmetic',
    description: 'Professional teeth whitening treatment',
    defaultPrice: 350,
    estimatedDuration: 75,
    isActive: true
  },
  {
    name: 'Tooth Extraction',
    category: 'surgical',
    description: 'Surgical removal of tooth',
    defaultPrice: 250,
    estimatedDuration: 30,
    isActive: true
  },
  {
    name: 'Dental Crown',
    category: 'restorative',
    description: 'Crown restoration for damaged tooth',
    defaultPrice: 950,
    estimatedDuration: 120,
    isActive: true
  },
  {
    name: 'Orthodontic Consultation',
    category: 'orthodontic',
    description: 'Initial consultation for braces or aligners',
    defaultPrice: 150,
    estimatedDuration: 45,
    isActive: true
  }
];

export function ServiceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [services, setServices] = useState<DentalService[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<{ [patientEmail: string]: MedicalHistory }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with default services (in a real app, this would come from the backend)
  useEffect(() => {
    if (user && services.length === 0) {
      const defaultServicesWithIds = DEFAULT_SERVICES.map((service, index) => ({
        ...service,
        id: `service_${index + 1}`
      }));
      setServices(defaultServicesWithIds);
    }
  }, [user, services.length]);

  const fetchServices = async (): Promise<void> => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll use the default services
  };

  const createService = async (service: Omit<DentalService, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const newService: DentalService = {
        ...service,
        id: `service_${Date.now()}`
      };
      setServices(prev => [...prev, newService]);
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create service';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const updateService = async (id: string, updates: Partial<DentalService>): Promise<{ success: boolean; error?: string }> => {
    try {
      setServices(prev => 
        prev.map(service => 
          service.id === id ? { ...service, ...updates } : service
        )
      );
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update service';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const fetchServiceHistory = async (patientEmail?: string): Promise<void> => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll generate some mock data
    if (patientEmail) {
      const mockHistory: ServiceHistory[] = [
        {
          id: 'sh_1',
          patientEmail,
          serviceId: 'service_1',
          serviceName: 'Routine Cleaning',
          performedBy: 'dr.johnson@clinic.com',
          performedByName: 'Dr. Sarah Johnson',
          date: '2024-01-15',
          notes: 'Patient has good oral hygiene. Recommended flossing daily.',
          cost: 120,
          status: 'completed',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'sh_2',
          patientEmail,
          serviceId: 'service_2',
          serviceName: 'Dental Filling',
          performedBy: 'dr.chen@clinic.com',
          performedByName: 'Dr. Michael Chen',
          date: '2024-02-20',
          notes: 'Composite filling on upper left molar. Patient tolerated procedure well.',
          cost: 180,
          status: 'completed',
          createdAt: '2024-02-20T14:00:00Z',
          updatedAt: '2024-02-20T15:00:00Z'
        }
      ];
      setServiceHistory(prev => [...prev.filter(h => h.patientEmail !== patientEmail), ...mockHistory]);
    }
  };

  const createServiceRecord = async (record: Omit<ServiceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const newRecord: ServiceHistory = {
        ...record,
        id: `sh_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setServiceHistory(prev => [...prev, newRecord]);
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create service record';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const updateServiceRecord = async (id: string, updates: Partial<ServiceHistory>): Promise<{ success: boolean; error?: string }> => {
    try {
      setServiceHistory(prev =>
        prev.map(record =>
          record.id === id 
            ? { ...record, ...updates, updatedAt: new Date().toISOString() }
            : record
        )
      );
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update service record';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const getPatientServiceHistory = (patientEmail: string): ServiceHistory[] => {
    return serviceHistory.filter(record => record.patientEmail === patientEmail)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const fetchMedicalHistory = async (patientEmail: string): Promise<MedicalHistory | null> => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll create mock data
    if (!medicalHistories[patientEmail]) {
      const mockMedicalHistory: MedicalHistory = {
        id: `mh_${Date.now()}`,
        patientEmail,
        allergies: ['Penicillin'],
        medications: ['Lisinopril 10mg daily'],
        medicalConditions: ['Hypertension'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '(555) 123-4567',
          relationship: 'Spouse'
        },
        insuranceInfo: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GRP001'
        },
        notes: 'Patient has history of anxiety during dental procedures. Premedication may be required.',
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'system'
      };
      
      setMedicalHistories(prev => ({
        ...prev,
        [patientEmail]: mockMedicalHistory
      }));
      return mockMedicalHistory;
    }
    
    return medicalHistories[patientEmail];
  };

  const updateMedicalHistory = async (
    patientEmail: string, 
    data: Omit<MedicalHistory, 'id' | 'patientEmail' | 'lastUpdated' | 'updatedBy'>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedHistory: MedicalHistory = {
        ...data,
        id: medicalHistories[patientEmail]?.id || `mh_${Date.now()}`,
        patientEmail,
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'system'
      };
      
      setMedicalHistories(prev => ({
        ...prev,
        [patientEmail]: updatedHistory
      }));
      
      return { success: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update medical history';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const clearError = () => setError(null);

  const refreshAll = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetchServices();
      // Don't refresh all service history as it's patient-specific
    } catch (error) {
      console.error('Error refreshing service data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    services,
    serviceHistory,
    medicalHistories,
    isLoading,
    error,
    fetchServices,
    createService,
    updateService,
    fetchServiceHistory,
    createServiceRecord,
    updateServiceRecord,
    getPatientServiceHistory,
    fetchMedicalHistory,
    updateMedicalHistory,
    clearError,
    refreshAll
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}