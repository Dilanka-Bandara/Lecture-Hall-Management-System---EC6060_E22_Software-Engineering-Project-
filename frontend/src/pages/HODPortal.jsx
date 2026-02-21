import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Bell, LogOut, CheckCircle, XCircle, 
  Users, ClipboardCheck, ChevronDown, CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const HODPortal = () => {
  const { user, logout } = useAuth();
  
  // Data States
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [notification, setNotification] = useState(null);
  
  // For demonstration, we use the classes we seeded earlier
  const availableClasses = [
    { id: 1, name: 'CS201 - Data Structures (Hall 01)' },
    { id: 2, name: 'CS202 - Algorithms (Hall 03)' },
    { id: 3, name: 'CS305 - Advanced Databases (Lab 02)' }
  ];

  useEffect(() => {
    fetchPendingSwaps();
  }, []);

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

  const handleSwapAction = async (swapId, status) => {
    try {
      await api.patch(`/swaps/${swapId}/respond`, { status });
      showNotification(`Swap request ${status} successfully.`);
      fetchPendingSwaps(); // Refresh the list
    } catch (error) {
      alert("Failed to process swap request.");
    }
  };

  const fetchStudentsForClass = async (timetableId) => {
    setSelectedClassId(timetableId);
    if (!timetableId) {
      setStudents([]);
      return;
    }
    try {
      const response = await api.get(`/timetables/${timetableId}/students`);
      setStudents(response.data);
      // Initialize all students as absent by default
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student.student_id] = false;
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const submitAttendance = async () => {
    try {
      const records = Object.keys(attendanceData).map(studentId => ({
        student_id: parseInt(studentId),
        is_present: attendanceData[studentId]
      }));
      
      await api.post(`/timetables/${selectedClassId}/attendance`, { attendanceRecords: records });
      showNotification("Attendance recorded successfully.");
      setSelectedClassId(''); // Reset after submission
      setStudents([]);
    } catch (error) {
      alert("Failed to submit attendance.");
    }
  };

  // Animations
  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium flex items-center border border-slate-700"
          >
            <ShieldCheck className="w-5 h-5 mr-2 text-emerald-400" /> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Dark Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shadow-2xl z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Lectro<span className="text-emerald-500">.</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button className="w-full flex items-center px-4 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium">
              <ClipboardCheck className="w-5 h-5 mr-3" /> Control Panel
            </button>
            <button className="w-full flex items-center px-4 py-3 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
              <Bell className="w-5 h-5 mr-3" /> Alerts
              {pendingSwaps.length > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingSwaps.length}</span>
              )}
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'H'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-white">{user?.name || 'HOD'}</p>
              <p className="text-xs text-slate-500">Department Head</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-4 py-3 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
        <header className="mb-10">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Administrative Overview</h2>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">HOD Control Panel</h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Left Column: Swap Approvals */}
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <CalendarCheck className="w-6 h-6 mr-2 text-indigo-500"/> Pending Swap Requests
              </h3>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 p-6 overflow-y-auto">
              {pendingSwaps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
                  <p>All clear. No pending swap requests.</p>
                </div>
              ) : (
                <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
                  {pendingSwaps.map(swap => (
                    <motion.div key={swap.swap_id} variants={itemVariants} className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-100 transition-colors">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Requested Swap</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{swap.subject_name}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Proposed: <span className="font-semibold text-slate-700">{swap.proposed_date.split('T')[0]}</span> at <span className="font-semibold text-slate-700">{swap.proposed_start_time.slice(0,5)}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <button onClick={() => handleSwapAction(swap.swap_id, 'rejected')} className="flex-1 sm:flex-none px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-colors flex items-center justify-center">
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </button>
                        <button onClick={() => handleSwapAction(swap.swap_id, 'accepted')} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 shadow-md shadow-emerald-200 transition-colors flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Attendance Management */}
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Users className="w-6 h-6 mr-2 text-emerald-500"/> Mark Attendance
              </h3>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              {/* Class Selector Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Class Session</label>
                <div className="relative">
                  <select 
                    value={selectedClassId} 
                    onChange={(e) => fetchStudentsForClass(e.target.value)}
                    className="w-full appearance-none p-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Choose a class to mark attendance...</option>
                    {availableClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Student List */}
              <div className="flex-1 overflow-y-auto p-6">
                {!selectedClassId ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ClipboardCheck className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Select a class above to load the student roster.</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">No students enrolled in this class.</div>
                ) : (
                  <div className="space-y-3">
                    {students.map(student => (
                      <div key={student.student_id} onClick={() => toggleAttendance(student.student_id)} className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${attendanceData[student.student_id] ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.university_id}</p>
                        </div>
                        
                        {/* Custom Toggle Switch */}
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${attendanceData[student.student_id] ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${attendanceData[student.student_id] ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Submit Footer */}
              {selectedClassId && students.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white">
                  <button onClick={submitAttendance} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 mr-2" /> Submit Official Attendance
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HODPortal;