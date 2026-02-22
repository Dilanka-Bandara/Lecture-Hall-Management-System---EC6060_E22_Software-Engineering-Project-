import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Bell, LogOut, CheckCircle, Clock, AlertCircle, Monitor, ShieldAlert, Filter, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import NotificationPanel from '../components/NotificationPanel'; // <-- NEW

const TOPortal = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false); // <-- NEW STATE

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
      fetchIssues(); 
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="flex items-center px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><AlertCircle className="w-3 h-3 mr-1"/> Pending</span>;
      case 'temporarily_solved':
        return <span className="flex items-center px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><Clock className="w-3 h-3 mr-1"/> Temp Fix</span>;
      case 'permanently_fixed':
        return <span className="flex items-center px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider"><CheckCircle className="w-3 h-3 mr-1"/> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);
  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const tempCount = issues.filter(i => i.status === 'temporarily_solved').length;
  const fixedCount = issues.filter(i => i.status === 'permanently_fixed').length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center text-sm border border-slate-700">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" /> <span className="capitalize">{notification}</span>
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
              <Monitor className="w-4 h-4 mr-3 text-indigo-500 dark:text-indigo-400" /> Support Desk
            </button>
            
            {/* NEW: CLICKABLE NOTIFICATION/ALERT BUTTON */}
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" /> System Alerts
              {pendingCount > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>

          </nav>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Tech Support'}</p>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
               Active Hardware Issues
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Technical Operations Helpdesk</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
             <ThemeToggle />
          </div>
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="saas-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Critical / Pending</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400"/></div>
          </div>
          <div className="saas-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Temporary Fixes</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tempCount}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-amber-500 dark:text-amber-400"/></div>
          </div>
          <div className="saas-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Fully Resolved</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{fixedCount}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400"/></div>
          </div>
        </div>

        {/* Issue Board */}
        <div className="saas-card overflow-hidden flex flex-col h-[calc(100vh-300px)]">
          {/* Filters */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2" />
              {['all', 'pending', 'temporarily_solved', 'permanently_fixed'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === f ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  {f === 'all' ? 'View All' : f.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Issue List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 text-sm">Loading tickets...</div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                No issues match the current filter.
              </div>
            ) : (
              <motion.div layout>
                <AnimatePresence>
                  {filteredIssues.map(issue => (
                    <motion.div 
                      key={issue.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors mb-3 shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {renderStatusBadge(issue.status)}
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Reported by: {issue.reporter}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs hidden sm:inline">•</span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">{new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                          {issue.hall} <span className="text-slate-300 dark:text-slate-600 mx-2">|</span> <span className="text-indigo-600 dark:text-indigo-400">{issue.equipment_type}</span>
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{issue.description}</p>
                      </div>

                      {/* Action Controls */}
                      <div className="mt-2 lg:mt-0">
                        <select 
                          value={issue.status} 
                          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                          className={`saas-input py-2 text-xs font-semibold cursor-pointer ${
                            issue.status === 'pending' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 focus:ring-rose-500/20 focus:border-rose-500' : 
                            issue.status === 'temporarily_solved' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 focus:ring-amber-500/20 focus:border-amber-500' : 
                            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 focus:ring-emerald-500/20 focus:border-emerald-500'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="temporarily_solved">Temp Fix Applied</option>
                          <option value="permanently_fixed">Resolved</option>
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

      {/* NEW: THE SLIDE-OUT NOTIFICATION COMPONENT */}
      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />

    </div>
  );
};

export default TOPortal;