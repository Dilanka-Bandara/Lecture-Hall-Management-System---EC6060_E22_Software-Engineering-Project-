import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bell, LogOut, Clock, MapPin, BookOpen, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';

const StudentPortal = () => {
  const { user, logout } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, attendanceRes] = await Promise.all([
        api.get('/timetables/my-schedule'),
        api.get('/timetables/my-attendance')
      ]);
      setTimetable(timetableRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Helper function to color the progress bar based on attendance percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Sidebar */}
      <motion.aside initial={{ x: -250 }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Lectro<span className="text-indigo-600">.</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button className="w-full flex items-center px-4 py-3 text-indigo-700 bg-indigo-50 rounded-xl font-medium transition-colors">
              <Calendar className="w-5 h-5 mr-3" /> Dashboard
            </button>
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors">
              <Bell className="w-5 h-5 mr-3" /> Notifications
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-800">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500">{user?.university_id}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex justify-between items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Academic Overview</h2>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Student Portal</h1>
          </motion.div>
          <div className="text-right text-slate-500">
            <p className="text-sm">Today is</p>
            <p className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">Syncing data...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left Column: Timetable (Takes up 2/3 of space) */}
            <div className="xl:col-span-2">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-500"/> Today's Schedule
              </h3>
              
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6">
                {timetable.length === 0 ? (
                  <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
                    No classes scheduled for today.
                  </div>
                ) : (
                  timetable.map((session) => (
                    <motion.div key={session.timetable_id} variants={itemVariants} className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="flex flex-col items-center justify-center w-24 py-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/50 transition-colors">
                            <span className="text-lg font-bold text-slate-800">{session.start_time.slice(0, 5)}</span>
                            <span className="text-xs font-medium text-slate-400 mt-1">to {session.end_time.slice(0, 5)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md tracking-wide">{session.subject_code}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{session.subject_name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
                              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-slate-400" /> {session.hall_name}</span>
                              <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-slate-400" /> {session.date.split('T')[0]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center justify-end">
                          <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

            {/* Right Column: Attendance Widget */}
            <div className="xl:col-span-1">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-indigo-500"/> Attendance Overview
              </h3>
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                {attendance.length === 0 ? (
                  <div className="text-center text-slate-500 py-6">No attendance records found.</div>
                ) : (
                  attendance.map((record) => (
                    <div key={record.subject_code}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{record.subject_code}</p>
                          <p className="text-xs text-slate-500 truncate w-32">{record.subject_name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900">{record.percentage}%</span>
                          <p className="text-xs text-slate-400">{record.attended_classes} / {record.total_classes} Classes</p>
                        </div>
                      </div>
                      {/* Custom Tailwind Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${record.percentage}%` }} 
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-2.5 rounded-full ${getProgressColor(record.percentage)}`}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Notification Slide-Out Panel */}
      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />

    </div>
  );
};

export default StudentPortal;