"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useAuth, Role } from "./auth/auth-context";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Appointment {
  id: string;
  firstName: string;
  lastName: string;
  contact: {
    method: string;
    value: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  preferredDate?: string;
  preferredTime?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  totalStaff: number;
  totalDentists: number;
}

interface DashboardStatsProps {
  role: Role;
}

export function DashboardStats({ role }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [role, user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stats (for admin, staff, dentist)
      if (role !== 'patient') {
        const statsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-15d1e443/api/stats`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }
      }

      // Fetch appointments
      const appointmentsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-15d1e443/api/appointments?role=${role}&userId=${user?.id || ''}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-15d1e443/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Appointment ${newStatus}`);
        fetchData(); // Refresh data
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Stats cards for non-patient roles */}
      {role !== 'patient' && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedAppointments}</div>
              <p className="text-xs text-muted-foreground">Ready for treatment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAppointments}</div>
              <p className="text-xs text-muted-foreground">Successfully treated</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointments list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {role === 'patient' ? 'My Appointments' : 'Recent Appointments'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">No appointments found.</p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 10).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {appointment.firstName} {appointment.lastName}
                      </h4>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {appointment.contact.method === 'email' ? '📧' : '📱'} {appointment.contact.value}
                    </p>
                    {appointment.preferredDate && (
                      <p className="text-sm text-muted-foreground">
                        📅 {appointment.preferredDate} {appointment.preferredTime && `at ${appointment.preferredTime}`}
                      </p>
                    )}
                    {appointment.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        💬 {appointment.reason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {new Date(appointment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Action buttons for staff/admin/dentist */}
                  {role !== 'patient' && appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  
                  {role !== 'patient' && appointment.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}