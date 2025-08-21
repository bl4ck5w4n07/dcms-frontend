import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Add logging
app.use('*', logger(console.log));

// Initialize demo data
async function initializeDemoData() {
  try {
    console.log('Checking for existing demo data...');
    
    // Always try to recreate demo data to ensure it's fresh
    const allUsers = await kv.getByPrefix('dcms:user:');
    console.log('Current users in database:', allUsers.length);

    console.log('Creating/updating demo data...');

    // Create demo users
    const demoUsers = [
      {
        email: 'admin@localhost',
        user: {
          id: 'admin-1',
          email: 'admin@localhost',
          password: 'c1$Vg4unme',
          name: 'System Administrator',
          role: 'admin',
          canLogin: true,
          createdAt: new Date().toISOString()
        }
      },
      {
        email: 'dentist@dentalclinic.com',
        user: {
          id: 'dentist-1',
          email: 'dentist@dentalclinic.com',
          password: 'password123',
          name: 'Dr. Sarah Johnson',
          role: 'dentist',
          canLogin: true,
          createdAt: new Date().toISOString()
        }
      },
      {
        email: 'staff@dentalclinic.com',
        user: {
          id: 'staff-1',
          email: 'staff@dentalclinic.com',
          password: 'password123',
          name: 'Mary Chen',
          role: 'staff',
          canLogin: true,
          createdAt: new Date().toISOString()
        }
      },
      {
        email: 'patient@example.com',
        user: {
          id: 'patient-1',
          email: 'patient@example.com',
          password: 'password123',
          name: 'John Smith',
          phone: '(555) 123-4567',
          role: 'patient',
          canLogin: true,
          createdAt: new Date().toISOString()
        }
      }
    ];

    // Create demo users
    for (const { email, user } of demoUsers) {
      await kv.set(`dcms:user:${email}`, user);
      console.log(`Created user: ${email} (${user.role})`);
    }

    // Create a demo appointment
    const demoAppointment = {
      id: 'apt-demo-1',
      patientName: 'John Smith',
      patientEmail: 'patient@example.com',
      patientPhone: '(555) 123-4567',
      reason: 'Routine checkup and cleaning',
      status: 'pending',
      needsStaffConfirmation: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set('dcms:appointment:apt-demo-1', demoAppointment);
    await kv.set('dcms:user-appointments:patient@example.com', ['apt-demo-1']);

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
}

// Initialize demo data on startup
initializeDemoData();

// Health check endpoint
app.get('/make-server-c89a26e4/health', async (c) => {
  const allUsers = await kv.getByPrefix('dcms:user:');
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    userCount: allUsers.length,
    users: allUsers.map(u => ({ email: u.email, role: u.role, canLogin: u.canLogin }))
  });
});

