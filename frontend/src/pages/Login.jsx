import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Log in to Lectro</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your university credentials to continue</p>
        </div>

        <div className="saas-card p-8">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start text-rose-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">University Email</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
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
              className="saas-button w-full mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by institutional single sign-on.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;