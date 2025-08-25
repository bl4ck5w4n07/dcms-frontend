'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Separator } from '../../../../components/ui/separator';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { User, Mail, Phone, Calendar, Clock, ArrowLeft, Plus, History, FileText, Heart, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../../../contexts/AuthContext';
import { usePatients } from '../../../../contexts/PatientContext';
import { useAppointments } from '../../../../contexts/AppointmentContext';
import { useServices } from '../../../../contexts/ServiceContext';
import { toast } from 'sonner';

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

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getPatientById } = usePatients();
  const { getAppointmentsByPatient, createAppointment, updateAppointment, refreshAppointments } = useAppointments();
  const { getPatientServiceHistory, fetchServiceHistory, fetchMedicalHistory, updateMedicalHistory } = useServices();
  
  const [patient, setPatient] = useState<any>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [showScheduling, setShowScheduling] = useState(false);
  const [showMedicalEdit, setShowMedicalEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedulingData, setSchedulingData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    dentistName: '',
    reason: 'Follow-up appointment'
  });
  const [medicalData, setMedicalData] = useState<{
    allergies: string[];
    medications: string[];
    medicalConditions: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    insuranceInfo: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
    };
    notes: string;
  }>({
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    insuranceInfo: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    },
    notes: ''
  });

  const canViewPatients = user?.role === 'staff' || user?.role === 'dentist' || user?.role === 'admin';

  useEffect(() => {
    if (!canViewPatients) {
      router.push('/dashboard/patients');
      return;
    }

    const patientId = params.id as string;
    if (patientId) {
      const foundPatient = getPatientById(patientId);
      if (foundPatient) {
        setPatient(foundPatient);
        const appointments = getAppointmentsByPatient(foundPatient.email);
        setPatientAppointments(appointments);
        
        // Load service history
        fetchServiceHistory(foundPatient.email);
        const services = getPatientServiceHistory(foundPatient.email);
        setServiceHistory(services);
        
        // Load medical history
        fetchMedicalHistory(foundPatient.email).then(history => {
          if (history) {
            setMedicalHistory(history);
            setMedicalData({
              allergies: history.allergies || [],
              medications: history.medications || [],
              medicalConditions: history.medicalConditions || [],
              emergencyContact: history.emergencyContact || { name: '', phone: '', relationship: '' },
              insuranceInfo: history.insuranceInfo || { provider: '', policyNumber: '', groupNumber: '' },
              notes: history.notes || ''
            });
          }
        });
        
        // Set default date to today for scheduling
        const today = new Date().toISOString().split('T')[0];
        setSchedulingData(prev => ({
          ...prev,
          appointmentDate: today
        }));
      } else {
        toast.error('Patient not found');
        router.push('/dashboard/patients');
      }
    }
    setIsLoading(false);
  }, [params.id, canViewPatients, router]);

  const hasScheduledAppointment = patientAppointments.some(apt => 
    apt.date && apt.time && apt.status !== 'cancelled'
  );

  const handleScheduleAppointment = async () => {
    if (!patient) return;
    
    if (!schedulingData.appointmentDate || !schedulingData.appointmentTime || !schedulingData.dentistName) {
      toast.error('Please fill in all appointment details');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if patient already has a pending appointment
      const existingPendingAppointment = patientAppointments.find(apt => 
        apt.status === 'pending' && (!apt.date || !apt.time)
      );

      let result;
      
      if (existingPendingAppointment) {
        // Update existing pending appointment with scheduling details
        result = await updateAppointment(existingPendingAppointment.id, {
          date: schedulingData.appointmentDate,
          time: schedulingData.appointmentTime,
          dentistName: schedulingData.dentistName,
          status: 'pending'
        });
      } else {
        // Create new appointment
        const appointmentResult = await createAppointment({
          patientName: patient.name,
          patientEmail: patient.email,
          patientPhone: patient.phone || '',
          reason: schedulingData.reason
        });

        if (appointmentResult.success && appointmentResult.appointment) {
          // Update the new appointment with scheduling details
          result = await updateAppointment(appointmentResult.appointment.id, {
            date: schedulingData.appointmentDate,
            time: schedulingData.appointmentTime,
            dentistName: schedulingData.dentistName,
            status: 'pending'
          });
        } else {
          throw new Error(appointmentResult.error || 'Failed to create appointment');
        }
      }

      if (result && result.success) {
        toast.success('Appointment scheduled successfully');
        setShowScheduling(false);
        setSchedulingData({
          appointmentDate: '',
          appointmentTime: '',
          dentistName: '',
          reason: 'Follow-up appointment'
        });
        
        // Refresh appointments data
        await refreshAppointments();
        const updatedAppointments = getAppointmentsByPatient(patient.email);
        setPatientAppointments(updatedAppointments);
      } else {
        toast.error(result?.error || 'Failed to schedule appointment');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Appointment scheduling error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (!canViewPatients) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Patient not found</p>
            <Button onClick={() => router.push('/dashboard/patients')} className="mt-4">
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/dashboard/patients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
          <p className="text-gray-600 mt-1">Manage patient information and appointments</p>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/patients/${patient.id}/appointments`)}
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          View Full History
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="services">Service History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <p className="text-base">{patient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient Type</Label>
                  <div className="flex gap-2">
                    <Badge variant={patient.isWalkIn ? "outline" : "default"}>
                      {patient.isWalkIn ? 'Walk-in' : 'Registered'}
                    </Badge>
                    <Badge variant={patient.canLogin ? "secondary" : "outline"} className="text-xs">
                      {patient.canLogin ? 'Can Login' : 'No Login'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">{patient.email}</p>
                  </div>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{patient.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <Label className="text-sm font-medium text-gray-600">Registered</Label>
                  <p className="text-sm">
                    {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                    {patient.createdBy && <span className="text-gray-500"> by {patient.createdBy}</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{patientAppointments.length}</div>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{serviceHistory.length}</div>
                <p className="text-sm text-gray-600">Services Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${serviceHistory.reduce((total, service) => total + service.cost, 0)}
                </div>
                <p className="text-sm text-gray-600">Total Amount</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Appointments</CardTitle>
                {patient.isWalkIn && !hasScheduledAppointment && (
                  <Button 
                    onClick={() => setShowScheduling(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Appointment
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {patientAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No appointments found</p>
                  {patient.isWalkIn && (
                    <Button 
                      onClick={() => setShowScheduling(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Schedule First Appointment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {patientAppointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {appointment.status}
                          </Badge>
                          {appointment.date && appointment.time && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(appointment.date), 'MMM dd, yyyy')}
                              <Clock className="h-3 w-3 ml-2" />
                              {appointment.time}
                            </div>
                          )}
                        </div>
                        {!appointment.date && !appointment.time && patient.isWalkIn && (
                          <Button 
                            onClick={() => setShowScheduling(true)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Schedule
                          </Button>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Reason:</strong> {appointment.reason}</div>
                        {appointment.dentistName && (
                          <div><strong>Dentist:</strong> {appointment.dentistName}</div>
                        )}
                        <div className="text-gray-500">
                          Created: {format(new Date(appointment.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientAppointments.length > 5 && (
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/patients/${patient.id}/appointments`)}
                      className="w-full"
                    >
                      View All {patientAppointments.length} Appointments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scheduling Form */}
          {showScheduling && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={schedulingData.reason}
                    onChange={(e) => setSchedulingData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    placeholder="Enter reason for appointment"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={schedulingData.appointmentDate}
                    onChange={(e) => setSchedulingData(prev => ({
                      ...prev,
                      appointmentDate: e.target.value
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Appointment Time</Label>
                  <Select
                    value={schedulingData.appointmentTime}
                    onValueChange={(value) => setSchedulingData(prev => ({
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
                    value={schedulingData.dentistName}
                    onValueChange={(value) => setSchedulingData(prev => ({
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
                  <Button 
                    onClick={handleScheduleAppointment}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowScheduling(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical History
                </CardTitle>
                <Button 
                  onClick={() => setShowMedicalEdit(!showMedicalEdit)}
                  variant="outline"
                  size="sm"
                >
                  {showMedicalEdit ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {medicalHistory ? (
                <>
                  {/* Allergies */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Allergies
                    </Label>
                    <div className="mt-2">
                      {medicalHistory.allergies?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {medicalHistory.allergies.map((allergy: string, index: number) => (
                            <Badge key={index} variant="destructive">{allergy}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No known allergies</p>
                      )}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Medications</Label>
                    <div className="mt-2">
                      {medicalHistory.medications?.length > 0 ? (
                        <div className="space-y-1">
                          {medicalHistory.medications.map((medication: string, index: number) => (
                            <div key={index} className="text-sm bg-blue-50 p-2 rounded border">
                              {medication}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No current medications</p>
                      )}
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Medical Conditions</Label>
                    <div className="mt-2">
                      {medicalHistory.medicalConditions?.length > 0 ? (
                        <div className="space-y-1">
                          {medicalHistory.medicalConditions.map((condition: string, index: number) => (
                            <div key={index} className="text-sm bg-yellow-50 p-2 rounded border">
                              {condition}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No medical conditions recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div><strong>Name:</strong> {medicalHistory.emergencyContact?.name || 'Not provided'}</div>
                        <div><strong>Phone:</strong> {medicalHistory.emergencyContact?.phone || 'Not provided'}</div>
                        <div><strong>Relationship:</strong> {medicalHistory.emergencyContact?.relationship || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Info */}
                  {medicalHistory.insuranceInfo && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Insurance Information</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div><strong>Provider:</strong> {medicalHistory.insuranceInfo.provider || 'Not provided'}</div>
                          <div><strong>Policy #:</strong> {medicalHistory.insuranceInfo.policyNumber || 'Not provided'}</div>
                          <div><strong>Group #:</strong> {medicalHistory.insuranceInfo.groupNumber || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Medical Notes</Label>
                    <div className="mt-2">
                      {medicalHistory.notes ? (
                        <p className="text-sm p-3 bg-gray-50 rounded border">{medicalHistory.notes}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">No medical notes</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last updated: {format(new Date(medicalHistory.lastUpdated), 'MMM dd, yyyy HH:mm')} by {medicalHistory.updatedBy}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No medical history recorded</p>
                  <Button onClick={() => setShowMedicalEdit(true)} variant="outline">
                    Add Medical History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service History Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service History ({serviceHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No services recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceHistory.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="default">
                            {service.status}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(service.date), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          ${service.cost}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-base mb-1">{service.serviceName}</h4>
                          <p><strong>Performed by:</strong> {service.performedByName}</p>
                          {service.appointmentId && (
                            <p><strong>Appointment ID:</strong> {service.appointmentId.slice(-6)}</p>
                          )}
                        </div>
                        <div>
                          {service.notes && (
                            <div>
                              <p><strong>Notes:</strong></p>
                              <p className="text-gray-600 mt-1">{service.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}