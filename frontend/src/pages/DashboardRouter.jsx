import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import AuthorityDashboard from './authority/AuthorityDashboard';

// Routes the /dashboard path to the correct dashboard based on the logged-in user's role.
export default function DashboardRouter() {
  const { user } = useAuth();
  if (user.role === 'student') return <StudentDashboard />;
  return <AuthorityDashboard />;
}
