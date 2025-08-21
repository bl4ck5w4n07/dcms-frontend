'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { User, Mail, Phone, Shield, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditBasic, setisEditBasic] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setisEditBasic(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setisEditBasic(false);
    setMessage(null);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'System Administrator', color: 'bg-purple-100 text-purple-800' };
      case 'dentist': return { label: 'Dentist', color: 'bg-blue-100 text-blue-800' };
      case 'staff': return { label: 'Staff Member', color: 'bg-green-100 text-green-800' };
      case 'patient': return { label: 'Patient', color: 'bg-gray-100 text-gray-800' };
      default: return { label: role, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const roleDisplay = getRoleDisplay(user.role);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            {!isEditBasic && (
                <Button variant="outline" onClick={() => setisEditBasic(true)}>
                  Edit Basic Information
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name</Label>
                {isEditBasic ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user.first_name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Last Name</Label>
                {isEditBasic ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user.last_name}</span>
                  </div>
                )}
              </div>
                            
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <Badge className={roleDisplay.color}>
                    {roleDisplay.label}
                  </Badge>
                </div>
              </div>
            </div>

            {user.createdAt && (
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {format(new Date(user.createdAt), 'MMMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}

            {user.isWalkIn && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  This account was created as a walk-in patient. To enable full login access, please contact our staff to complete your registration.
                </AlertDescription>
              </Alert>
            )}
            {isEditBasic && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Contact Information</CardTitle>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Contact Information
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email address"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-gray-600">Change your account password</p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Password changes are not available in this demo version.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login Access Status */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {user.canLogin ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Login Enabled</p>
                    <p className="text-sm text-green-600">You can sign in to your account</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Login Pending</p>
                    <p className="text-sm text-yellow-600">
                      Contact staff to complete registration and enable login access
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}