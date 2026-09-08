import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import HowItWorks from './pages/public/HowItWorks';
import About from './pages/public/About';

import DashboardRouter from './pages/DashboardRouter';
import SubmitComplaint from './pages/student/SubmitComplaint';
import MyComplaints from './pages/student/MyComplaints';
import TrackComplaint from './pages/student/TrackComplaint';

import ComplaintManagement from './pages/authority/ComplaintManagement';
import Analytics from './pages/authority/Analytics';
import WeeklyReports from './pages/authority/WeeklyReports';
import MentorDashboard from './pages/authority/MentorDashboard';

import UserManagement from './pages/admin/UserManagement';
import RecurringIssues from './pages/admin/RecurringIssues';

import ComplaintDetails from './pages/ComplaintDetails';

const AUTHORITY_ROLES = ['cr', 'mentor', 'hod', 'principal', 'admin'];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about" element={<About />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />

      {/* Student-only */}
      <Route path="/submit-complaint" element={<ProtectedRoute roles={['student']}><SubmitComplaint /></ProtectedRoute>} />
      <Route path="/my-complaints" element={<ProtectedRoute roles={['student']}><MyComplaints /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute roles={['student']}><TrackComplaint /></ProtectedRoute>} />

      {/* Authority */}
      <Route path="/complaint-management" element={<ProtectedRoute roles={AUTHORITY_ROLES}><ComplaintManagement /></ProtectedRoute>} />
      <Route path="/mentor-dashboard" element={<ProtectedRoute roles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute roles={['hod', 'principal', 'admin']}><Analytics /></ProtectedRoute>} />
      <Route path="/weekly-reports" element={<ProtectedRoute roles={['mentor', 'hod', 'principal', 'admin']}><WeeklyReports /></ProtectedRoute>} />

      {/* Admin-only */}
      <Route path="/user-management" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
      <Route path="/recurring-issues" element={<ProtectedRoute roles={['admin']}><RecurringIssues /></ProtectedRoute>} />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
