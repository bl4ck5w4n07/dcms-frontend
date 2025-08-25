'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus, Calendar, Clock, User } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface WalkInPatientProps {
  staffEmail: string;
  onSuccess: () => void;
}

const DENTISTS = [
  'Dr. Sarah Johnson',
  'Dr. Michael Chen', 
  'Dr. Emily Rodriguez',
  'Dr. David Kim'
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

export function WalkInPatient({ staffEmail, onSuccess }: WalkInPatientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Patient info, 2: Appointment confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientData, setPatientData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    dentistName: '',
    confirmed: false
  });

  const handlePatientSubmit = async () => {
    if (!patientData.name || !patientData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create walk-in patient
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/walk-in-patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          ...patientData,
          staffEmail
        })
      });

      if (response.ok) {
        setStep(2);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error('Walk-in patient error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppointmentConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Create appointment for walk-in patient
      const appointmentResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          patientName: patientData.name,
          patientEmail: patientData.email,
          patientPhone: patientData.phone,
          reason: 'Walk-in appointment',
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          dentistName: appointmentData.dentistName,
          status: 'pending', // Always default to pending
          type: 'walk_in',
          createdByStaff: staffEmail,
          needsStaffConfirmation: true // Always needs confirmation
        })
      });

      if (appointmentResponse.ok) {
        // Reset form
        setPatientData({ name: '', email: '', phone: '' });
        setAppointmentData({ appointmentDate: '', appointmentTime: '', dentistName: '', confirmed: false });
        setStep(1);
        setIsOpen(false);
        onSuccess();
      } else {
        const errorData = await appointmentResponse.json();
        alert(`Error creating appointment: ${errorData.error}`);
      }
    } catch (error) {
      alert('Network error. Please try again.');
      console.error('Walk-in appointment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPatientData({ name: '', email: '', phone: '' });
    setAppointmentData({ appointmentDate: '', appointmentTime: '', dentistName: '', confirmed: false });
    setStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Walk-in Patient
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Add Walk-in Patient' : 'Schedule Appointment'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Walk-in patients will be recorded in the system but cannot login until they register themselves with a password.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={patientData.name}
                onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={patientData.email}
                onChange={(e) => setPatientData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter patient's email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={patientData.phone}
                onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter patient's phone"
              />
            </div>



            <div className="flex gap-2">
              <Button 
                onClick={handlePatientSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Adding Patient...' : 'Continue to Scheduling'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Added Successfully</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {patientData.name}</div>
                  <div><strong>Email:</strong> {patientData.email}</div>
                  {patientData.phone && <div><strong>Phone:</strong> {patientData.phone}</div>}
                  <div><strong>Type:</strong> Walk-in appointment</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-medium">Schedule Appointment</h3>
              
              <div className="space-y-2">
                <Label htmlFor="date">Appointment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentData.appointmentDate}
                  onChange={(e) => setAppointmentData(prev => ({
                    ...prev,
                    appointmentDate: e.target.value
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Appointment Time</Label>
                <Select
                  value={appointmentData.appointmentTime}
                  onValueChange={(value) => setAppointmentData(prev => ({
                    ...prev,
                    appointmentTime: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dentist">Dentist</Label>
                <Select
                  value={appointmentData.dentistName}
                  onValueChange={(value) => setAppointmentData(prev => ({
                    ...prev,
                    dentistName: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {DENTISTS.map(dentist => (
                      <SelectItem key={dentist} value={dentist}>{dentist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmed"
                  checked={appointmentData.confirmed}
                  onChange={(e) => setAppointmentData(prev => ({
                    ...prev,
                    confirmed: e.target.checked
                  }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="confirmed" className="text-sm">
                  Confirm appointment (patient agreed to date/time)
                </Label>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                If appointment is not confirmed, it will remain pending until the patient agrees to the scheduled time.
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAppointmentConfirm}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}