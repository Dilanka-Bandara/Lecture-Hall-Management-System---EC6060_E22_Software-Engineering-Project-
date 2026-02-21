import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info } from 'lucide-react';
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
      // Update local state to instantly reflect the change without reloading
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
          
          {/* Sliding Panel */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="ml-3 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">{unreadCount} New</span>
                )}
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            {unreadCount > 0 && (
              <div className="px-6 py-3 border-b border-slate-100 flex justify-end">
                <button onClick={markAllAsRead} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Mark all as read
                </button>
              </div>
            )}

            {/* Notification Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Bell className="w-12 h-12 mb-3 opacity-20" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.is_read ? 'bg-white border-slate-100 opacity-70' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}
                  >
                    <div className="flex items-start">
                      <div className={`mt-0.5 w-2 h-2 rounded-full mr-3 flex-shrink-0 ${notif.is_read ? 'bg-slate-300' : 'bg-indigo-600 animate-pulse'}`} />
                      <div>
                        <h4 className={`text-sm mb-1 ${notif.is_read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>{notif.title}</h4>
                        <p className="text-sm text-slate-600 mb-2 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-slate-400 font-medium">
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