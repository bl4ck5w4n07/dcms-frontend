'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { projectId, publicAnonKey } from '@/mock/supabase/info';
import { toast } from 'sonner';

interface BookingFormProps {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  asDialog?: boolean;
}

function BookingFormContent({ userEmail, userName, userPhone, onSuccess, onDialogClose }: BookingFormProps & { onDialogClose?: () => void }) {
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: userPhone || '',
    reason: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Check for existing pending appointments if user is logged in
      if (userEmail) {
        const checkApiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments`;
        const checkResponse = await fetch(checkApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });

        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          const existingAppointments = checkData.appointments || [];
          
          // Check for pending appointments for this user
          const pendingAppointments = existingAppointments.filter((apt: any) => 
            apt.patientEmail === userEmail && apt.status === 'pending'
          );

          if (pendingAppointments.length > 0) {
            const errorMsg = 'You already have a pending appointment. Please wait for confirmation before booking another appointment.';
            setSubmitMessage(errorMsg);
            toast.error('Booking Not Allowed', {
              description: errorMsg
            });
            setIsSubmitting(false);
            return;
          }
        }
      }
      // Proceed with booking
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          patientName: formData.name,
          patientEmail: formData.email,
          patientPhone: formData.phone,
          reason: formData.reason,
          message: formData.message,
          type: 'booking_request',
          needsStaffConfirmation: true
        })
      });

      if (response.ok) {
        const successMsg = 'Booking request submitted successfully! Our staff will contact you to confirm the date and time.';
        setSubmitMessage(successMsg);
        toast.success('Appointment Request Submitted', {
          description: 'We will contact you within 24 hours to confirm your appointment.'
        });
        setFormData({
          name: userName || '',
          email: userEmail || '',
          phone: userPhone || '',
          reason: '',
          message: ''
        });
        onSuccess?.();
        // Close dialog after successful submission
        setTimeout(() => {
          onDialogClose?.();
        }, 2000);
      } else {
        const errorData = await response.json();
        const errorMsg = `Error: ${errorData.error || 'Failed to submit booking request'}`;
        setSubmitMessage(errorMsg);
        toast.error('Booking Failed', {
          description: errorData.error || 'Please try again or call us directly.'
        });
      }
    } catch (error) {
      const errorMsg = 'Network error. Please try again.';
      setSubmitMessage(errorMsg);
      toast.error('Network Error', {
        description: 'Please check your connection and try again.'
      });
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getHeaderText = () => {
    if (userEmail) {
      return 'Submit your appointment request. We will contact you to confirm the date and time.';
    }
    return 'Submit your request and our staff will contact you to schedule your appointment.';
  };

  const getPlaceholderText = () => {
    if (userEmail) {
      return 'Any specific concerns or requests...';
    }
    return 'e.g., Routine checkup, Tooth pain, Cleaning';
  };

  const getReasonLabel = () => {
    return userEmail ? 'Note (Optional)' : 'Reason for Visit';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <p className="text-sm text-gray-600">
          {getHeaderText()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!userEmail && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">{getReasonLabel()}</Label>
            <Input
              id="reason"
              name="reason"
              type="text"
              placeholder={getPlaceholderText()}
              value={formData.reason}
              onChange={handleChange}
              required={!userEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Information</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Any additional details about your concern or preferred appointment times..."
              value={formData.message}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
          </Button>

          {submitMessage && (
            <div className={`text-sm p-3 rounded ${
              submitMessage.includes('successfully') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitMessage}
            </div>
          )}
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <p className="font-medium">Next Steps:</p>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Our staff will review your request</li>
            <li>• We will contact you to schedule date & time</li>
            <li>• Appointment will be confirmed once scheduled</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export function BookingForm({ userEmail, userName, userPhone, onSuccess, trigger, asDialog = true }: BookingFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If not used as dialog (for homepage), render the form directly
  if (!asDialog) {
    return (
      <BookingFormContent
        userEmail={userEmail}
        userName={userName}
        userPhone={userPhone}
        onSuccess={onSuccess}
      />
    );
  }

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      {userEmail ? 'Book Appointment' : 'Book for Patient'}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book an Appointment</DialogTitle>
          <DialogDescription>
            Fill out this form to request an appointment. Our staff will contact you to confirm the date and time.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <BookingFormContent
            userEmail={userEmail}
            userName={userName}
            userPhone={userPhone}
            onSuccess={onSuccess}
            onDialogClose={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}