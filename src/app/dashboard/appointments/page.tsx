'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { BookingForm } from '../../../components/BookingForm';
import { Calendar, Clock, Users, UserPlus, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

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
  type?: string;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const canManageAppointments = user?.role === 'admin' || user?.role === 'staff';
  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';
  const canBookForPatients = user?.role === 'staff' || user?.role === 'dentist' || user?.role === 'admin';
  const isPatient = user?.role === 'patient';

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.email) params.append('userEmail', user.email);
      if (user?.role) params.append('role', user.role);

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c89a26e4/appointments?${params}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const filterAppointments = (status?: string) => {
    if (!status || status === 'all') return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(apt => apt.status === status).length;
  };

  const getPendingConfirmations = () => {
    return appointments.filter(apt => apt.needsStaffConfirmation && apt.status === 'pending').length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            {isPatient ? 'Your appointment history' : 'Manage patient appointments'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAppointments} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          {isPatient && (
            <BookingForm
              userEmail={user?.email}
              userName={user?.name}
              userPhone={user?.phone}
              onSuccess={fetchAppointments}
              asDialog={true}
            />
          )}
          
          {canBookForPatients && (
            <BookingForm onSuccess={fetchAppointments} asDialog={true} />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold">{getStatusCount('all')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{getStatusCount('pending')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold">{getStatusCount('confirmed')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserPlus className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{getStatusCount('completed')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Confirmations Alert */}
      {canManageAppointments && getPendingConfirmations() > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <p className="text-orange-800">
                <strong>{getPendingConfirmations()}</strong> appointment{getPendingConfirmations() !== 1 ? 's' : ''} 
                {' '}need{getPendingConfirmations() === 1 ? 's' : ''} staff confirmation with date and time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-1">{getStatusCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending <Badge variant="secondary" className="ml-1">{getStatusCount('pending')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed <Badge variant="secondary" className="ml-1">{getStatusCount('confirmed')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed <Badge variant="secondary" className="ml-1">{getStatusCount('completed')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled <Badge variant="secondary" className="ml-1">{getStatusCount('cancelled')}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filterAppointments(activeTab).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeTab === 'all' 
                      ? 'No appointments found' 
                      : `No ${activeTab} appointments`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterAppointments(activeTab).map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole={user?.role || 'patient'}
                  userEmail={user?.email || ''}
                  onUpdate={fetchAppointments}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}