// Auth endpoints
app.post('/make-server-c89a26e4/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('Sign-in attempt for email:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Get user from KV store
    const userKey = `dcms:user:${email}`;
    const user = await kv.get(userKey);
    
    if (!user) {
      console.log('User not found for email:', email);
      return c.json({ error: 'No account exists with this email address' }, 401);
    }

    if (user.password !== password) {
      console.log('Incorrect password for email:', email);
      return c.json({ error: 'Incorrect password' }, 401);
    }

    console.log('Sign-in successful for:', email, 'Role:', user.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log('Sign-in error:', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

app.post('/make-server-c89a26e4/auth/signup', async (c) => {
  try {
    const { email, password, name, phone, role = 'patient' } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`dcms:user:${email}`);
    if (existingUser) {
      return c.json({ error: 'Account already exists with this email' }, 409);
    }

    const user = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      phone: phone || '',
      role,
      createdAt: new Date().toISOString(),
      canLogin: role === 'patient' // Walk-in patients can't login until they register
    };

    await kv.set(`dcms:user:${email}`, user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log('Sign-up error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Appointment endpoints
app.post('/make-server-c89a26e4/appointments', async (c) => {
  try {
    const appointmentData = await c.req.json();
    const appointmentId = crypto.randomUUID();
    
    const appointment = {
      id: appointmentId,
      ...appointmentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`dcms:appointment:${appointmentId}`, appointment);
    
    // Add to user's appointments list
    if (appointmentData.patientEmail) {
      const userAppointments = await kv.get(`dcms:user-appointments:${appointmentData.patientEmail}`) || [];
      userAppointments.push(appointmentId);
      await kv.set(`dcms:user-appointments:${appointmentData.patientEmail}`, userAppointments);
    }

    return c.json({ appointment });
  } catch (error) {
    console.log('Create appointment error:', error);
    return c.json({ error: 'Failed to create appointment' }, 500);
  }
});

app.get('/make-server-c89a26e4/appointments', async (c) => {
  try {
    const userEmail = c.req.query('userEmail');
    const role = c.req.query('role');

    if (role === 'patient' && userEmail) {
      // Get patient's appointments only
      const appointmentIds = await kv.get(`dcms:user-appointments:${userEmail}`) || [];
      const appointments = [];
      
      for (const id of appointmentIds) {
        const appointment = await kv.get(`dcms:appointment:${id}`);
        if (appointment) appointments.push(appointment);
      }
      
      return c.json({ appointments });
    } else {
      // Staff/Dentist/Admin can see all appointments
      const allAppointments = await kv.getByPrefix('dcms:appointment:');
      return c.json({ appointments: allAppointments });
    }
  } catch (error) {
    console.log('Get appointments error:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

app.put('/make-server-c89a26e4/appointments/:id', async (c) => {
  try {
    const appointmentId = c.req.param('id');
    const updates = await c.req.json();
    
    const appointment = await kv.get(`dcms:appointment:${appointmentId}`);
    if (!appointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    const updatedAppointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`dcms:appointment:${appointmentId}`, updatedAppointment);
    return c.json({ appointment: updatedAppointment });
  } catch (error) {
    console.log('Update appointment error:', error);
    return c.json({ error: 'Failed to update appointment' }, 500);
  }
});

// Notes endpoints
app.post('/make-server-c89a26e4/appointments/:id/notes', async (c) => {
  try {
    const appointmentId = c.req.param('id');
    const { content, authorEmail, authorRole } = await c.req.json();
    
    const noteId = crypto.randomUUID();
    const note = {
      id: noteId,
      appointmentId,
      content,
      authorEmail,
      authorRole,
      createdAt: new Date().toISOString()
    };

    await kv.set(`dcms:note:${noteId}`, note);
    
    // Add to appointment's notes list
    const appointmentNotes = await kv.get(`dcms:appointment-notes:${appointmentId}`) || [];
    appointmentNotes.push(noteId);
    await kv.set(`dcms:appointment-notes:${appointmentId}`, appointmentNotes);

    return c.json({ note });
  } catch (error) {
    console.log('Create note error:', error);
    return c.json({ error: 'Failed to create note' }, 500);
  }
});

app.get('/make-server-c89a26e4/appointments/:id/notes', async (c) => {
  try {
    const appointmentId = c.req.param('id');
    const noteIds = await kv.get(`dcms:appointment-notes:${appointmentId}`) || [];
    const notes = [];
    
    for (const id of noteIds) {
      const note = await kv.get(`dcms:note:${id}`);
      if (note) notes.push(note);
    }
    
    return c.json({ notes });
  } catch (error) {
    console.log('Get notes error:', error);
    return c.json({ error: 'Failed to fetch notes' }, 500);
  }
});

// Walk-in patient endpoint (staff only)
app.post('/make-server-c89a26e4/walk-in-patient', async (c) => {
  try {
    const { name, phone, email, staffEmail } = await c.req.json();
    
    // Create walk-in patient (can't login until they register)
    const patientId = crypto.randomUUID();
    const patient = {
      id: patientId,
      name,
      phone,
      email,
      role: 'patient',
      canLogin: false, // Cannot login until they register themselves
      createdBy: staffEmail,
      createdAt: new Date().toISOString(),
      isWalkIn: true
    };

    await kv.set(`dcms:user:${email}`, patient);
    return c.json({ patient });
  } catch (error) {
    console.log('Create walk-in patient error:', error);
    return c.json({ error: 'Failed to create walk-in patient' }, 500);
  }
});

// Profile update endpoint
app.put('/make-server-c89a26e4/profile/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const updates = await c.req.json();
    
    const user = await kv.get(`dcms:user:${email}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`dcms:user:${email}`, updatedUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Admin endpoints - create staff/dentist users
app.post('/make-server-c89a26e4/admin/users', async (c) => {
  try {
    const { email, password, name, role, createdByAdmin } = await c.req.json();
    
    if (role !== 'staff' && role !== 'dentist') {
      return c.json({ error: 'Admin can only create staff and dentist users' }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`dcms:user:${email}`);
    if (existingUser) {
      return c.json({ error: 'User already exists with this email' }, 409);
    }

    const user = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      role,
      canLogin: true,
      createdBy: createdByAdmin,
      createdAt: new Date().toISOString()
    };

    await kv.set(`dcms:user:${email}`, user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.log('Admin create user error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get all staff and dentists (admin only)
app.get('/make-server-c89a26e4/admin/users', async (c) => {
  try {
    const allUsers = await kv.getByPrefix('dcms:user:');
    const staffAndDentists = allUsers.filter(user => 
      user.role === 'staff' || user.role === 'dentist'
    ).map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return c.json({ users: staffAndDentists });
  } catch (error) {
    console.log('Get staff/dentists error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Change password endpoint (for logged-in users)
app.post('/make-server-c89a26e4/auth/change-password', async (c) => {
  try {
    const { email, currentPassword, newPassword } = await c.req.json();
    
    if (!email || !currentPassword || !newPassword) {
      return c.json({ error: 'Email, current password, and new password are required' }, 400);
    }

    // Get user from KV store
    const user = await kv.get(`dcms:user:${email}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return c.json({ error: 'Current password is incorrect' }, 400);
    }

    // Update password
    const updatedUser = {
      ...user,
      password: newPassword,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`dcms:user:${email}`, updatedUser);
    
    console.log(`Password changed for user: ${email}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Change password error:', error);
    return c.json({ error: 'Failed to change password' }, 500);
  }
});

// Forgot password endpoint
app.post('/make-server-c89a26e4/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Check if user exists
    const user = await kv.get(`dcms:user:${email}`);
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return c.json({ error: 'No account exists with this email address' }, 404);
    }

    // Generate secure reset token
    const resetToken = crypto.randomUUID();
    const tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour from now
    
    // Store reset token
    const resetData = {
      email,
      token: resetToken,
      expires: tokenExpiry,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`dcms:reset-token:${resetToken}`, resetData);
    
    // Generate reset link
    const resetLink = `${c.req.headers.get('origin') || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    console.log(`Password reset token generated for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link: ${resetLink}`);
    
    return c.json({ 
      success: true, 
      resetLink // In production, this would be sent via email instead of returned
    });
  } catch (error) {
    console.log('Forgot password error:', error);
    return c.json({ error: 'Failed to process password reset request' }, 500);
  }
});

// Reset password endpoint
app.post('/make-server-c89a26e4/auth/reset-password', async (c) => {
  try {
    const { token, email, newPassword } = await c.req.json();
    
    if (!token || !email || !newPassword) {
      return c.json({ error: 'Token, email, and new password are required' }, 400);
    }

    // Get reset token data
    const resetData = await kv.get(`dcms:reset-token:${token}`);
    if (!resetData) {
      console.log(`Invalid reset token attempted: ${token}`);
      return c.json({ error: 'Invalid or expired reset token' }, 400);
    }

    // Check if token has expired
    if (Date.now() > resetData.expires) {
      console.log(`Expired reset token attempted: ${token}`);
      // Clean up expired token
      await kv.del(`dcms:reset-token:${token}`);
      return c.json({ error: 'Reset token has expired' }, 400);
    }

    // Verify email matches token
    if (resetData.email !== email) {
      console.log(`Email mismatch for reset token: ${token}`);
      return c.json({ error: 'Token does not match email address' }, 400);
    }

    // Get user and update password
    const user = await kv.get(`dcms:user:${email}`);
    if (!user) {
      console.log(`User not found during password reset: ${email}`);
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user password
    const updatedUser = {
      ...user,
      password: newPassword,
      updatedAt: new Date().toISOString(),
      passwordResetAt: new Date().toISOString()
    };

    await kv.set(`dcms:user:${email}`, updatedUser);
    
    // Delete the reset token to prevent reuse
    await kv.del(`dcms:reset-token:${token}`);
    
    console.log(`Password successfully reset for user: ${email}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Reset password error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

Deno.serve(app.fetch);