import { API_ENDPOINTS, API_HEADERS } from './constants';
import { User } from '../../types/index';

export interface Patient extends User {
  role: 'patient';
  createdBy?: string;
}

export interface CreateWalkInPatientData {
  name: string;
  phone: string;
  email: string;
  staffEmail: string;
}

export const patientApi = {
  async fetchAll(): Promise<Patient[]> {
    const response = await fetch(API_ENDPOINTS.PATIENTS, {
      method: 'GET',
      headers: API_HEADERS
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch patients');
    }

    const data = await response.json();
    return data.patients.filter((p: User) => p.role === 'patient');
  },

  async createWalkIn(data: CreateWalkInPatientData): Promise<Patient> {
    const response = await fetch(API_ENDPOINTS.WALK_IN_PATIENT, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create walk-in patient');
    }

    const responseData = await response.json();
    return responseData.patient;
  },

  async updateProfile(email: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await fetch(API_ENDPOINTS.PROFILE(email), {
      method: 'PUT',
      headers: API_HEADERS,
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update patient profile');
    }

    const data = await response.json();
    return data.user;
  }
};