import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Bell, LogOut, CheckCircle, XCircle, 
  Users, ClipboardCheck, CalendarCheck, Plus, Trash2, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationPanel from '../components/NotificationPanel';

const HODPortal = () => {
  const { user, logout } = useAuth();
  
  // Data States
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [systemData, setSystemData] = useState({ lecturers: [], halls: [], subjects: [] });
  const [notification, setNotification] = useState(null);
  
  // Modal & Panel States
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ 
    subject_id: '', lecturer_id: '', hall_id: '', date: '', start_time: '', end_time: '' 
  });

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
      fetchAllSchedules(); // Refresh the timetable in case a swap was approved
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
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium flex items-center border border-slate-700">
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" /> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shadow-2xl z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white">Lectro<span className="text-emerald-500">.</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button className="w-full flex items-center px-4 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium">
              <ClipboardCheck className="w-5 h-5 mr-3" /> Control Panel
            </button>
            <button 
              onClick={() => setIsNotifPanelOpen(true)} 
              className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              <Bell className="w-5 h-5 mr-3" /> Notifications
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center px-4 py-3 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Administrative Overview</h2>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">HOD Control Panel</h1>
          </div>
          <button onClick={() => setScheduleModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center">
            <Plus className="w-5 h-5 mr-2" /> New Timetable Record
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column: Swap Approvals */}
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
              <CalendarCheck className="w-6 h-6 mr-2 text-indigo-500"/> Lecture Hall Swap Approvals
            </h3>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 p-6 overflow-y-auto">
              {pendingSwaps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                  <p>No pending swap requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSwaps.map(swap => (
                    <div key={swap.swap_id} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex justify-between items-center gap-4 hover:border-indigo-100 transition-colors">
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Requested Swap</span>
                        <h4 className="font-bold text-slate-900 mt-1">{swap.subject_name}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Move to: <span className="font-semibold">{swap.proposed_date.split('T')[0]}</span> at <span className="font-semibold">{swap.proposed_start_time.slice(0,5)}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleSwapAction(swap.swap_id, 'rejected')} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 flex items-center">
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </button>
                        <button onClick={() => handleSwapAction(swap.swap_id, 'accepted')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 shadow-md flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timetable Management */}
          <div className="flex flex-col h-[calc(100vh-220px)]">
            <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
              <Calendar className="w-6 h-6 mr-2 text-emerald-500"/> Timetable Management
            </h3>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 p-6 overflow-y-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                   <tr>
                     <th className="p-3 font-semibold text-slate-600">Date & Time</th>
                     <th className="p-3 font-semibold text-slate-600">Subject / Lecturer</th>
                     <th className="p-3 font-semibold text-slate-600">Hall</th>
                     <th className="p-3 font-semibold text-slate-600 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {allSchedules.map(t => (
                     <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="p-3">
                         <div className="font-bold text-slate-800">{t.date.split('T')[0]}</div>
                         <div className="text-xs text-slate-500">{t.start_time.slice(0,5)} - {t.end_time.slice(0,5)}</div>
                       </td>
                       <td className="p-3">
                         <div className="font-bold text-slate-800">{t.subject_code}</div>
                         <div className="text-xs text-slate-500">{t.lecturer_name}</div>
                       </td>
                       <td className="p-3 font-medium text-slate-700">{t.hall_name}</td>
                       <td className="p-3 text-right">
                         <button onClick={() => handleDeleteSchedule(t.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
      </main>

      {/* CREATE SCHEDULE MODAL WITH DYNAMIC DROPDOWNS */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
                <h3 className="text-lg font-bold text-emerald-900">Schedule New Class</h3>
                <button onClick={() => setScheduleModalOpen(false)} className="text-emerald-400 hover:text-emerald-600"><XCircle className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Dynamic Subject Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <select required value={scheduleForm.subject_id} onChange={e => setScheduleForm({...scheduleForm, subject_id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Select Subject...</option>
                      {systemData.subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>)}
                    </select>
                  </div>
                  
                  {/* Dynamic Lecturer Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Lecturer</label>
                    <select required value={scheduleForm.lecturer_id} onChange={e => setScheduleForm({...scheduleForm, lecturer_id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Assign Lecturer...</option>
                      {systemData.lecturers.map(l => <option key={l.id} value={l.id}>{l.name} ({l.university_id})</option>)}
                    </select>
                  </div>
                  
                  {/* Dynamic Hall Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Lecture Hall</label>
                    <select required value={scheduleForm.hall_id} onChange={e => setScheduleForm({...scheduleForm, hall_id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">Select Hall...</option>
                      {systemData.halls.map(h => <option key={h.id} value={h.id}>{h.name} (Cap: {h.capacity})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                    <input type="date" required value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input type="time" required value={scheduleForm.start_time} onChange={e => setScheduleForm({...scheduleForm, start_time: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input type="time" required value={scheduleForm.end_time} onChange={e => setScheduleForm({...scheduleForm, end_time: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors mt-4">Confirm Schedule</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Slide-Out Panel */}
      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />

    </div>
  );
};

export default HODPortal;