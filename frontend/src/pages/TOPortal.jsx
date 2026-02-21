import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Bell, LogOut, CheckCircle, Clock, 
  AlertCircle, Monitor, ShieldAlert, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TOPortal = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'temporarily_solved', 'permanently_fixed'
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await api.get('/issues');
      setIssues(response.data);
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      await api.patch(`/issues/${issueId}/status`, { status: newStatus });
      showNotification(`Issue status updated to ${newStatus.replace('_', ' ')}.`);
      fetchIssues(); // Refresh the board
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  // Helper function to render the correct badge style based on status
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="flex items-center px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold"><AlertCircle className="w-3 h-3 mr-1"/> Pending Action</span>;
      case 'temporarily_solved':
        return <span className="flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3 mr-1"/> Temp Fix Applied</span>;
      case 'permanently_fixed':
        return <span className="flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Fully Resolved</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  // Quick Stats
  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const tempCount = issues.filter(i => i.status === 'temporarily_solved').length;
  const fixedCount = issues.filter(i => i.status === 'permanently_fixed').length;

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 bg-cyan-500 text-slate-900 px-6 py-3 rounded-full shadow-2xl shadow-cyan-500/20 font-bold flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> <span className="capitalize">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber/Tech Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-800">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Wrench className="text-slate-900 w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Lectro<span className="text-cyan-500">.</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button className="w-full flex items-center px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl font-medium border border-cyan-500/20">
              <Monitor className="w-5 h-5 mr-3" /> Support Desk
            </button>
            <button className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
              <Bell className="w-5 h-5 mr-3" /> System Alerts
              {pendingCount > 0 && <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]">{pendingCount}</span>}
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-3 mb-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg text-cyan-400">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-white">{user?.name || 'Tech Support'}</p>
              <p className="text-xs text-cyan-500">{user?.university_id}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition-colors mt-2">
            <LogOut className="w-5 h-5 mr-3" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <header className="mb-8">
          <h2 className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-1 flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Technical Operations</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Active Hardware Issues</h1>
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Critical / Pending</p>
              <h3 className="text-3xl font-black text-rose-500">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-rose-500"/></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Temporary Fixes</p>
              <h3 className="text-3xl font-black text-amber-500">{tempCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center"><Clock className="w-6 h-6 text-amber-500"/></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-slate-400 text-sm font-semibold mb-1">Fully Resolved</p>
              <h3 className="text-3xl font-black text-emerald-500">{fixedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-500"/></div>
          </div>
        </div>

        {/* Issue Board */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-320px)]">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500 mr-2" />
              {['all', 'pending', 'temporarily_solved', 'permanently_fixed'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {f === 'all' ? 'View All' : f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Issue List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-cyan-500 animate-pulse font-bold tracking-widest uppercase">Scanning Systems...</div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-600">
                <CheckCircle className="w-16 h-16 mb-4 opacity-20" />
                <p>No issues match the current filter.</p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {filteredIssues.map(issue => (
                    <motion.div 
                      key={issue.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {renderStatusBadge(issue.status)}
                          <span className="text-slate-500 text-xs font-medium bg-slate-900 px-2 py-1 rounded-md border border-slate-800">Reported by: {issue.reporter}</span>
                          <span className="text-slate-500 text-xs font-medium">{new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{issue.hall} <span className="text-slate-500 mx-2">|</span> <span className="text-cyan-400">{issue.equipment_type}</span></h3>
                        <p className="text-slate-400 text-sm">{issue.description}</p>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <select 
                          value={issue.status} 
                          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                          className={`appearance-none outline-none font-bold text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            issue.status === 'pending' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' : 
                            issue.status === 'temporarily_solved' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          <option value="pending" className="bg-slate-900 text-slate-200">Pending</option>
                          <option value="temporarily_solved" className="bg-slate-900 text-slate-200">Temp Fix</option>
                          <option value="permanently_fixed" className="bg-slate-900 text-slate-200">Resolved</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TOPortal;