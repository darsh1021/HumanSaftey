import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Camera, LogIn, Mail, Lock, CheckCircle, AlertCircle, Cpu, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  if (user) {
    // If already logged in, always default to the main dashboard overview
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e, demoCredentials = null) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    const loginEmail = demoCredentials ? demoCredentials.email : email;
    const loginPassword = demoCredentials ? demoCredentials.password : password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password');
      setIsLoading(false);
      return;
    }

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      // Error message is handled and shown via toast in AuthContext, 
      // but we can also set the local state if specifically needed for the shake animation.
      setError(err.response?.data?.message || 'Failed to authenticate');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden font-sans text-white">
      {/* Background Visuals */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-accent-blue/10 blur-[150px] rounded-full z-0 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-green/5 blur-[120px] rounded-full z-0 mix-blend-screen pointer-events-none" />

      {/* Floating Particles Mock (Using framer-motion) */}
      <motion.div 
         animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
         transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
         className="absolute top-[20%] right-[15%] w-16 h-16 border border-accent-blue/30 rounded-full flex items-center justify-center bg-accent-blue/5 backdrop-blur z-0"
      >
         <Camera className="w-6 h-6 text-accent-blue/50" />
      </motion.div>
      <motion.div 
         animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
         transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
         className="absolute bottom-[20%] left-[15%] w-20 h-20 border border-accent-green/30 rounded-xl flex items-center justify-center bg-accent-green/5 backdrop-blur z-0"
      >
         <ShieldCheck className="w-8 h-8 text-accent-green/50" />
      </motion.div>


      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5, type: 'spring' }}
         className="w-full max-w-5xl glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
         {/* Left Side: Branding / Visual (Hidden on mobile) */}
         <div className="hidden md:flex flex-col w-5/12 bg-black/60 p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-transparent z-0" />
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none z-10" />
            
            <div className="relative z-20 flex flex-col h-full">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center border border-accent-blue/50 box-glow">
                   <Cpu className="w-6 h-6 text-accent-blue" />
                 </div>
                 <span className="font-logo font-bold text-2xl tracking-wide">
                   Safe<span className="text-accent-blue">Vision</span> AI
                 </span>
               </div>

               <div className="mt-auto">
                 <h2 className="text-3xl font-bold font-logo mb-4 leading-tight">
                    Enterprise Safety <br/> Compliance System
                 </h2>
                 <p className="text-white/60 font-inter text-sm mb-8 leading-relaxed">
                    Secure role-based access to live monitoring clusters, detailed violation reports, and camera analytics.
                 </p>
                 <div className="flex items-center gap-2 text-xs font-mono text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-full border border-accent-green/20 w-max">
                    <CheckCircle className="w-4 h-4" /> Endpoint Security Active
                 </div>
               </div>
            </div>
         </div>

         {/* Right Side: Login Form */}
         <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/[0.02]">
            
            <div className="md:hidden flex items-center gap-3 mb-8">
                <Cpu className="w-8 h-8 text-accent-blue" />
                <span className="font-logo font-bold text-2xl tracking-wide">
                  Safe<span className="text-accent-blue">Vision</span> AI
                </span>
            </div>

            <div className="mb-8">
               <h3 className="text-2xl font-logo font-bold text-white mb-2">Welcome Back</h3>
               <p className="text-white/50 text-sm font-inter">Sign in to access your administrative dashboard.</p>
            </div>

            <AnimatePresence>
               {error && (
                  <motion.div 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0, x: [-5, 5, -5, 5, 0] }} // Shake effect
                     exit={{ opacity: 0, height: 0 }}
                     transition={{ duration: 0.4 }}
                     className="bg-accent-red/10 border border-accent-red/50 text-accent-red px-4 py-3 rounded-xl text-sm flex items-center gap-3 mb-6"
                  >
                     <AlertCircle className="w-5 h-5 shrink-0" />
                     {error}
                  </motion.div>
               )}
            </AnimatePresence>

            <form onSubmit={(e) => handleLogin(e, null)} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Email Address</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-accent-blue transition-colors" />
                     <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@safevision.ai"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all font-inter shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-mono text-white/50 uppercase tracking-wider block">Password</label>
                     <a href="#" className="text-xs text-accent-blue hover:text-white transition-colors">Forgot Password?</a>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-accent-blue transition-colors" />
                     <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all font-inter shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                     />
                     <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                     <input type="checkbox" id="remember" className="peer w-4 h-4 opacity-0 absolute cursor-pointer" />
                     <div className="w-5 h-5 rounded border border-white/20 bg-black/50 peer-checked:bg-accent-blue peer-checked:border-accent-blue flex items-center justify-center transition-colors">
                        <CheckCircle className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" />
                     </div>
                  </div>
                  <label htmlFor="remember" className="text-sm text-white/60 cursor-pointer select-none">Remember this device</label>
               </div>

               <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 group-hover:shadow-[0_0_30px_rgba(0,209,255,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isLoading ? (
                     <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                  ) : (
                     <>Sign In <LogIn className="w-4 h-4" /></>
                  )}
               </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5">
                <p className="text-xs text-center text-white/40 mb-4 font-mono uppercase tracking-widest">Administrative Gateways</p>
                <div className="flex flex-col sm:flex-row gap-3">
                   <button 
                      onClick={(e) => handleLogin(e, { email: 'admin@test.com', password: 'password123' })}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 border border-accent-blue/30 rounded-lg text-sm font-medium text-accent-blue hover:bg-accent-blue/10 transition-colors flex justify-center items-center"
                   >
                      Admin Access
                   </button>
                   <button 
                      onClick={(e) => handleLogin(e, { email: 'viewer@test.com', password: 'password123' })}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors flex justify-center items-center"
                   >
                      Viewer Console
                   </button>
                </div>
            </div>


         </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
