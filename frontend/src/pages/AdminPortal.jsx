import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Users, MapPin, Plus, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [halls, setHalls] = useState([]);
  
  // Form States
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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Admin Sidebar */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between shadow-xl z-10">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-indigo-900">
            <ShieldAlert className="w-6 h-6 text-indigo-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">System<span className="text-indigo-400">Admin</span></h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-900'}`}>
              <Users className="w-5 h-5 mr-3" /> Manage Users
            </button>
            <button onClick={() => setActiveTab('halls')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'halls' ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-900'}`}>
              <MapPin className="w-5 h-5 mr-3" /> Manage Halls
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-indigo-900">
          <button onClick={logout} className="w-full flex items-center px-4 py-3 hover:bg-rose-600 hover:text-white rounded-xl transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> System Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === 'users' ? 'User Directory' : 'Facility Registry'}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-indigo-600" /> 
              Add New {activeTab === 'users' ? 'User' : 'Hall'}
            </h2>
            
            {activeTab === 'users' ? (
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <input required placeholder="Full Name" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                <input required type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                <input required placeholder="University ID (e.g., IT-2100)" value={userForm.university_id} onChange={e => setUserForm({...userForm, university_id: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="hod">HOD</option>
                  <option value="technical_officer">Technical Officer</option>
                  <option value="admin">System Admin</option>
                </select>
                {userForm.role === 'student' && (
                  <input placeholder="Batch (e.g., Year 3)" value={userForm.batch} onChange={e => setUserForm({...userForm, batch: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                )}
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Create User</button>
              </form>
            ) : (
              <form onSubmit={handleHallSubmit} className="space-y-4">
                <input required placeholder="Hall Name (e.g., Hall 01)" value={hallForm.name} onChange={e => setHallForm({...hallForm, name: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                <input required type="number" placeholder="Seating Capacity" value={hallForm.capacity} onChange={e => setHallForm({...hallForm, capacity: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:border-indigo-500" />
                <div className="flex items-center p-3 border rounded-xl">
                  <input type="checkbox" checked={hallForm.has_projector} onChange={e => setHallForm({...hallForm, has_projector: e.target.checked})} className="mr-3 w-5 h-5" />
                  <label className="font-medium text-slate-700">Includes Projector</label>
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Register Hall</button>
              </form>
            )}
          </div>

          {/* Data List Column */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-200">
                   {activeTab === 'users' ? (
                     <tr>
                       <th className="p-4 font-semibold text-slate-600">Name</th>
                       <th className="p-4 font-semibold text-slate-600">ID</th>
                       <th className="p-4 font-semibold text-slate-600">Role</th>
                     </tr>
                   ) : (
                     <tr>
                       <th className="p-4 font-semibold text-slate-600">Hall Name</th>
                       <th className="p-4 font-semibold text-slate-600">Capacity</th>
                       <th className="p-4 font-semibold text-slate-600">Equipment</th>
                     </tr>
                   )}
                 </thead>
                 <tbody>
                   {activeTab === 'users' ? users.map(u => (
                     <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="p-4 font-bold text-slate-800">{u.name} <br/><span className="text-xs text-slate-500 font-normal">{u.email}</span></td>
                       <td className="p-4 text-slate-600">{u.university_id}</td>
                       <td className="p-4"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{u.role}</span></td>
                     </tr>
                   )) : halls.map(h => (
                     <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="p-4 font-bold text-slate-800">{h.name}</td>
                       <td className="p-4 text-slate-600">{h.capacity} Seats</td>
                       <td className="p-4 text-slate-600">{h.has_projector ? 'Projector Available' : 'No Projector'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminPortal;