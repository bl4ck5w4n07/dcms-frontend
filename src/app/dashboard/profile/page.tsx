'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { User, Mail, Phone, Shield, Calendar, CheckCircle, AlertCircle, Eye, EyeOff, Lock, MapPin, Cake } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Address } from '@/app/types/index';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Update state when user data changes
  useEffect(() => {
    if (user) {
      setBasicInfoData({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        birthdate: user?.birthdate || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
      });
      setContactInfoData({
        email: user?.email || '',
        phone: user?.phone || '',
      });
    }
  }, [user]);
  
  const [basicInfoData, setBasicInfoData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    birthdate: user?.birthdate || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || '',
  });

  const [contactInfoData, setContactInfoData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Change password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const fullName = `${basicInfoData.firstName} ${basicInfoData.lastName}`.trim();
      const address = {
        street: basicInfoData.street,
        city: basicInfoData.city,
        state: basicInfoData.state,
        zipCode: basicInfoData.zipCode,
        country: basicInfoData.country
      };

      const result = await updateProfile({
        name: fullName,
        birthdate: basicInfoData.birthdate,
        address: address
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Basic information updated successfully!' });
        setIsEditingBasic(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update basic information' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContactInfo = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateProfile({
        phone: contactInfoData.phone
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Contact information updated successfully!' });
        setIsEditingContact(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update contact information' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBasicInfo = () => {
    setBasicInfoData({
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      birthdate: user?.birthdate || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
    });
    setIsEditingBasic(false);
    setMessage(null);
  };

  const handleCancelContactInfo = () => {
    setContactInfoData({
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditingContact(false);
    setMessage(null);
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?\":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const passwordValidation = validatePassword(passwordData.newPassword);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordValidation.isValid) {
      toast.error('New password does not meet security requirements');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsPasswordDialogOpen(false);
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
              {!isEditingBasic && (
                <Button variant="outline" onClick={() => setIsEditingBasic(true)}>
                  Edit Basic Info
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditingBasic ? (
                  <Input
                    id="firstName"
                    value={basicInfoData.firstName}
                    onChange={(e) => setBasicInfoData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user?.name?.split(' ')[0] || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditingBasic ? (
                  <Input
                    id="lastName"
                    value={basicInfoData.lastName}
                    onChange={(e) => setBasicInfoData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{user?.name?.split(' ').slice(1).join(' ') || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Date of Birth</Label>
              {isEditingBasic ? (
                <Input
                  id="birthdate"
                  type="date"
                  value={basicInfoData.birthdate}
                  onChange={(e) => setBasicInfoData(prev => ({ ...prev, birthdate: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <Cake className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {user?.birthdate ? format(new Date(user.birthdate), 'MMMM dd, yyyy') : 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              {isEditingBasic ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Street Address"
                    value={basicInfoData.street}
                    onChange={(e) => setBasicInfoData(prev => ({ ...prev, street: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="City"
                      value={basicInfoData.city}
                      onChange={(e) => setBasicInfoData(prev => ({ ...prev, city: e.target.value }))}
                    />
                    <Input
                      placeholder="State"
                      value={basicInfoData.state}
                      onChange={(e) => setBasicInfoData(prev => ({ ...prev, state: e.target.value }))}
                    />
                    <Input
                      placeholder="ZIP Code"
                      value={basicInfoData.zipCode}
                      onChange={(e) => setBasicInfoData(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Country"
                    value={basicInfoData.country}
                    onChange={(e) => setBasicInfoData(prev => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    {user?.address ? (
                      <div>
                        {user.address.street && <div>{user.address.street}</div>}
                        <div>
                          {[user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ')}
                        </div>
                        {user.address.country && <div>{user.address.country}</div>}
                      </div>
                    ) : (
                      'Not provided'
                    )}
                  </div>
                </div>
              )}
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

            {isEditingBasic && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveBasicInfo} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Basic Info'}
                </Button>
                <Button variant="outline" onClick={handleCancelBasicInfo} className="flex-1">
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
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              {!isEditingContact && (
                <Button variant="outline" onClick={() => setIsEditingContact(true)}>
                  Edit Contact Info
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditingContact ? (
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfoData.phone}
                  onChange={(e) => setContactInfoData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{user.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Account Role</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <Badge className={roleDisplay.color}>
                  {roleDisplay.label}
                </Badge>
              </div>
            </div>

            {isEditingContact && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveContactInfo} disabled={isSaving} className="flex-1">
                  {isSaving ? 'Saving...' : 'Save Contact Info'}
                </Button>
                <Button variant="outline" onClick={handleCancelContactInfo} className="flex-1">
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
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                      </DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new secure password for your account.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                            placeholder="Enter your current password"
                            required
                            autoComplete="current-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                            placeholder="Enter your new password"
                            required
                            autoComplete="new-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your new password"
                            required
                            autoComplete="new-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      {passwordData.newPassword && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                          <div className="space-y-1 text-xs">
                            <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className={`h-3 w-3 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}`} />
                              At least 8 characters
                            </div>
                            <div className={`flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className={`h-3 w-3 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-gray-400'}`} />
                              One uppercase letter
                            </div>
                            <div className={`flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className={`h-3 w-3 ${passwordValidation.hasLower ? 'text-green-600' : 'text-gray-400'}`} />
                              One lowercase letter
                            </div>
                            <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className={`h-3 w-3 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}`} />
                              One number
                            </div>
                            <div className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                              <CheckCircle className={`h-3 w-3 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-400'}`} />
                              One special character
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1" 
                          disabled={isChangingPassword || !passwordValidation.isValid || passwordData.newPassword !== passwordData.confirmPassword}
                        >
                          {isChangingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setIsPasswordDialogOpen(false);
                          }}
                          disabled={isChangingPassword}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <p className="text-xs text-gray-500">
                Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
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