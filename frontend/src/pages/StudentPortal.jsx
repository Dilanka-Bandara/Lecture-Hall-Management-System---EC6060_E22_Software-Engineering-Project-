import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bell, LogOut, MapPin, BookOpen, Activity, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle';

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

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      {/* SaaS Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-10 hidden md:flex transition-colors duration-300">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center mr-2.5">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Lectro</h1>
          </div>
          <nav className="p-4 space-y-1 mt-2">
            <button className="w-full flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-md text-sm font-medium transition-colors">
              <Calendar className="w-4 h-4 mr-3 text-indigo-500 dark:text-indigo-400" /> Dashboard
            </button>
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" /> Notifications
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.university_id}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 z-10">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Student Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your academic schedule and tracking.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <ThemeToggle />
          </div>
        </header>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400 text-sm">Loading academic data...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Timetable */}
            <div className="xl:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Today's Schedule</h3>
              
              <div className="space-y-3">
                {timetable.length === 0 ? (
                  <div className="saas-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No classes scheduled for today.
                  </div>
                ) : (
                  timetable.map((session) => (
                    <div key={session.timetable_id} className="saas-card p-5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between group cursor-default">
                      <div className="flex items-start sm:items-center space-x-4">
                        <div className="w-20 text-center flex-shrink-0">
                          <span className="block text-sm font-bold text-slate-900 dark:text-white">{session.start_time.slice(0, 5)}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{session.end_time.slice(0, 5)}</span>
                        </div>
                        
                        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2"></div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{session.subject_code}</span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{session.subject_name}</h3>
                          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" /> {session.hall_name}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Attendance Widget */}
            <div className="xl:col-span-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Attendance Standing</h3>
              
              <div className="saas-card p-5 space-y-5">
                {attendance.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No records available.</div>
                ) : (
                  attendance.map((record) => (
                    <div key={record.subject_code}>
                      <div className="flex justify-between items-end mb-2">
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{record.subject_code}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{record.subject_name}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{record.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${record.percentage}%` }} 
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${getProgressColor(record.percentage)}`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-right mt-1.5">
                        {record.attended_classes} / {record.total_classes} attended
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default StudentPortal;