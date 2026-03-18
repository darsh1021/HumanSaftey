import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, Cpu, Database, Video, Activity, Play, Square, 
  RefreshCw, Plus, Terminal, Link2, CheckCircle, AlertCircle, 
  ArrowRight, Settings2, SlidersHorizontal, Hash, X, Edit, Trash2, Globe, Scan, Loader2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';

// --- Sub Components ---

const StatusCard = ({ title, status, subtitle, icon: Icon, time }) => {
  const isOnline = status === 'Running' || status === 'Connected' || status === 'Active' || status === 'active';
  const color = isOnline ? 'text-accent-green' : 'text-accent-red';
  const bg = isOnline ? 'bg-accent-green/10 border-accent-green/20 box-glow' : 'bg-accent-red/10 border-accent-red/20';
  
  return (
    <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
         <div className={`p-2.5 rounded-lg ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
         </div>
         <div className="flex items-center gap-2">
            <span className={`relative flex h-2 w-2`}>
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-accent-green' : 'bg-accent-red'}`}></span>
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${color}`}>{status}</span>
         </div>
      </div>
      <div>
         <h4 className="text-white/50 text-xs font-mono uppercase tracking-wider mb-1 leading-tight">{title}</h4>
         <p className="text-xl font-bold font-logo text-white leading-tight">{subtitle}</p>
         <p className="text-[10px] font-mono text-white/40 mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <RefreshCw className="w-3 h-3" /> System Heartbeat Check
         </p>
      </div>
    </div>
  );
};

const AddCameraModal = ({ onClose, onRefresh, editingCamera = null }) => {
  const [formData, setFormData] = useState({
    name: editingCamera?.name || '',
    location: editingCamera?.location || '',
    streamUrl: editingCamera?.streamUrl || 'rtsp://'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCamera) {
          await api.patch(`/cameras/${editingCamera._id}`, formData);
          toast.success('Hardware profile updated');
      } else {
          await api.post('/cameras', formData);
          toast.success('New camera registered');
      }
      onRefresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md glass-panel rounded-2xl border border-white/10 p-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/bg-noise.png')] opacity-10 pointer-events-none" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-logo text-white">{editingCamera ? 'Modify Hardware' : 'Register Camera'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Hardware Label</label>
            <input 
               required
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
               placeholder="Camera 01 / Gate-Alpha"
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Geographic Location</label>
            <input 
               required
               value={formData.location}
               onChange={e => setFormData({...formData, location: e.target.value})}
               placeholder="Factory Floor - Sector B"
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-white/40 tracking-widest pl-1">Streaming Endpoint (RTSP/HTTP)</label>
            <input 
               required
               value={formData.streamUrl}
               onChange={e => setFormData({...formData, streamUrl: e.target.value})}
               className="w-full bg-black/60 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-accent-blue/50"
            />
          </div>
          
          <button 
             disabled={isSubmitting}
             className="w-full btn-primary py-3 font-mono text-xs tracking-[0.2em] uppercase mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCamera ? 'Commit Changes' : 'Initialize Feed'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

const SystemIntegration = () => {
  const [cameras, setCameras] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [systemStats, setSystemStats] = useState({ 
    apiStatus: 'Checking...', 
    aiStatus: 'Checking...', 
    socketStatus: 'Disconnected',
    uptime: 'N/A' 
  });
  const [liveLogs, setLiveLogs] = useState([]);

  
  const { socket } = useSocket();

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cameras');
      setCameras(response.data.data);
    } catch (error) {
      toast.error('Sync failed with API cluster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    
    // Check Statuses
    const checkStatuses = async () => {
      // API Backend
      try {
        await api.get('/reports/summary');
        setSystemStats(prev => ({ ...prev, apiStatus: 'Connected' }));
      } catch (e) {
        setSystemStats(prev => ({ ...prev, apiStatus: 'Offline' }));
      }

      // AI Service (assuming port 8000)
      try {
        const res = await fetch('http://localhost:8000/');
        if (res.ok) setSystemStats(prev => ({ ...prev, aiStatus: 'Running' }));
        else setSystemStats(prev => ({ ...prev, aiStatus: 'Error' }));
      } catch (e) {
        setSystemStats(prev => ({ ...prev, aiStatus: 'Unreachable' }));
      }
    };
    
    // Initial and periodic checks
    checkStatuses();
    const interval = setInterval(checkStatuses, 10000);

    // Fetch Recent Events for 'Logs'
    api.get('/violations?limit=8').then(res => {
        setLiveLogs(res.data.data.map(v => ({
            id: v._id,
            msg: `[EVENT] ${v.type.toUpperCase().replace('_', ' ')} detected on ${v.cameraId}`,
            time: new Date(v.timestamp).toLocaleTimeString(),
            level: 'WARN'
        })));
    });

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
     if (!socket) return;
     
     setSystemStats(prev => ({ ...prev, socketStatus: socket.connected ? 'Active' : 'Disconnected' }));
     
     const handleConnect = () => setSystemStats(prev => ({ ...prev, socketStatus: 'Active' }));
     const handleDisconnect = () => setSystemStats(prev => ({ ...prev, socketStatus: 'Disconnected' }));
     
     socket.on('connect', handleConnect);
     socket.on('disconnect', handleDisconnect);
     
     socket.on('newViolation', (v) => {
        const newLog = {
          id: v._id || Date.now(),
          msg: `[ALERT] ${v.type.toUpperCase().replace('_', ' ')} detected on ${v.cameraId}`,
          time: new Date().toLocaleTimeString(),
          level: 'CRITICAL'
        };
        setLiveLogs(prev => [newLog, ...prev].slice(0, 10));
     });

     socket.on('cameraUpdate', fetchCameras);
     
     return () => {
       socket.off('connect', handleConnect);
       socket.off('disconnect', handleDisconnect);
       socket.off('newViolation');
       socket.off('cameraUpdate');
     };
  }, [socket]);


  const handleDelete = async (id) => {
     if (!window.confirm('Erase hardware profile permanently?')) return;
     try {
        await api.delete(`/cameras/${id}`);
        toast.success('Hardware purged from registry');
        fetchCameras();
     } catch (error) {
        toast.error('Purge failed');
     }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto overflow-y-auto custom-scrollbar relative z-10 pb-32">
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
         <div>
            <h1 className="text-3xl font-bold font-logo bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 flex items-center gap-3">
               <Cpu className="w-8 h-8 text-accent-blue" />
               System Control
            </h1>
            <p className="text-white/50 text-sm mt-1 font-inter">
               Centralized management for AI inference clusters, telemetry gateways, and global system parameters.
            </p>
         </div>
         <div className="text-right">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1 leading-none">Last Cluster Sync</div>
            <div className="text-lg font-mono font-bold text-white tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 inline-block leading-none mt-1">
               {new Date().toLocaleTimeString()}
            </div>
         </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <StatusCard title="AI Inference Engine" status={systemStats.aiStatus} subtitle="Inference Kernel" icon={Cpu} />
         <StatusCard title="API Cluster Health" status={systemStats.apiStatus} subtitle="Safety-DB Gateway" icon={Server} />
         <StatusCard title="Hardware Inventory" status="Active" subtitle={`${cameras.length} Nodes Sync`} icon={Video} ifHardware={true} />
         <StatusCard title="Telemetry Stream" status={systemStats.socketStatus} subtitle="Real-time Protocol" icon={Activity} />
      </div>


      {/* System Controls & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
         {/* System Logs / Diagnostics */}
         <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-logo font-semibold text-white/80 flex items-center gap-2 uppercase tracking-widest">
                  <Terminal className="w-5 h-5 text-accent-green" /> Infrastructure Trace Logs
               </h3>
               <div className="flex gap-2">
                  <span className="text-[10px] font-mono text-accent-green animate-pulse">● LIVE STREAM ACTIVE</span>
               </div>
            </div>
            
            <div className="flex-1 bg-black rounded-lg p-5 font-mono text-[11px] leading-relaxed overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
               <div className="space-y-1">
                  {liveLogs.length === 0 ? (
                     <p className="text-white/20">[WAITING] No events recorded this session...</p>
                  ) : liveLogs.map(log => (
                     <p key={log.id} className={log.level === 'CRITICAL' ? 'text-accent-red' : log.level === 'WARN' ? 'text-yellow-400' : 'text-accent-green/60'}>
                        [{log.time}] {log.msg}
                     </p>
                  ))}
                  <div className="h-4" />
                  <p className="animate-pulse text-white/10 italic">_ System Pulse Live _</p>
               </div>
            </div>

         </div>

         {/* Global Performance Monitoring */}
         <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-6">
            <h3 className="text-sm font-logo font-semibold text-white/80 border-b border-white/5 pb-4 uppercase tracking-widest">Global Status</h3>
            
            <div className="space-y-4">
               <div className="p-4 rounded-lg bg-accent-blue/5 border border-accent-blue/20">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Inference Engine</span>
                  <p className="text-sm text-white font-medium capitalize">{systemStats.aiStatus === 'Running' ? 'Active & Optimized' : 'Checking Connectivity'}</p>
               </div>
               
               <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Safety Registry</span>
                  <p className="text-sm text-white font-medium">{cameras.length} Local Hardware Nodes</p>
               </div>

               <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Telemetry Gate</span>
                  <p className="text-sm text-white font-medium">{systemStats.socketStatus}</p>
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full btn-secondary py-3 text-[10px] font-mono tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                >
                   <RefreshCw className="w-3 h-3" /> Refresh System Hub
                </button>
            </div>
         </div>

      </div>

      {/* Pipeline Visualizer Sub-section */}
      <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-[#0B0F19] flex flex-col items-center justify-center relative overflow-hidden group">
         <div className="absolute top-6 left-6 text-xs font-mono text-white/30 uppercase tracking-[0.2em] font-bold">Pipeline Architecture</div>
         <div className="flex items-center gap-12 relative z-10 w-full justify-around max-w-4xl">
            <div className="flex flex-col items-center gap-3">
               <div className="w-14 h-14 rounded-2xl border border-accent-blue/30 flex items-center justify-center bg-accent-blue/5 text-accent-blue">
                  <Video className="w-7 h-7" />
               </div>
               <span className="text-[10px] font-mono text-white/40">Feeds</span>
            </div>
            <motion.div animate={{x: [0, 10, 0]}} transition={{repeat: Infinity, duration: 2}} className="text-white/20"><ArrowRight className="w-5 h-5" /></motion.div>
            <div className="flex flex-col items-center gap-3">
               <div className="w-20 h-20 rounded-3xl border border-accent-blue flex items-center justify-center bg-accent-blue/10 text-accent-blue box-glow shadow-[0_0_30px_rgba(0,209,255,0.2)]">
                  <Scan className="w-10 h-10" />
               </div>
               <span className="text-xs font-mono text-accent-blue font-bold tracking-widest mt-2">AI CORE v.03</span>
            </div>
            <motion.div animate={{x: [0, 10, 0]}} transition={{repeat: Infinity, duration: 2, delay: 0.5}} className="text-white/20"><ArrowRight className="w-5 h-5" /></motion.div>
            <div className="flex flex-col items-center gap-3">
               <div className="w-14 h-14 rounded-2xl border border-accent-blue/30 flex items-center justify-center bg-accent-blue/5 text-accent-blue">
                  <Globe className="w-7 h-7" />
               </div>
               <span className="text-[10px] font-mono text-white/40">Cloud API</span>
            </div>
         </div>
         {/* Background SVG Grid */}
         <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5"/>
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>
      
    </div>
  );
};

export default SystemIntegration;
