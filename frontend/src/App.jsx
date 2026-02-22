import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

import Login from './pages/Login';
import StudentPortal from './pages/StudentPortal';
import LecturerPortal from './pages/LecturerPortal';
import HODPortal from './pages/HODPortal';
import TOPortal from './pages/TOPortal';
import AdminPortal from './pages/AdminPortal';

// Security Wrapper: Checks if user is logged in and has the right role [cite: 187]
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  // The New Premium Loading Screen
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30"
          >
            <BookOpen className="text-white w-8 h-8" />
          </motion.div>
          
          <div className="flex space-x-2">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          </div>
          
          <p className="mt-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Loading Workspace
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" />; // 
  if (user.role !== allowedRole && allowedRole !== 'any') return <Navigate to="/" />; // [cite: 189]

  return children; // [cite: 189]
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
            
            <Route path="/to-dashboard" element={
              <ProtectedRoute allowedRole="technical_officer">
                <TOPortal />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRole="admin">
                <AdminPortal />
              </ProtectedRoute>
            } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;