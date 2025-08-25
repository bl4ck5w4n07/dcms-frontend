'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { mockServices, mockUsers, timeSlots } from '@/data/mockData';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface HomeBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const HomeBookingForm: React.FC<HomeBookingFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '', // email or phone
    contactType: 'email' as 'email' | 'phone',
    service: '',
    dentist: '',
    date: undefined as Date | undefined,
    time: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const dentists = mockUsers.filter(u => u.role === 'dentist' || u.role === 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare appointment data for Supabase
      const appointmentData = {
        patientName: `${formData.firstName} ${formData.lastName}`,
        patientEmail: formData.contactType === 'email' ? formData.contact : '',
        patientPhone: formData.contactType === 'phone' ? formData.contact : '',
        reason: formData.service || 'General appointment',
        message: `Preferred dentist: ${formData.dentist || 'Any available'}. Preferred date: ${formData.date ? format(formData.date, 'MMM dd, yyyy') : 'Flexible'}. Preferred time: ${formData.time || 'Flexible'}.`,
        needsStaffConfirmation: true,
        type: 'booking_request'
      };

      // Submit to Supabase
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit appointment');
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form and close after success
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          firstName: '',
          lastName: '',
          contact: '',
          contactType: 'email',
          service: '',
          dentist: '',
          date: undefined,
          time: ''
        });
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setIsSubmitting(false);
      // You could add error state here to show error message to user
      alert('Failed to submit appointment. Please try again or call us directly.');
    }
  };

  // Always show the form now (removed isOpen check)

  if (showSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card className="border-green-200 bg-green-50 shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-green-800">Booking Submitted!</h3>
            <p className="text-green-700 mb-4">
              We'll contact you within 24 hours to confirm your appointment.
            </p>
            <p className="text-sm text-green-600">
              You can also call us directly at <strong>(555) 123-DENTAL</strong> for immediate assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="text-center">
            <CardTitle className="text-2xl">Book Your Appointment</CardTitle>
            <CardDescription className="text-lg">Fill out the form below and we'll get back to you soon</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Information</Label>
              <div className="flex space-x-2">
                <Select 
                  value={formData.contactType} 
                  onValueChange={(value: 'email' | 'phone') => setFormData(prev => ({ ...prev, contactType: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  placeholder={formData.contactType === 'email' ? 'john@example.com' : '(555) 123-4567'}
                  type={formData.contactType === 'email' ? 'email' : 'tel'}
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service Needed</Label>
              <Select value={formData.service} onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {mockServices.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dentist">Preferred Dentist</Label>
              <Select value={formData.dentist} onValueChange={(value) => setFormData(prev => ({ ...prev, dentist: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Available</SelectItem>
                  {dentists.map((dentist) => (
                    <SelectItem key={dentist.id} value={dentist.name}>
                      {dentist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "MMM dd") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-3" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Request Appointment'}
            </Button>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Or call us directly at <strong>(555) 123-DENTAL</strong></p>
              <p>We're available Mon-Fri 8AM-6PM, Sat 9AM-4PM</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};