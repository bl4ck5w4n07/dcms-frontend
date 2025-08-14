"use client";

import { DashboardStats } from "@components/DashboardStats";
import { useAuth } from "@components/auth/auth-context";

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Manage your appointments and health records.
        </p>
      </div>

      <DashboardStats role="patient" />
    </div>
  );
}