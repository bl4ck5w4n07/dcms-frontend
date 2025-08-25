'use client';

import { useAuth } from '../../contexts/AuthContext';
import { Navigation } from '../../components/Navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect non-authenticated users to homepage
    if (!user && !isLoading) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Get active section from pathname
  const getActiveSection = () => {
    const path = pathname.split('/').pop() || 'dashboard';
    return path;
  };

  // Handle section navigation
  const setActiveSection = (section: string) => {
    if (section === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard/${section}`);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation 
        activeSection={getActiveSection()} 
        setActiveSection={setActiveSection} 
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}