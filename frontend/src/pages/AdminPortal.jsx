import React, { useState, useEffect } from 'react';
import { Users, MapPin, Plus, LogOut, ShieldAlert, BookOpen, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import NotificationPanel from '../components/NotificationPanel';

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [halls, setHalls] = useState([]);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false); // <-- NEW STATE
  
  const [userForm, setUserForm] = useState({ name: '', email: '', university_id: '', role: 'student', batch: '' });
  const [hallForm, setHallForm] = useState({ name: '', capacity: '', has_projector: true });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else {
        const res = await api.get('/admin/halls');
        setHalls(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', userForm);
      setUserForm({ name: '', email: '', university_id: '', role: 'student', batch: '' });
      fetchData();
      alert("User added successfully with default password 'password123'");
    } catch (error) {
      alert("Failed to add user.");
    }
  };

  const handleHallSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/halls', { ...hallForm, capacity: parseInt(hallForm.capacity) });
      setHallForm({ name: '', capacity: '', has_projector: true });
      fetchData();
      alert("Hall added successfully");
    } catch (error) {
      alert("Failed to add hall.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
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
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Users className="w-4 h-4 mr-3" /> Manage Users
            </button>
            <button onClick={() => setActiveTab('halls')} className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'halls' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <MapPin className="w-4 h-4 mr-3" /> Manage Halls
            </button>
            
            {/* NEW: NOTIFICATIONS TAB */}
            <button onClick={() => setIsNotifPanelOpen(true)} className="w-full flex items-center px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white rounded-md text-sm font-medium transition-colors">
              <Bell className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" /> Notifications
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-indigo-500" /> System Admin
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activeTab === 'users' ? 'User Directory Management' : 'Facility Registry Management'}</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
             <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Form Column */}
          <div className="xl:col-span-1">
            <div className="saas-card p-6 h-fit">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-2 text-indigo-500" /> Add New {activeTab === 'users' ? 'User' : 'Hall'}
              </h3>
              
              {activeTab === 'users' ? (
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="saas-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="saas-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">University ID</label>
                    <input required placeholder="e.g. STU-001" value={userForm.university_id} onChange={e => setUserForm({...userForm, university_id: e.target.value})} className="saas-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="saas-input">
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="hod">HOD</option>
                      <option value="technical_officer">Technical Officer</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                  {userForm.role === 'student' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Batch</label>
                      <input placeholder="e.g. Year 3" value={userForm.batch} onChange={e => setUserForm({...userForm, batch: e.target.value})} className="saas-input" />
                    </div>
                  )}
                  <div className="pt-2">
                    <button type="submit" className="saas-button w-full">Create User</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleHallSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hall Name</label>
                    <input required placeholder="e.g. Hall 01" value={hallForm.name} onChange={e => setHallForm({...hallForm, name: e.target.value})} className="saas-input" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Seating Capacity</label>
                    <input required type="number" value={hallForm.capacity} onChange={e => setHallForm({...hallForm, capacity: e.target.value})} className="saas-input" />
                  </div>
                  <div className="flex items-center p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-lg mt-2">
                    <input type="checkbox" checked={hallForm.has_projector} onChange={e => setHallForm({...hallForm, has_projector: e.target.checked})} className="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Includes Projector</label>
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="saas-button w-full">Register Hall</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Data List Column */}
          <div className="xl:col-span-2">
            <div className="saas-card overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                     {activeTab === 'users' ? (
                       <tr>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Name</th>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">ID</th>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Role</th>
                       </tr>
                     ) : (
                       <tr>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Hall Name</th>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Capacity</th>
                         <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Equipment</th>
                       </tr>
                     )}
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {activeTab === 'users' ? users.map(u => (
                       <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="p-4">
                           <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                           <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                         </td>
                         <td className="p-4 text-slate-600 dark:text-slate-300">{u.university_id}</td>
                         <td className="p-4">
                           <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase tracking-wider">{u.role}</span>
                         </td>
                       </tr>
                     )) : halls.map(h => (
                       <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                         <td className="p-4 font-medium text-slate-900 dark:text-white">{h.name}</td>
                         <td className="p-4 text-slate-600 dark:text-slate-300">{h.capacity} Seats</td>
                         <td className="p-4 text-slate-600 dark:text-slate-300">
                           {h.has_projector ? 
                             <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">Projector Available</span> : 
                             <span className="text-slate-400 dark:text-slate-500 text-xs">No Projector</span>
                           }
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

      {/* NEW: THE SLIDE-OUT NOTIFICATION COMPONENT */}
      <NotificationPanel isOpen={isNotifPanelOpen} onClose={() => setIsNotifPanelOpen(false)} />

    </div>
  );
};

export default AdminPortal;