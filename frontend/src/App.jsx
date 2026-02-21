import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import LecturerPortal from './pages/LecturerPortal';
import HODPortal from './pages/HODPortal';

// Import other portals as we build them...

// Security Wrapper: Checks if user is logged in and has the right role
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-indigo-600 font-semibold">Loading Lectro...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.role !== allowedRole && allowedRole !== 'any') return <Navigate to="/" />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route path="/student-dashboard" element={
            <ProtectedRoute allowedRole="student">
              <StudentPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/lecturer-dashboard" element={
            <ProtectedRoute allowedRole="lecturer">
                <LecturerPortal />
            </ProtectedRoute>
            } />

            <Route path="/hod-dashboard" element={
            <ProtectedRoute allowedRole="hod">
                <HODPortal />
            </ProtectedRoute>
            } />


          {/* Future Routes */}
          {/* <Route path="/hod-dashboard" element={<ProtectedRoute allowedRole="hod"><HODPortal /></ProtectedRoute>} /> */}
          
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;