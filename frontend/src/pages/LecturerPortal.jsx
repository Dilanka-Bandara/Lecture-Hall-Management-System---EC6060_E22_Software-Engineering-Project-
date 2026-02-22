import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Bell, LogOut, MapPin, AlertTriangle, RefreshCw, X, CheckCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const LecturerPortal = () => {
  const { user, logout } = useAuth();
  const [timetable, setTimetable] = useState([]);
  const [pendingSwaps, setPendingSwaps] = useState([]); // <-- NEW: State for incoming swaps
  const [loading, setLoading] = useState(true);
  
  const [systemData, setSystemData] = useState({ lecturers: [], halls: [], subjects: [] });
  const [isSwapModalOpen, setSwapModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const [issueForm, setIssueForm] = useState({ hall_id: '', equipment_type: '', description: '' });
  const [swapForm, setSwapForm] = useState({ timetable_id: '', target_lecturer_id: '', proposed_date: '', proposed_start_time: '', proposed_end_time: '', proposed_hall_id: '' });

  useEffect(() => {
    fetchTimetable();
    fetchSystemData();
    fetchPendingSwaps(); // <-- NEW: Fetch incoming swaps on load
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

  const fetchSystemData = async () => {
    try {
      const response = await api.get('/system/data');
      setSystemData(response.data);
    } catch (error) {
      console.error("Failed to load system data", error);
    }
  };

  // NEW: Function to get incoming swap requests
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
    try {
      await api.post('/swaps', swapForm); 
      setSwapModalOpen(false);
      showNotification("Swap request sent to Lecturer for approval.");
      setSwapForm({ timetable_id: '', target_lecturer_id: '', proposed_date: '', proposed_start_time: '', proposed_end_time: '', proposed_hall_id: '' });
    } catch (error) {
      alert("Failed to submit swap request");
    }
  };

  // NEW: Function to respond to incoming swaps
  const handleSwapRespond = async (swapId, status) => {
    try {
      await api.patch(`/swaps/${swapId}/respond`, { status });
      showNotification(`Swap request ${status}.`);
      fetchPendingSwaps(); // Refresh list after responding
    } catch (error) {
      alert("Failed to respond to swap request");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      {/* Toast Notification */}
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
              <Calendar className="w-4 h-4 mr-3 text-indigo-500 dark:text-indigo-400" /> My Schedule
            </button>
            <button onClick={() => setSwapModalOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <RefreshCw className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" /> Request Swap
            </button>
            <button onClick={() => setIssueModalOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md text-sm font-medium transition-colors">
              <AlertTriangle className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-rose-500" /> Report Issue
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 z-10">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Faculty Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Dr.'}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <ThemeToggle />
          </div>
        </header>

        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-500 dark:text-slate-400 text-sm">Loading schedule...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Schedule & Swaps Column */}
            <div className="xl:col-span-2">
              
              {/* NEW: Incoming Swap Requests Section */}
              {pendingSwaps.length > 0 && (
                <div className="mb-8">
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

              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Upcoming Lectures</h3>
              
              <div className="space-y-3">
                {timetable.length === 0 ? (
                  <div className="saas-card p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No lectures scheduled today.
                  </div>
                ) : (
                  timetable.map((session) => (
                    <div key={session.timetable_id} className="saas-card p-5 flex flex-col sm:flex-row sm:items-center justify-between">
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

            {/* Quick Actions Column */}
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

      {/* MODALS */}
      <AnimatePresence>
        {/* ... (Issue Modal remains identical) ... */}
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

        {/* ... (Swap Modal remains identical) ... */}
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
                    <input type="date" required value={swapForm.proposed_date} onChange={e => setSwapForm({...swapForm, proposed_date: e.target.value})} className="saas-input" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Start</label>
                      <input type="time" required value={swapForm.proposed_start_time} onChange={e => setSwapForm({...swapForm, proposed_start_time: e.target.value})} className="saas-input px-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">End</label>
                      <input type="time" required value={swapForm.proposed_end_time} onChange={e => setSwapForm({...swapForm, proposed_end_time: e.target.value})} className="saas-input px-2" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button type="submit" className="saas-button w-full">Send Request to Lecturer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LecturerPortal;