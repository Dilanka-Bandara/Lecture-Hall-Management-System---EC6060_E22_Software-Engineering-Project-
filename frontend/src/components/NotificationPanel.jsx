import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import api from '../services/api';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay background */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm z-40 transition-colors"
          />
          
          {/* Sliding Panel */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2.5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="ml-3 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">{unreadCount} New</span>
                )}
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            {unreadCount > 0 && (
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900">
                <button onClick={markAllAsRead} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> Mark all as read
                </button>
              </div>
            )}

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white dark:bg-slate-900">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                  <Bell className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      notif.is_read 
                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-70' 
                        : 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${notif.is_read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-indigo-600 dark:bg-indigo-400 animate-pulse'}`} />
                      <div>
                        <h4 className={`text-sm mb-1 ${notif.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>{notif.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">{notif.message}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                          {new Date(notif.created_at).toLocaleDateString()} • {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;