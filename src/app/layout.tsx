import type { Metadata } from 'next';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { Toaster } from '@/app/components/ui/sonner';
import '@/app/components/ui/globals.css';

export const metadata: Metadata = {
  title: 'Go-Goyagoy - Modern Dental Clinic Management',
  description: 'Complete dental clinic management system for appointments, patient records, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}