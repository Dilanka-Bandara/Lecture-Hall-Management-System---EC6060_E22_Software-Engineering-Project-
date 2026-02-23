import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Bell, LogOut, MapPin, AlertTriangle, RefreshCw, X, CheckCircle, BookOpen, UserCheck, Filter, Clock, Hourglass, Search, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import NotificationPanel from '../components/NotificationPanel';

// Helper function to generate the next 60 valid dates cleanly
const generateFutureDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i <= 60; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    
    dates.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    });
  }
  return dates;
};

const LecturerPortal = () => {
  const { user, logout } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [pendingSwaps, setPendingSwaps] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [systemData, setSystemData] = useState({ lecturers: [], halls: [], subjects: [] });

  // Real-Time and Countdown States
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal States
  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Attendance States
  const [isAttendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // Form States
  const [issueForm, setIssueForm] = useState({ hall_id: '', equipment_type: '', description: '' });
  const [swapForm, setSwapForm] = useState({ timetable_id: '', target_lecturer_id: '', proposed_date: '', proposed_start_time: '', proposed_end_time: '', proposed_hall_id: '' });

  // Schedule Filter States
  const [scheduleTab, setScheduleTab] = useState('upcoming'); 
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const futureDateOptions = generateFutureDates();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    fetchTimetable();
    fetchSystemData();
    fetchPendingSwaps(); 
    fetchUnreadNotifs();

    // Real-time clock interval
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const fetchUnreadNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadNotifCount(res.data.filter(n => !n.is_read).length);
    } catch(e) { console.error(e) }
  };

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/timetables/my-schedule');
      setTimetable(response.data);
    } catch (error) {
      console.error("Failed to load timetable", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemData = async () => {
    try {
      const response = await api.get('/system/data');
      setSystemData(response.data);
    } catch (error) {
      console.error("Failed to load system data", error);
    }
  };

  const fetchPendingSwaps = async () => {
    try {
      const response = await api.get('/swaps/pending');
      setPendingSwaps(response.data);
    } catch (error) {
      console.error("Failed to fetch pending swaps", error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/issues', { ...issueForm, hall_id: 1 }); 
      setIssueModalOpen(false);
      showNotification("Issue reported to Technical Officer successfully.");
      setIssueForm({ hall_id: '', equipment_type: '', description: '' });
    } catch (error) {
      alert("Failed to report issue");
    }
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    if (!swapForm.proposed_start_time || !swapForm.proposed_end_time) {
      alert("Please select a valid time slot.");
      return;
    }
    try {
      await api.post('/swaps', swapForm); 
      setSwapModalOpen(false);
      showNotification("Swap request sent to Lecturer for approval.");
      setSwapForm({ timetable_id: '', target_lecturer_id: '', proposed_date: '', proposed_start_time: '', proposed_end_time: '', proposed_hall_id: '' });
    } catch (error) {
      alert("Failed to submit swap request");
    }
  };

  const handleSwapRespond = async (swapId, status) => {
    try {
      await api.patch(`/swaps/${swapId}/respond`, { status });
      showNotification(`Swap request ${status}.`);
      fetchPendingSwaps(); 
    } catch (error) {
      alert("Failed to respond to swap request");
    }
  };

  const openAttendanceModal = async (session) => {
    setActiveSession(session);
    setAttendanceModalOpen(true);
    setStudentsList([]);
    setSearchStudent('');
    try {
      const res = await api.get(`/timetables/${session.timetable_id}/students`);
      const initializedStudents = res.data.map(student => ({ ...student, is_present: true }));
      setStudentsList(initializedStudents);
    } catch (error) {
      alert("Failed to load student roster.");
    }
  };

  const toggleStudentAttendance = (studentId) => {
    setStudentsList(prev => prev.map(s => 
      s.student_id === studentId ? { ...s, is_present: !s.is_present } : s
    ));
  };

  // NEW: Bulk Attendance Actions
  const markAllAttendance = (isPresent) => {
    setStudentsList(prev => prev.map(s => ({ ...s, is_present: isPresent })));
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAttendance(true);
    try {
      const payload = {
        attendanceRecords: studentsList.map(s => ({
          student_id: s.student_id,
          is_present: s.is_present
        }))
      };
      await api.post(`/timetables/${activeSession.timetable_id}/attendance`, payload);
      showNotification("Attendance recorded successfully.");
      setAttendanceModalOpen(false);
    } catch (error) {
      alert("Failed to submit attendance.");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  const getDisplayedSchedule = () => {
    const todayStr = currentTime.toISOString().split('T')[0];
    if (scheduleTab === 'upcoming') {
      return timetable.filter(t => t.date.split('T')[0] >= todayStr);
    }
    if (scheduleTab === 'past') {
      return timetable.filter(t => t.date.split('T')[0] < todayStr);
    }
    if (scheduleTab === 'filter') {
      return timetable.filter(t => t.date.split('T')[0] === filterDate);
    }
    return timetable;
  };

  // NEW: Next Lecture Logic
  const getNextLectureDetails = () => {
    if (!timetable.length) return null;
    
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
      isImminent: h === 0 && m < 30 
    };
  };

  const nextLectureData = getNextLectureDetails();
  const displayedSchedule = getDisplayedSchedule();

  // Search Filter for Attendance
  const filteredStudentsList = studentsList.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) || 
    s.university_id.toLowerCase().includes(searchStudent.toLowerCase())
  );
  
  const presentCount = studentsList.filter(s => s.is_present).length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center text-sm border border-slate-700"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> {notification}
          </motion.div>
        )}
      </AnimatePresence>

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
            <button onClick={() => setSwapModalOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <RefreshCw className="w-4 h-4 mr-3" /> Request Swap
            </button>
            <button onClick={() => setIssueModalOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md text-sm font-medium transition-colors">
              <AlertTriangle className="w-4 h-4 mr-3 group-hover:text-rose-500" /> Report Issue
            </button>
            
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <div className="relative mr-3">
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-white dark:border-slate-900"></span>
                )}
              </div>
              Notifications
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'L'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Lecturer'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.university_id}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4 mr-3" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 z-10">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Faculty Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Dr.'}</p>
          </div>
          
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
          <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400 text-sm">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              
              {/* Alert for Pending Swaps */}
              {pendingSwaps.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center text-amber-600 dark:text-amber-500">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Action Required: Swap Requests
                  </h3>
                  <div className="space-y-3">
                    {pendingSwaps.map(swap => (
                      <div key={swap.swap_id} className="saas-card p-5 border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded">Swap Request</span>
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1.5">{swap.subject_name}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            <span className="font-medium text-slate-900 dark:text-slate-300">{swap.requesting_lecturer}</span> proposed: <span className="font-medium text-slate-900 dark:text-slate-300">{swap.proposed_date.split('T')[0]}</span> at <span className="font-medium text-slate-900 dark:text-slate-300">{swap.proposed_start_time.slice(0,5)}</span>
                          </p>
                        </div>
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                          <button onClick={() => handleSwapRespond(swap.swap_id, 'accepted')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-xs transition-colors flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept
                          </button>
                          <button onClick={() => handleSwapRespond(swap.swap_id, 'rejected')} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium text-xs transition-colors flex items-center">
                            <X className="w-3.5 h-3.5 mr-1" /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW: Countdown Widget */}
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
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Your Next Class</p>
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

              {/* Schedule Controls & List */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Teaching Schedule
                  </h3>
                  
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setScheduleTab('upcoming')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${scheduleTab === 'upcoming' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Upcoming</button>
                    <button onClick={() => setScheduleTab('past')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${scheduleTab === 'past' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>Previous</button>
                    <button onClick={() => setScheduleTab('filter')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${scheduleTab === 'filter' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>By Date</button>
                  </div>
                </div>

                <AnimatePresence>
                  {scheduleTab === 'filter' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                        <Filter className="w-4 h-4 text-indigo-500 mr-2" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-3">Select Date:</span>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="saas-input py-1.5 max-w-[200px]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-3">
                  {displayedSchedule.length === 0 ? (
                    <div className="saas-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      {scheduleTab === 'filter' ? 'No lectures scheduled for this date.' : `No ${scheduleTab} lectures found.`}
                    </div>
                  ) : (
                    displayedSchedule.map((session) => (
                      <div key={session.timetable_id} className="saas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-start sm:items-center space-x-4">
                          <div className="w-20 text-center flex-shrink-0">
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">{session.start_time.slice(0, 5)}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{session.end_time.slice(0, 5)}</span>
                          </div>
                          
                          <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2"></div>
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{session.subject_code}</span>
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-2">{session.date.split('T')[0]}</span>
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{session.subject_name}</h3>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" /> {session.hall_name}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-0 flex justify-end">
                          <button 
                            onClick={() => openAttendanceModal(session)}
                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-semibold text-xs rounded-lg transition-colors flex items-center border border-emerald-200 dark:border-emerald-500/30"
                          >
                            <UserCheck className="w-4 h-4 mr-1.5" /> Mark Attendance
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600 dark:bg-indigo-500/10 border border-transparent dark:border-indigo-500/20 p-6 rounded-2xl text-white dark:text-indigo-100 shadow-sm">
                <h3 className="text-lg font-bold mb-1">Need a change?</h3>
                <p className="text-indigo-100 dark:text-indigo-200/70 text-sm mb-5">Initiate a swap request with another lecturer. The HOD will be notified automatically upon their approval.</p>
                <button onClick={() => setSwapModalOpen(true)} className="w-full py-2.5 bg-white dark:bg-indigo-500 text-indigo-600 dark:text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-indigo-600 transition-colors">
                  Initiate Swap
                </button>
              </div>

              <div className="saas-card p-6">
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Hardware Failure?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Report AC or projector issues to the Technical Officer for fast resolution.</p>
                <button onClick={() => setIssueModalOpen(true)} className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg hover:border-rose-500 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      <AnimatePresence>
        
        {/* Issue Modal */}
        {isIssueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="saas-card w-full max-w-md overflow-hidden border-none shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Technical Issue</h3>
                <button onClick={() => setIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Equipment Type</label>
                  <select required value={issueForm.equipment_type} onChange={e => setIssueForm({...issueForm, equipment_type: e.target.value})} className="saas-input">
                    <option value="">Select equipment...</option>
                    <option value="Projector">Projector</option>
                    <option value="Microphone">Microphone</option>
                    <option value="Air Conditioning">Air Conditioning</option>
                    <option value="Network/PC">Network/PC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description of Problem</label>
                  <textarea required rows="4" value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})} placeholder="E.g., The projector in LH-103 is not turning on." className="saas-input resize-none"></textarea>
                </div>
                <div className="pt-2">
                  <button type="submit" className="saas-button bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20 w-full">Submit Report</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Swap Modal */}
        {isSwapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="saas-card w-full max-w-lg overflow-hidden border-none shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Lecture Swap</h3>
                <button onClick={() => setSwapModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSwapSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Class to Move</label>
                    <select required value={swapForm.timetable_id} onChange={e => setSwapForm({...swapForm, timetable_id: e.target.value})} className="saas-input">
                      <option value="">Select your class...</option>
                      {timetable.map(t => <option key={t.timetable_id} value={t.timetable_id}>{t.subject_code} - {t.date.split('T')[0]}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Lecturer</label>
                    <select required value={swapForm.target_lecturer_id} onChange={e => setSwapForm({...swapForm, target_lecturer_id: e.target.value})} className="saas-input">
                      <option value="">Select Lecturer...</option>
                      {systemData.lecturers.filter(l => l.id !== user?.id).map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.university_id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Proposed Hall</label>
                    <select required value={swapForm.proposed_hall_id} onChange={e => setSwapForm({...swapForm, proposed_hall_id: e.target.value})} className="saas-input">
                      <option value="">Select Room...</option>
                      {systemData.halls.map(h => (
                        <option key={h.id} value={h.id}>{h.name} (Cap: {h.capacity})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Proposed Date</label>
                    <select required value={swapForm.proposed_date} onChange={e => setSwapForm({...swapForm, proposed_date: e.target.value})} className="saas-input">
                      <option value="">Select Date...</option>
                      {futureDateOptions.map(dateObj => (
                        <option key={dateObj.value} value={dateObj.value}>{dateObj.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Time Slot</label>
                    <select 
                      required 
                      value={swapForm.proposed_start_time ? `${swapForm.proposed_start_time}-${swapForm.proposed_end_time}` : ""}
                      onChange={e => {
                        if(!e.target.value) return;
                        const [start, end] = e.target.value.split('-');
                        setSwapForm({...swapForm, proposed_start_time: start, proposed_end_time: end});
                      }}
                      className="saas-input"
                    >
                      <option value="">Select a time slot...</option>
                      <option value="08:00-10:00">08:00 AM - 10:00 AM</option>
                      <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                      <option value="13:00-15:00">01:00 PM - 03:00 PM</option>
                      <option value="15:00-17:00">03:00 PM - 05:00 PM</option>
                      <option value="17:00-19:00">05:00 PM - 07:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" className="saas-button w-full">Send Request to Lecturer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Upgraded Attendance Modal */}
        {isAttendanceModalOpen && activeSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="saas-card w-full max-w-lg overflow-hidden border-none shadow-2xl flex flex-col max-h-[85vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-indigo-500" /> Class Roster
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{activeSession.subject_code} • {activeSession.subject_name}</p>
                </div>
                <button onClick={() => setAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>

              {/* NEW: Search and Bulk Action Tools */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                
                {/* Visual Stat Summary */}
                <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Enrolled: <span className="text-indigo-600 dark:text-indigo-400">{studentsList.length}</span></span>
                  <div className="flex space-x-3 text-sm font-bold">
                     <span className="text-emerald-600 dark:text-emerald-400">{presentCount} Present</span>
                     <span className="text-rose-600 dark:text-rose-400">{studentsList.length - presentCount} Absent</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search student by name or ID..." 
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="saas-input pl-10"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button onClick={() => markAllAttendance(true)} className="flex-1 flex items-center justify-center py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30">
                     <CheckSquare className="w-4 h-4 mr-1.5" /> Mark All Present
                  </button>
                  <button onClick={() => markAllAttendance(false)} className="flex-1 flex items-center justify-center py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30">
                     <Square className="w-4 h-4 mr-1.5" /> Mark All Absent
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-[#0B1120]/50">
                {studentsList.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">Loading students...</div>
                ) : filteredStudentsList.length === 0 ? (
                   <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No students match your search.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudentsList.map(student => (
                      <div key={student.student_id} onClick={() => toggleStudentAttendance(student.student_id)} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${student.is_present ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30'}`}>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.university_id}</p>
                        </div>
                        
                        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${student.is_present ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                          <motion.div 
                            layout 
                            className="bg-white w-4 h-4 rounded-full shadow-sm"
                            animate={{ x: student.is_present ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button 
                  onClick={handleAttendanceSubmit} 
                  disabled={isSubmittingAttendance || studentsList.length === 0}
                  className="saas-button w-full py-3"
                >
                  {isSubmittingAttendance ? 'Saving Records...' : 'Submit Attendance'}
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Full Timetable Modal Component */}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All upcoming assigned lectures.</p>
                </div>
                <button onClick={() => setIsTimetableModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30 dark:bg-[#0B1120]/50 space-y-6">
                {timetable.length === 0 ? (
                   <div className="text-center py-10 text-slate-500 dark:text-slate-400">No upcoming classes found in the system.</div>
                ) : (
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

      <NotificationPanel 
        isOpen={isNotifPanelOpen} 
        onClose={() => setIsNotifPanelOpen(false)} 
        onNotificationsUpdate={(count) => setUnreadNotifCount(count)} 
      />

    </div>
  );
};

export default LecturerPortal;