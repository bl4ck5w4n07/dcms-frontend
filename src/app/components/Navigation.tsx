'use client';

import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Calendar,
  Users,
  FileText,
  PlusCircle,
  LogOut,
  Home,
  UserPlus,
  User,
  Shield
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Define menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ];

    switch (user.role) {
      case 'patient':
        return [
          ...baseItems,
          { id: 'appointments', label: 'My Appointments', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
        
      case 'dentist':
        return [
          ...baseItems,
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'patients', label: 'Patient Records', icon: Users },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
        
      case 'admin':
        return [
          ...baseItems,
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'patients', label: 'Patient Records', icon: Users },
          { id: 'admin/users', label: 'User Management', icon: Shield },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
        
      default: // staff
        return [
          ...baseItems,
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: User }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-800">
          {user?.role === 'patient' ? 'Patient Portal' : 'Dental Clinic'}
        </h1>
        <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">
          {user?.role === 'admin' ? 'Dentist (Admin)' : user?.role}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            signOut();
            router.push('/');
          }}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};