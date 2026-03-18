import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, AlertTriangle, 
  Settings, Camera, FileText, Bell, 
  Menu, X, Search, LogOut, User, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'viewer'] },
  { name: 'Live Monitoring', path: '/dashboard/monitoring', icon: Video, roles: ['admin', 'viewer'] },
  { name: 'Violations', path: '/dashboard/violations', icon: AlertTriangle, roles: ['admin'] },
  { name: 'Cameras', path: '/dashboard/cameras', icon: Camera, roles: ['admin'] },
  { name: 'Reports', path: '/dashboard/reports', icon: FileText, roles: ['admin', 'viewer'] },
  { name: 'System Control', path: '/dashboard/settings', icon: Settings, roles: ['admin'] }
];

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, sessionExpired, dismissSessionExpiry } = useAuth();
  const menuRef = useRef(null);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  // Filter sidebar items based on role
  const allowedSidebarItems = SIDEBAR_ITEMS.filter(item => item.roles.includes(user?.role));

  // Close User Menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-white font-sans overflow-hidden">
      
      {/* Session Expired Mock Popup */}
      <AnimatePresence>
         {sessionExpired && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
               <motion.div 
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0B0F19] border border-white/10 rounded-2xl p-6 relative z-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl"
               >
                  <div className="w-12 h-12 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center mb-4 box-glow">
                     <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-logo text-white mb-2">Session Expired</h3>
                  <p className="text-white/60 text-sm mb-6 font-inter">Your administrative session has timed out due to inactivity. Please log in again to continue.</p>
                  <button onClick={() => { dismissSessionExpiry(); logout(); }} className="w-full btn-primary font-bold">Return to Login</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>


      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none z-0" />

      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 glass-panel z-10 relative transition-all duration-300">
        <div className="flex items-center gap-3 h-16 px-6 border-b border-white/5 bg-black/40">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center border border-accent-blue/50">
            <Camera className="w-5 h-5 text-accent-blue" />
          </div>
          <span className="font-logo font-bold text-lg tracking-wide max-w-[130px] truncate">
            Safe<span className="text-accent-blue">Vision</span> AI
          </span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {allowedSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30 shadow-[inset_0_0_15px_rgba(0,209,255,0.15)]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-accent-blue drop-shadow-[0_0_5px_rgba(0,209,255,0.8)]' : ''}`} />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue box-glow" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-white/5 mt-auto text-center font-mono text-[10px] text-white/30 uppercase tracking-widest bg-black/40">
           System {user?.role} Active
        </div>
      </aside>

      {/* --- Main Content Wrapper --- */}
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 glass-panel flex items-center justify-between px-4 sm:px-8 bg-black/40">
          <div className="flex items-center gap-4">
             <button onClick={toggleMobileMenu} className="md:hidden text-white/60 hover:text-white">
               <Menu className="w-6 h-6" />
             </button>
             <h1 className="text-lg font-logo font-semibold hidden sm:block truncate opacity-80">Safety Monitoring Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 relative">
             <div className="hidden lg:flex items-center bg-black/50 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-accent-blue/50 transition-all">
                <Search className="w-4 h-4 text-white/40 mr-2" />
                <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm text-white placeholder-white/40 w-32 xl:w-48" />
             </div>

             <div className="hidden sm:flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 px-3 py-1 rounded-full text-xs font-mono text-accent-green">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span>AI Active</span>
             </div>

             <button className="relative text-white/60 hover:text-white transition-colors p-1">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent-red rounded-full border border-[var(--color-primary)] box-glow" />
             </button>

             {/* User Profile Dropdown */}
             <div className="relative" ref={menuRef}>
                 <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 hover:bg-white/5 p-1 -mr-2 pr-3 rounded-full border border-transparent hover:border-white/10 transition-colors"
                 >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-green p-[2px] shrink-0">
                       <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                           <span className="text-[10px] font-bold text-white tracking-widest">{user?.initials}</span>
                       </div>
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                       <span className="text-sm font-semibold text-white leading-none">{user?.name}</span>
                       <span className="text-[10px] text-accent-blue uppercase font-mono tracking-widest mt-1">{user?.role}</span>
                    </div>
                 </button>

                 <AnimatePresence>
                    {isUserMenuOpen && (
                       <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-12 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl py-2 flex flex-col z-50 bg-[#0B0F19]"
                       >
                          <div className="px-4 py-3 border-b border-white/5 mb-2 md:hidden">
                             <span className="text-sm font-semibold text-white block">{user?.name}</span>
                             <span className="text-[10px] text-accent-blue uppercase font-mono">{user?.role}</span>
                          </div>
                          
                          <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.05] text-white/70 hover:text-white text-sm transition-colors text-left">
                             <User className="w-4 h-4" /> Profile Details
                          </button>
                          <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.05] text-white/70 hover:text-white text-sm transition-colors text-left">
                             <Settings className="w-4 h-4" /> Preferences
                          </button>
                          
                          <div className="my-2 border-t border-white/5" />
                          
                          <button 
                             onClick={logout}
                             className="flex items-center gap-3 px-4 py-2 hover:bg-accent-red/10 text-accent-red text-sm transition-colors text-left"
                          >
                             <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                       </motion.div>
                    )}
                 </AnimatePresence>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-black/20 custom-scrollbar relative">
           <Outlet />
        </main>
      </div>

      {/* --- Mobile Sidebar Overlay --- */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={toggleMobileMenu} 
            />
            <motion.aside 
               initial={{ x: '-100%' }}
               animate={{ x: 0 }}
               exit={{ x: '-100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-64 max-w-[80%] bg-[#0B0F19] border-r border-white/10 h-full flex flex-col relative z-50 glass-panel shadow-2xl"
             >
                <div className="flex items-center justify-between h-16 px-6 border-b border-white/5 bg-black/40">
                  <span className="font-logo font-bold text-lg tracking-wide text-white">Menu</span>
                  <button onClick={toggleMobileMenu} className="text-white/60 hover:text-white bg-white/5 p-1 rounded-lg">
                     <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                  {allowedSidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={toggleMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                            isActive
                              ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
