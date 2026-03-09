import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
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
        default: navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500 overflow-hidden">
      
      {/* Left Column: Branding & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] border border-indigo-400/20 rounded-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 opacity-90" />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/20"
          >
            <BookOpen className="text-white w-8 h-8" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tight mb-6"
          >
            The Future of <br/>Campus Management.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-100 text-lg font-medium leading-relaxed"
          >
            Lectro streamlines lecture hall scheduling and resource management with precision and ease.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-indigo-200"
          >
            <Sparkles className="w-5 h-5" />
            <span>Trusted by Academic Staff</span>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8 z-50">
          <ThemeToggle />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your institutional credentials.</p>
          </div>

          <div className="saas-card p-8 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start text-rose-600 dark:text-rose-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">University Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="saas-input py-3.5"
                  placeholder="name@university.edu"
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="saas-input py-3.5"
                  placeholder="••••••••"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="saas-button w-full py-4 text-base group"
              >
                {isLoading ? 'Authenticating...' : (
                  <span className="flex items-center justify-center">
                    Sign Into Workspace
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>
          </div>
          
          <p className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-600 mt-10 uppercase tracking-[0.2em]">
            Institutional Single Sign-On Active
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;