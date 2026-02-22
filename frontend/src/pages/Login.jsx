import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const role = await login(email, password);
      switch (role) {
        case 'student': navigate('/student-dashboard'); break;
        case 'lecturer': navigate('/lecturer-dashboard'); break;
        case 'hod': navigate('/hod-dashboard'); break;
        case 'technical_officer': navigate('/to-dashboard'); break;
        case 'admin': navigate('/admin-dashboard'); break;
        default: 
          console.log("Unknown role received:", role);
          navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-300">
      
      {/* SaaS Dot Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/30">
            <BookOpen className="text-white w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Lectro</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Sign in to your university workspace</p>
        </div>

        <div className="saas-card p-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start text-rose-600 dark:text-rose-400 text-sm font-medium">
              <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">University Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="saas-input"
                placeholder="name@university.edu"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="saas-input"
                placeholder="••••••••"
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="saas-button w-full mt-2 py-3.5 text-base"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-500 mt-8">
          Protected by institutional single sign-on.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;