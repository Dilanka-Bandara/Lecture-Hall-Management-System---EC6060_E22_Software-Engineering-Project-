import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Bell, LogOut, CheckCircle, XCircle, CalendarCheck, Plus, Trash2, Calendar, BookOpen, X, Repeat, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle';

// --- PREMIUM CUSTOM COMPONENTS ---

// 1. Premium Popup Calendar
const PremiumDatePicker = ({ label, value, onChange, dropUp = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleDateSelect = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const tzOffset = selected.getTimezoneOffset() * 60000;
    const formatted = new Date(selected.getTime() - tzOffset).toISOString().split('T')[0];
    onChange(formatted);
    setIsOpen(false);
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  return (
    <div className="relative" ref={popupRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="saas-input flex items-center justify-between cursor-pointer bg-white dark:bg-slate-900 relative z-10"
      >
        <span className={value ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
          {value || "Select a date..."}
        </span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: dropUp ? 10 : -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: dropUp ? 10 : -10 }}
            className={`absolute z-[100] w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-bold text-slate-400">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {blanks.map(b => <div key={`blank-${b}`} className="h-8"></div>)}
              {days.map(day => {
                const isSelected = value && parseInt(value.split('-')[2]) === day && parseInt(value.split('-')[1]) === currentMonth.getMonth() + 1 && parseInt(value.split('-')[0]) === currentMonth.getFullYear();
                return (
                  <div 
                    key={day} 
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium cursor-pointer transition-colors mx-auto
                      ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. Premium Rolling Wheel Time Picker
const PremiumTimePicker = ({ label, value, onChange, dropUp = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  
  const currentHour = value ? value.split(':')[0] : "08";
  const currentMin = value ? value.split(':')[1] : "00";

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ["00", "15", "30", "45"]; 

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popupRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="saas-input flex items-center justify-between cursor-pointer bg-white dark:bg-slate-900 relative z-10"
      >
        <span className={value ? "text-slate-900 dark:text-white font-medium text-lg tabular-nums" : "text-slate-400"}>
          {value || "--:--"}
        </span>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: dropUp ? 10 : -10, scale: 0.95 }}
            className={`absolute z-[100] w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 overflow-hidden ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Select Time</div>
            
            <div className="flex items-center justify-center space-x-2 relative h-40">
              <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 bg-indigo-50/50 dark:bg-slate-700/50 rounded-xl pointer-events-none border-y border-indigo-100 dark:border-slate-600"></div>
              
              <div className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth">
                <div className="h-16"></div>
                {hours.map(h => (
                  <div 
                    key={h} 
                    onClick={() => { onChange(`${h}:${currentMin}`); setIsOpen(false); }}
                    className={`h-10 flex items-center justify-center snap-center cursor-pointer text-xl font-medium transition-all ${h === currentHour ? 'text-indigo-600 dark:text-indigo-400 scale-110 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    {h}
                  </div>
                ))}
                <div className="h-16"></div>
              </div>
              
              <span className="text-2xl font-bold text-slate-300 dark:text-slate-600 z-10 pb-1">:</span>
              
              <div className="flex-1 h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar scroll-smooth">
                <div className="h-16"></div>
                {minutes.map(m => (
                  <div 
                    key={m} 
                    onClick={() => { onChange(`${currentHour}:${m}`); setIsOpen(false); }}
                    className={`h-10 flex items-center justify-center snap-center cursor-pointer text-xl font-medium transition-all ${m === currentMin ? 'text-indigo-600 dark:text-indigo-400 scale-110 font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    {m}
                  </div>
                ))}
                <div className="h-16"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PORTAL COMPONENT ---

const HODPortal = () => {
  const { user, logout } = useAuth();
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [systemData, setSystemData] = useState({ lecturers: [], halls: [], subjects: [] });
  const [notification, setNotification] = useState(null);
  
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  
  const [scheduleMode, setScheduleMode] = useState('single'); 
  
  const [scheduleForm, setScheduleForm] = useState({ subject_id: '', lecturer_id: '', hall_id: '', date: '', start_time: '', end_time: '' });
  const [recurringForm, setRecurringForm] = useState({ subject_id: '', lecturer_id: '', hall_id: '', day_of_week: '', start_date: '', end_date: '', start_time: '', end_time: '', target_batch: '' });

  useEffect(() => {
    fetchPendingSwaps();
    fetchAllSchedules();
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const response = await api.get('/system/data');
      setSystemData(response.data);
    } catch (error) {
      console.error("Failed to load system data", error);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPendingSwaps = async () => {
    try {
      const response = await api.get('/swaps/pending');
      setPendingSwaps(response.data);
    } catch (error) {
      console.error("Failed to fetch swaps", error);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const response = await api.get('/timetables/department/all');
      setAllSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    }
  };

  const handleSwapAction = async (swapId, status) => {
    try {
      await api.patch(`/swaps/${swapId}/respond`, { status });
      showNotification(`Swap request ${status} successfully.`);
      fetchPendingSwaps(); 
      fetchAllSchedules();
    } catch (error) {
      alert("Failed to process swap request.");
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      if (scheduleMode === 'single') {
        if(!scheduleForm.date || !scheduleForm.start_time || !scheduleForm.end_time) return alert("Please select dates and times properly.");
        await api.post('/timetables/department/new', scheduleForm);
        showNotification("New timetable record created successfully.");
        setScheduleForm({ subject_id: '', lecturer_id: '', hall_id: '', date: '', start_time: '', end_time: '' });
      } else {
        if(!recurringForm.start_date || !recurringForm.end_date || !recurringForm.start_time || !recurringForm.end_time) return alert("Please select dates and times properly.");
        await api.post('/timetables/department/recurring', recurringForm);
        showNotification("Semester batch schedule generated successfully!");
        setRecurringForm({ subject_id: '', lecturer_id: '', hall_id: '', day_of_week: '', start_date: '', end_date: '', start_time: '', end_time: '', target_batch: '' });
      }
      
      setScheduleModalOpen(false);
      fetchAllSchedules();
    } catch (error) {
      alert("Failed to create schedule. " + (error.response?.data?.error || "Check inputs."));
    }
  };

  const handleDeleteSchedule = async (id) => {
    if(window.confirm("Are you sure you want to cancel this class?")) {
      try {
        await api.delete(`/timetables/department/${id}`);
        showNotification("Class schedule removed.");
        fetchAllSchedules();
      } catch (error) {
        alert("Failed to delete schedule.");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center text-sm border border-slate-700">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> {notification}
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
              <CalendarCheck className="w-4 h-4 mr-3" /> Control Panel
            </button>
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" /> Notifications
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'H'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'HOD'}</p>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HOD Control Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Department schedule and override management.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button onClick={() => { setScheduleMode('single'); setScheduleModalOpen(true); }} className="saas-button py-2 flex items-center">
              <Plus className="w-4 h-4 mr-2" /> New Record
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <CalendarCheck className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/> Swap Approvals
            </h3>
            
            <div className="saas-card flex-1 p-5 overflow-y-auto space-y-3">
              {pendingSwaps.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                  No pending swap requests.
                </div>
              ) : (
                pendingSwaps.map(swap => (
                  <div key={swap.swap_id} className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center gap-4 transition-colors">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded">Requested Swap</span>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white mt-1.5">{swap.subject_name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Proposed: <span className="font-medium text-slate-700 dark:text-slate-300">{swap.proposed_date.split('T')[0]}</span> at <span className="font-medium text-slate-700 dark:text-slate-300">{swap.proposed_start_time.slice(0,5)}</span>
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button onClick={() => handleSwapAction(swap.swap_id, 'accepted')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                      </button>
                      <button onClick={() => handleSwapAction(swap.swap_id, 'rejected')} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg font-medium text-xs transition-colors flex items-center justify-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col h-[calc(100vh-200px)]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400"/> Full Timetable
            </h3>
            
            <div className="saas-card flex-1 overflow-hidden flex flex-col">
               <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
                     <tr>
                       <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Date & Time</th>
                       <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Subject / Lecturer</th>
                       <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Hall</th>
                       <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {allSchedules.map(t => (
                       <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="p-4">
                           <div className="font-medium text-slate-900 dark:text-white">{t.date.split('T')[0]}</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.start_time.slice(0,5)} - {t.end_time.slice(0,5)}</div>
                         </td>
                         <td className="p-4">
                           <div className="font-medium text-slate-900 dark:text-white">{t.subject_code}</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.lecturer_name}</div>
                         </td>
                         <td className="p-4 text-slate-700 dark:text-slate-300">{t.hall_name}</td>
                         <td className="p-4 text-right">
                           <button onClick={() => handleDeleteSchedule(t.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm overflow-y-auto items-start pt-12 pb-24">
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl my-8 relative flex flex-col border border-slate-200 dark:border-slate-800">
              
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Management</h3>
                <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
                  <button 
                    onClick={() => setScheduleMode('single')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${scheduleMode === 'single' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Single Class
                  </button>
                  <button 
                    onClick={() => setScheduleMode('recurring')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${scheduleMode === 'recurring' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <Repeat className="w-4 h-4 mr-2" /> Recurring Batch
                  </button>
                </div>

                <form onSubmit={handleCreateSchedule} className="space-y-6">
                  
                  {/* Step 1: Core Details */}
                  <div className="bg-slate-50 dark:bg-[#0B1120] p-5 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                      <select required value={scheduleMode === 'single' ? scheduleForm.subject_id : recurringForm.subject_id} onChange={e => scheduleMode === 'single' ? setScheduleForm({...scheduleForm, subject_id: e.target.value}) : setRecurringForm({...recurringForm, subject_id: e.target.value})} className="saas-input">
                        <option value="">Select Subject...</option>
                        {systemData.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code}</option>)}
                      </select>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lecturer</label>
                      <select required value={scheduleMode === 'single' ? scheduleForm.lecturer_id : recurringForm.lecturer_id} onChange={e => scheduleMode === 'single' ? setScheduleForm({...scheduleForm, lecturer_id: e.target.value}) : setRecurringForm({...recurringForm, lecturer_id: e.target.value})} className="saas-input">
                        <option value="">Assign Lecturer...</option>
                        {systemData.lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lecture Hall</label>
                      <select required value={scheduleMode === 'single' ? scheduleForm.hall_id : recurringForm.hall_id} onChange={e => scheduleMode === 'single' ? setScheduleForm({...scheduleForm, hall_id: e.target.value}) : setRecurringForm({...recurringForm, hall_id: e.target.value})} className="saas-input">
                        <option value="">Select Hall...</option>
                        {systemData.halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Step 2: Date and Time Configuration */}
                  <div className="bg-slate-50 dark:bg-[#0B1120] p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Time Configuration</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      
                      {scheduleMode === 'single' ? (
                        <div className="col-span-2">
                           <PremiumDatePicker 
                             label="Class Date" 
                             value={scheduleForm.date} 
                             onChange={(val) => setScheduleForm({...scheduleForm, date: val})} 
                           />
                        </div>
                      ) : (
                        <>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Day of the Week</label>
                            <select required value={recurringForm.day_of_week} onChange={e => setRecurringForm({...recurringForm, day_of_week: e.target.value})} className="saas-input">
                              <option value="">Select Day...</option>
                              <option value="1">Monday</option>
                              <option value="2">Tuesday</option>
                              <option value="3">Wednesday</option>
                              <option value="4">Thursday</option>
                              <option value="5">Friday</option>
                              <option value="6">Saturday</option>
                              <option value="0">Sunday</option>
                            </select>
                          </div>
                          
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Batch (Auto-Enroll)</label>
                            <select required value={recurringForm.target_batch} onChange={e => setRecurringForm({...recurringForm, target_batch: e.target.value})} className="saas-input border-indigo-300 dark:border-indigo-500/50">
                              <option value="">Select Year...</option>
                              <option value="Year 1">Year 1</option>
                              <option value="Year 2">Year 2</option>
                              <option value="Year 3">Year 3</option>
                              <option value="Year 4">Year 4</option>
                            </select>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <PremiumDatePicker 
                               label="Semester Start Date" 
                               value={recurringForm.start_date} 
                               onChange={(val) => setRecurringForm({...recurringForm, start_date: val})} 
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                             <PremiumDatePicker 
                               label="Semester End Date" 
                               value={recurringForm.end_date} 
                               onChange={(val) => setRecurringForm({...recurringForm, end_date: val})} 
                            />
                          </div>
                        </>
                      )}

                      {/* Pickers configured to dropUp securely */}
                      <div className="col-span-2 sm:col-span-1 relative">
                         <PremiumTimePicker 
                           label="Start Time" 
                           value={scheduleMode === 'single' ? scheduleForm.start_time : recurringForm.start_time} 
                           onChange={(val) => scheduleMode === 'single' ? setScheduleForm({...scheduleForm, start_time: val}) : setRecurringForm({...recurringForm, start_time: val})} 
                           dropUp={true}
                         />
                      </div>
                      
                      <div className="col-span-2 sm:col-span-1 relative">
                         <PremiumTimePicker 
                           label="End Time" 
                           value={scheduleMode === 'single' ? scheduleForm.end_time : recurringForm.end_time} 
                           onChange={(val) => scheduleMode === 'single' ? setScheduleForm({...scheduleForm, end_time: val}) : setRecurringForm({...recurringForm, end_time: val})} 
                           dropUp={true}
                         />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="saas-button w-full py-3 text-base">
                      {scheduleMode === 'single' ? 'Confirm Single Schedule' : 'Generate Semester Batch'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default HODPortal;