import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Bell, LogOut, MapPin, BookOpen, ChevronRight, Clock, Hourglass, X, Search, Filter } from 'lucide-react';
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
  
  // New States for Upgrades
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  useEffect(() => {
    fetchData();
    // Real-time clock interval
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
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

  // Advanced Logic: Find Next Lecture and calculate countdown
  const getNextLectureDetails = () => {
    if (!timetable.length) return null;
    
    // Find the first lecture that is strictly in the future
    const upcoming = timetable.find(t => {
      const lectureStart = new Date(`${t.date.split('T')[0]}T${t.start_time}`);
      return lectureStart > currentTime;
    });

    if (!upcoming) return null;

    const targetDate = new Date(`${upcoming.date.split('T')[0]}T${upcoming.start_time}`);
    const diff = targetDate - currentTime;
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return { 
      lecture: upcoming, 
      countdown: `${h}h ${m}m ${s}s`,
      isImminent: h === 0 && m < 30 // True if less than 30 mins away
    };
  };

  const nextLectureData = getNextLectureDetails();
  
  // Filter logic for Attendance
  const filteredAttendance = attendanceFilter === 'all' 
    ? attendance 
    : attendance.filter(a => a.subject_code === attendanceFilter);

  // Filter logic for Today's Classes
  const todayStr = currentTime.toISOString().split('T')[0];
  const todaysClasses = timetable.filter(t => t.date.split('T')[0] === todayStr);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      {/* SaaS Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-10 hidden md:flex transition-colors duration-300">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center mr-2.5 shadow-lg shadow-indigo-500/30">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Lectro</h1>
          </div>
          <nav className="p-4 space-y-1 mt-2">
            <button className="w-full flex items-center px-3 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md text-sm font-medium transition-colors">
              <Calendar className="w-4 h-4 mr-3" /> Dashboard
            </button>
            <button onClick={() => setIsTimetableModalOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <BookOpen className="w-4 h-4 mr-3" /> Full Timetable
            </button>
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 mr-3" /> Notifications
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
          
          {/* Top Right Controls (Theme + Real-Time Clock) */}
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex flex-col items-end mr-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400 text-sm">Loading academic data...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Countdown & Today's Classes */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* NEW: Dynamic Countdown Widget */}
              {nextLectureData && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`saas-card p-6 flex flex-col md:flex-row items-center justify-between border-l-4 ${nextLectureData.isImminent ? 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : 'border-l-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10'}`}
                >
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className={`p-3 rounded-full mr-4 ${nextLectureData.isImminent ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                      <Hourglass className={`w-6 h-6 ${nextLectureData.isImminent ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Up Next</p>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{nextLectureData.lecture.subject_name}</h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" /> {nextLectureData.lecture.hall_name} • {nextLectureData.lecture.start_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right bg-white dark:bg-slate-900 px-6 py-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Starts In</p>
                    <span className={`text-2xl font-extrabold tracking-tight tabular-nums ${nextLectureData.isImminent ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {nextLectureData.countdown}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Today's Timetable */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Today's Schedule</h3>
                  <button onClick={() => setIsTimetableModalOpen(true)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View Full Week
                  </button>
                </div>
                
                <div className="space-y-3">
                  {todaysClasses.length === 0 ? (
                    <div className="saas-card p-8 text-center text-sm text-slate-500 dark:text-slate-400 border-dashed">
                      You have no classes scheduled for today. Take a break!
                    </div>
                  ) : (
                    todaysClasses.map((session) => (
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Mini Calendar & Filterable Attendance */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Mini Calendar Widget */}
              <div className="saas-card overflow-hidden">
                <div className="bg-indigo-600 py-3 text-center">
                  <p className="text-white text-sm font-bold uppercase tracking-widest">{currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-6 text-center bg-white dark:bg-slate-900">
                  <p className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">
                    {currentTime.getDate()}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                </div>
              </div>

              {/* Advanced Attendance Widget */}
              <div className="saas-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Attendance Analytics</h3>
                </div>

                {/* Filter Dropdown */}
                <div className="mb-5 relative">
                  <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <select 
                    value={attendanceFilter} 
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="saas-input pl-10 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="all">Overview: All Subjects</option>
                    {attendance.map(a => (
                      <option key={a.subject_code} value={a.subject_code}>{a.subject_code} - {a.subject_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-5">
                  {filteredAttendance.length === 0 ? (
                    <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No records available.</div>
                  ) : (
                    filteredAttendance.map((record) => (
                      <div key={record.subject_code}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="truncate pr-4">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{record.subject_code}</p>
                            {attendanceFilter === 'all' && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{record.subject_name}</p>}
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

          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Full Timetable Modal Component */}
      <AnimatePresence>
        {isTimetableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="saas-card w-full max-w-4xl max-h-[85vh] overflow-hidden border-none shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Permanent Timetable Archive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All upcoming registered lectures.</p>
                </div>
                <button onClick={() => setIsTimetableModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-[#0B1120]/50 space-y-6">
                {timetable.length === 0 ? (
                   <div className="text-center py-10 text-slate-500 dark:text-slate-400">No upcoming classes found in the system.</div>
                ) : (
                  // Grouping the timetable by date to make it look professional
                  [...new Set(timetable.map(t => t.date.split('T')[0]))].map(dateStr => (
                    <div key={dateStr}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 sticky top-0 bg-slate-50 dark:bg-[#0B1120] py-2 z-10">
                        {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {timetable.filter(t => t.date.split('T')[0] === dateStr).map(session => (
                           <div key={session.timetable_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{session.subject_code}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                  {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                </span>
                             </div>
                             <h5 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">{session.subject_name}</h5>
                             <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                               <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {session.hall_name}</span>
                               <span className="flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1" /> {session.lecturer_name}</span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default StudentPortal;