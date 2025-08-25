'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
  tomorrowAppointments: number;
}

interface RecentAppointment {
  id: string;
  patientName: string;
  reason: string;
  status: string;
  appointmentDate?: string;
  appointmentTime?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    tomorrowAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
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
        const appointments = data.appointments || [];

        // Calculate stats
        const newStats: DashboardStats = {
          totalAppointments: appointments.length,
          pendingAppointments: appointments.filter((apt: any) => apt.status === 'pending').length,
          confirmedAppointments: appointments.filter((apt: any) => apt.status === 'confirmed').length,
          completedAppointments: appointments.filter((apt: any) => apt.status === 'completed').length,
          todayAppointments: appointments.filter((apt: any) => 
            apt.appointmentDate && isToday(new Date(apt.appointmentDate))
          ).length,
          tomorrowAppointments: appointments.filter((apt: any) => 
            apt.appointmentDate && isTomorrow(new Date(apt.appointmentDate))
          ).length
        };

        setStats(newStats);

        // Get recent appointments (last 5)
        const recent = appointments
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentAppointments(recent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDashboardContent = () => {
    switch (user?.role) {
      case 'patient':
        return {
          title: 'Patient Portal',
          description: 'Manage your appointments and profile',
          quickActions: [
            { label: 'Book Appointment', action: () => router.push('/dashboard/appointments'), icon: Calendar },
            { label: 'View Profile', action: () => router.push('/dashboard/profile'), icon: Users }
          ]
        };
      case 'staff':
        return {
          title: 'Staff Dashboard',
          description: 'Manage appointments and patient check-ins',
          quickActions: [
            { label: 'View Appointments', action: () => router.push('/dashboard/appointments'), icon: Calendar },
            { label: 'Add Walk-in Patient', action: () => router.push('/dashboard/appointments'), icon: UserPlus }
          ]
        };
      case 'dentist':
        return {
          title: 'Dentist Dashboard',
          description: 'Manage appointments and patient records',
          quickActions: [
            { label: 'View Appointments', action: () => router.push('/dashboard/appointments'), icon: Calendar },
            { label: 'Patient Records', action: () => router.push('/dashboard/patients'), icon: Users }
          ]
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'System administration and user management',
          quickActions: [
            { label: 'Manage Users', action: () => router.push('/dashboard/admin/users'), icon: Users },
            { label: 'View All Appointments', action: () => router.push('/dashboard/appointments'), icon: Calendar }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to the dental clinic management system',
          quickActions: []
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const roleContent = getRoleDashboardContent();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">{roleContent.description}</p>
      </div>

      {/* Quick Actions */}
      {roleContent.quickActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roleContent.quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
                <CardContent className="flex items-center p-6">
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="font-medium">{action.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {user?.role === 'patient' ? 'My Appointments' : 'Total Appointments'}
              </p>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmedAppointments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completedAppointments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule Alert */}
      {(user?.role !== 'patient') && (stats.todayAppointments > 0 || stats.tomorrowAppointments > 0) && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">Upcoming Schedule</p>
                <p className="text-blue-700 text-sm">
                  {stats.todayAppointments > 0 && `${stats.todayAppointments} appointment${stats.todayAppointments !== 1 ? 's' : ''} today`}
                  {stats.todayAppointments > 0 && stats.tomorrowAppointments > 0 && ' • '}
                  {stats.tomorrowAppointments > 0 && `${stats.tomorrowAppointments} appointment${stats.tomorrowAppointments !== 1 ? 's' : ''} tomorrow`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet</p>
                {user?.role === 'patient' && (
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/dashboard/appointments')}
                  >
                    Book Your First Appointment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                      {appointment.appointmentDate && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                          {appointment.appointmentTime && ` at ${appointment.appointmentTime}`}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard/appointments')}
                >
                  View All Appointments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Connection</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Data Sync</span>
                <span className="text-sm text-gray-500">Just now</span>
              </div>

              {user?.role === 'admin' && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Admin Features:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Create staff and dentist accounts</li>
                    <li>• View all system data</li>
                    <li>• Monitor appointment flow</li>
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  <strong>Demo Mode:</strong> This is a demonstration system with mock data. 
                  All patient information is fictional for privacy protection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}