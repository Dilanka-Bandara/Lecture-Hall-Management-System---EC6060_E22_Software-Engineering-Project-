import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Bell, LogOut, CheckCircle, XCircle, CalendarCheck, Plus, Trash2, Calendar, BookOpen, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle';

const HODPortal = () => {
  const { user, logout } = useAuth();
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [systemData, setSystemData] = useState({ lecturers: [], halls: [], subjects: [] });
  const [notification, setNotification] = useState(null);
  
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ subject_id: '', lecturer_id: '', hall_id: '', date: '', start_time: '', end_time: '' });

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
      await api.post('/timetables/department/new', scheduleForm);
      showNotification("New timetable record created successfully.");
      setScheduleModalOpen(false);
      fetchAllSchedules();
      setScheduleForm({ subject_id: '', lecturer_id: '', hall_id: '', date: '', start_time: '', end_time: '' });
    } catch (error) {
      alert("Failed to create schedule. Ensure you are using valid IDs.");
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
              <CalendarCheck className="w-4 h-4 mr-3 text-indigo-500 dark:text-indigo-400" /> Control Panel
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 z-10">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HOD Control Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Department schedule and override management.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button onClick={() => setScheduleModalOpen(true)} className="saas-button py-2 flex items-center">
              <Plus className="w-4 h-4 mr-2" /> New Record
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Left Column: Swap Approvals */}
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

          {/* Right Column: Timetable Management */}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="saas-card w-full max-w-lg overflow-hidden border-none shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule New Class</h3>
                <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                    <select required value={scheduleForm.subject_id} onChange={e => setScheduleForm({...scheduleForm, subject_id: e.target.value})} className="saas-input">
                      <option value="">Select Subject...</option>
                      {systemData.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lecturer</label>
                    <select required value={scheduleForm.lecturer_id} onChange={e => setScheduleForm({...scheduleForm, lecturer_id: e.target.value})} className="saas-input">
                      <option value="">Assign Lecturer...</option>
                      {systemData.lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lecture Hall</label>
                    <select required value={scheduleForm.hall_id} onChange={e => setScheduleForm({...scheduleForm, hall_id: e.target.value})} className="saas-input">
                      <option value="">Select Hall...</option>
                      {systemData.halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
                    <input type="date" required value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} className="saas-input" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start</label>
                      <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} className="saas-input px-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End</label>
                      <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} className="saas-input px-2" />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" className="saas-button w-full">Confirm Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />
    </div>
  );
};

export default HODPortal;