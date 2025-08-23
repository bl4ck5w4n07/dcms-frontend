'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Edit3 } from 'lucide-react';
import { projectId, publicAnonKey } from '@/mock/supabase/info';
import { format } from 'date-fns';

interface Note {
  id: string;
  content: string;
  authorEmail: string;
  authorRole: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  reason: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  appointmentDate?: string;
  appointmentTime?: string;
  dentistName?: string;
  createdAt: string;
  updatedAt: string;
  needsStaffConfirmation?: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: string;
  userEmail: string;
  onUpdate: () => void;
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

export function AppointmentCard({ appointment, userRole, userEmail, onUpdate }: AppointmentCardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    dentistName: ''
  });

  const canAddNotes = userRole === 'dentist' || userRole === 'admin';
  const canManageAppointments = userRole === 'admin' || userRole === 'staff'; // Staff and admin can manage appointments
  const canConfirmAppointments = userRole === 'admin' || userRole === 'staff'; // Staff and admin can confirm appointments
  const canViewNotes = true; // Everyone can view notes

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments/${appointment.id}/notes`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-455ee360/appointments/${appointment.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          content: newNote,
          authorEmail: userEmail,
          authorRole: userRole
        })
      });

      if (response.ok) {
        setNewNote('');
        fetchNotes();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const updateAppointmentStatus = async (newStatus: string, additionalData?: any) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData
        })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!confirmationData.appointmentDate || !confirmationData.appointmentTime || !confirmationData.dentistName) {
      alert('Please fill in all confirmation details');
      return;
    }

    await updateAppointmentStatus('confirmed', {
      appointmentDate: confirmationData.appointmentDate,
      appointmentTime: confirmationData.appointmentTime,
      dentistName: confirmationData.dentistName,
      needsStaffConfirmation: false
    });
    
    setIsConfirming(false);
  };

  const handleNotesClick = () => {
    if (!showNotes) {
      fetchNotes();
    }
    setShowNotes(!showNotes);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {userRole === 'patient' ? 'Your Appointment' : appointment.patientName}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
              {appointment.needsStaffConfirmation && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  Needs Confirmation
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Requested: {format(new Date(appointment.createdAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Patient Info - Hidden for patients viewing their own appointments */}
        {userRole !== 'patient' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{appointment.patientEmail}</span>
            </div>
            {appointment.patientPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{appointment.patientPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Appointment Details */}
        {appointment.appointmentDate && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{appointment.appointmentTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{appointment.dentistName}</span>
            </div>
          </div>
        )}

        {/* Reason & Message */}
        {(appointment.reason || appointment.message) && (
          <div className="space-y-2">
            {appointment.reason && (
              <div>
                <Label className="text-sm font-medium">
                  {userRole === 'patient' ? 'Note:' : 'Reason for Visit:'}
                </Label>
                <p className="text-sm text-gray-700">{appointment.reason}</p>
              </div>
            )}
            {appointment.message && (
              <div>
                <Label className="text-sm font-medium">Additional Information:</Label>
                <p className="text-sm text-gray-700">{appointment.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Staff Actions */}
          {canConfirmAppointments && appointment.status === 'pending' && (
            <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  Confirm Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Appointment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={confirmationData.appointmentDate}
                      onChange={(e) => setConfirmationData(prev => ({
                        ...prev,
                        appointmentDate: e.target.value
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Appointment Time</Label>
                    <Select
                      value={confirmationData.appointmentTime}
                      onValueChange={(value) => setConfirmationData(prev => ({
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

                  <div>
                    <Label htmlFor="dentist">Dentist</Label>
                    <Select
                      value={confirmationData.dentistName}
                      onValueChange={(value) => setConfirmationData(prev => ({
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

                  <div className="flex gap-2">
                    <Button onClick={handleConfirmAppointment} className="flex-1">
                      Confirm
                    </Button>
                    <Button variant="outline" onClick={() => setIsConfirming(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {canManageAppointments && appointment.status === 'confirmed' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateAppointmentStatus('completed')}
              >
                Complete
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateAppointmentStatus('cancelled')}
              >
                Cancel
              </Button>
            </>
          )}

          {/* Notes Button */}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleNotesClick}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Notes
          </Button>

          {/* Add Note Button (Dentists only) */}
          {canAddNotes && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                  <Edit3 className="h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={addNote} 
                      disabled={isAddingNote}
                      className="flex-1"
                    >
                      {isAddingNote ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Notes:</h4>
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="outline" className="text-xs">
                        {note.authorRole.charAt(0).toUpperCase() + note.authorRole.slice(1)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}