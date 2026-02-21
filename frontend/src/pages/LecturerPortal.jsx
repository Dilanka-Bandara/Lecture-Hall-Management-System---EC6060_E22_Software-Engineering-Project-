import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Bell, LogOut, MapPin, Clock, 
  AlertTriangle, RefreshCw, X, CheckCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LecturerPortal = () => {
  const { user, logout } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form States
  const [issueForm, setIssueForm] = useState({ hall_id: '', equipment_type: '', description: '' });
  const [swapForm, setSwapForm] = useState({ timetable_id: '', target_lecturer_id: '', proposed_date: '', proposed_start_time: '', proposed_end_time: '', proposed_hall_id: '' });

  useEffect(() => {
    fetchTimetable();
  }, []);

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

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, hall_id would come from a dropdown of actual halls
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
    try {
      await api.post('/swaps', { ...swapForm, target_lecturer_id: 4, proposed_hall_id: 2 }); // Dummy IDs for testing
      setSwapModalOpen(false);
      showNotification("Swap request sent to Lecturer and HOD for approval.");
    } catch (error) {
      alert("Failed to submit swap request");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-medium flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside initial={{ x: -250 }} animate={{ x: 0 }} className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-2xl z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-800">
            <h1 className="text-2xl font-bold tracking-tight">Lectro<span className="text-indigo-400">.</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button className="w-full flex items-center px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-medium transition-colors">
              <Calendar className="w-5 h-5 mr-3" /> My Schedule
            </button>
            <button onClick={() => setSwapModalOpen(true)} className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
              <RefreshCw className="w-5 h-5 mr-3" /> Request Swap
            </button>
            <button onClick={() => setIssueModalOpen(true)} className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl font-medium transition-colors">
              <AlertTriangle className="w-5 h-5 mr-3" /> Report Issue
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'L'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold">{user?.name || 'Lecturer'}</p>
              <p className="text-xs text-slate-400">{user?.university_id}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Faculty Dashboard</h2>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Dr.'}</h1>
          </div>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Schedule Column (Takes up 2/3 of the space on large screens) */}
            <div className="xl:col-span-2">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-indigo-500"/> Upcoming Lectures
              </h3>
              <div className="space-y-4">
                {timetable.length === 0 ? (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">No lectures scheduled today.</div>
                ) : (
                  timetable.map((session) => (
                    <motion.div key={session.timetable_id} whileHover={{ scale: 1.01 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-center justify-center w-24 py-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700">
                          <span className="text-lg font-bold">{session.start_time.slice(0, 5)}</span>
                        </div>
                        <div>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md mb-2 inline-block">{session.subject_code}</span>
                          <h4 className="text-lg font-bold text-slate-900">{session.subject_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium mt-1">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {session.hall_name}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Column */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
                <h3 className="text-2xl font-bold mb-2">Need to change a class?</h3>
                <p className="text-indigo-100 mb-6 text-sm">Initiate a swap request with another lecturer. The HOD will be notified automatically.</p>
                <button onClick={() => setSwapModalOpen(true)} className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-md hover:bg-slate-50 transition-colors">
                  Initiate Swap
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hardware Failure?</h3>
                <p className="text-slate-500 mb-6 text-sm">Report projector, mic, or AC issues directly to the Technical Officer for immediate resolution.</p>
                <button onClick={() => setIssueModalOpen(true)} className="w-full py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-rose-500 hover:text-rose-600 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {isIssueModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Report Technical Issue</h3>
                <button onClick={() => setIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Equipment Type</label>
                  <select required value={issueForm.equipment_type} onChange={e => setIssueForm({...issueForm, equipment_type: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Select equipment...</option>
                    <option value="Projector">Projector</option>
                    <option value="Microphone">Microphone</option>
                    <option value="Air Conditioning">Air Conditioning</option>
                    <option value="Network/PC">Network/PC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description of Problem</label>
                  <textarea required rows="4" value={issueForm.description} onChange={e => setIssueForm({...issueForm, description: e.target.value})} placeholder="E.g., The projector in LH-103 is not turning on." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-colors mt-4">Submit Report</button>
              </form>
            </motion.div>
          </div>
        )}

        {isSwapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                <h3 className="text-lg font-bold text-indigo-900">Request Lecture Swap</h3>
                <button onClick={() => setSwapModalOpen(false)} className="text-indigo-400 hover:text-indigo-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSwapSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Class to Move</label>
                    <select required value={swapForm.timetable_id} onChange={e => setSwapForm({...swapForm, timetable_id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="">Select your class...</option>
                      {timetable.map(t => <option key={t.timetable_id} value={t.timetable_id}>{t.subject_code} - {t.date.split('T')[0]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Proposed Date</label>
                    <input type="date" required value={swapForm.proposed_date} onChange={e => setSwapForm({...swapForm, proposed_date: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input type="time" required value={swapForm.proposed_start_time} onChange={e => setSwapForm({...swapForm, proposed_start_time: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input type="time" required value={swapForm.proposed_end_time} onChange={e => setSwapForm({...swapForm, proposed_end_time: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start mt-4">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <p>This request will be sent to the target lecturer. If accepted, it will be forwarded to the HOD for final approval and room allocation.</p>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors">Submit Request to HOD</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LecturerPortal;