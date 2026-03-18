import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, AlertTriangle, ShieldCheck, Power, AlertCircle, 
  MapPin, Activity, CheckCircle, VideoOff, Maximize, 
  Pause, Play, Focus, Aperture, Map, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

// --- Sub components ---

const CameraList = ({ cameras, activeCameraId, onSelect, isLoading }) => {
  return (
    <div className="flex flex-col h-full glass-panel rounded-xl border border-white/10 overflow-hidden bg-black/40">
      <div className="p-4 border-b border-white/10 bg-white/[0.02]">
        <h3 className="font-logo font-semibold text-white/90 flex items-center gap-2">
          <Aperture className="w-4 h-4 text-accent-blue" /> Camera Feeds
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />)
        ) : cameras.length === 0 ? (
          <div className="text-white/20 text-[10px] text-center py-10 uppercase font-mono tracking-widest leading-loose">
            No hardware <br/> detected
          </div>
        ) : cameras.map((cam) => {
          const isActive = cam._id === activeCameraId;
          const isOnline = cam.status === 'active';
          
          return (
            <button
              key={cam._id}
              onClick={() => onSelect(cam._id)}
              className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                isActive 
                  ? 'bg-accent-blue/10 border-accent-blue/40 shadow-[inset_0_0_15px_rgba(0,209,255,0.1)]' 
                  : isOnline 
                    ? 'border-white/5 hover:bg-white/5 hover:border-white/20' 
                    : 'border-white/5 opacity-50 bg-black/40'
              }`}
            >
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                      <Camera className={`w-4 h-4 ${isActive ? 'text-accent-blue' : 'text-white/40'}`} />
                      <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
                         {cam.name}
                      </span>
                  </div>
                  {isOnline ? (
                      <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  ) : (
                      <div className="w-2 h-2 rounded-full bg-accent-red" />
                  )}
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {cam.location}</span>
                  <span className="uppercase">{cam.status}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MainLiveFeed = ({ camera, isPaused, aiEnabled, showZones, setAiEnabled, setIsPaused }) => {
  if (!camera) {
    return (
      <div className="w-full h-full glass-panel rounded-xl border border-white/10 flex flex-col items-center justify-center bg-black/60">
         <VideoOff className="w-12 h-12 text-white/20 mb-4" />
         <h2 className="text-xl font-logo font-bold text-white/40 uppercase tracking-widest text-sm">Select a viewport</h2>
      </div>
    );
  }

  const isOnline = camera.status === 'active';

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 rounded-xl border border-white/10 overflow-hidden relative bg-[#05080f] shadow-2xl flex items-center justify-center group">
         
         {!isOnline ? (
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-accent-red mx-auto mb-3 opacity-50" />
              <div className="text-white/30 font-mono text-xs uppercase tracking-widest">Hardware Offline</div>
            </div>
         ) : isPaused ? (
            <div className="text-center z-30">
              <Pause className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <div className="text-white/30 font-mono text-xs uppercase tracking-widest">Feed Suspended</div>
            </div>
         ) : (
            <div className="text-center relative z-10 p-12 max-w-sm">
              <Loader2 className="w-8 h-8 text-accent-blue animate-spin mx-auto mb-4 opacity-40" />
              <div className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] mb-2">Connecting Stream</div>
              <p className="text-white/20 text-[10px] leading-relaxed">
                 Waiting for AI-Inference node to broadcast RTSP packets from {camera.location}...
              </p>
              
              {showZones && (
                 <div className="absolute inset-0 pointer-events-none opacity-20 border-2 border-dashed border-accent-blue/30 m-8 rounded" />
              )}
            </div>
         )}
         
         {/* Static Video Overlays */}
         <div className="absolute inset-0 scanline pointer-events-none mix-blend-screen opacity-20 z-20" />
         <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none z-20" />

         {/* Feed Overlays (Top) */}
         <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-50 pointer-events-none">
             <div className="flex items-center gap-3">
                 <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-accent-green' : 'bg-accent-red'}`}></span>
                    </span>
                    <span className="font-mono text-xs text-white uppercase tracking-wider">{isOnline ? 'Active' : 'Offline'}</span>
                 </div>
                 <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 font-mono text-xs text-white/80">
                    {camera.name} // {camera.location}
                 </div>
             </div>
             
             <div className="flex items-center gap-2">
                 <div className={`px-2 py-1 rounded border text-[10px] font-mono tracking-wider backdrop-blur ${aiEnabled ? 'border-accent-green/40 bg-accent-green/10 text-accent-green' : 'border-white/20 bg-black/60 text-white/50'}`}>
                    AI ENFORCEMENT: {aiEnabled ? 'ENABLED' : 'DISABLED'}
                 </div>
             </div>
         </div>

         {/* Feed Controls */}
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-8 opacity-0 group-hover:!translate-y-0 group-hover:opacity-100 transition-all duration-300 z-50">
             <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-2xl">
                <button 
                  onClick={() => setIsPaused(!isPaused)} 
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                >
                   {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <div className="w-[1px] h-6 bg-white/10 mx-1" />
                <button 
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-mono ${aiEnabled ? 'bg-accent-blue/20 text-accent-blue' : 'hover:bg-white/10 text-white/70'}`}
                >
                   <Focus className="w-4 h-4" /> AI
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                   <Maximize className="w-5 h-5" />
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

const AlertsPanel = ({ alerts }) => {
  return (
    <div className="flex flex-col h-full glass-panel rounded-xl border border-white/10 overflow-hidden bg-black/40">
      <div className="p-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center z-10">
        <h3 className="font-logo font-semibold text-white/90 flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-red" /> Live Alerts
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 relative">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => (
            <motion.div
              key={alert._id || alert.timestamp}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex gap-3 p-3 rounded-lg border bg-black/40 backdrop-blur-md border-white/10 hover:bg-white/[0.02] transition-colors`}
            >
              <div className={alert.severity === 'critical' ? 'text-accent-red' : 'text-yellow-400'}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] font-mono font-bold tracking-wider text-white capitalize">
                      {alert.type.replace('_', ' ')}
                   </span>
                   <span className="text-[10px] text-white/40 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-white/60 text-[10px] uppercase font-mono tracking-tight">
                   CAM: {alert.cameraId}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-widest">
              No recent alerts
           </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page ---

const LiveMonitoring = () => {
  const [cameras, setCameras] = useState([]);
  const [activeCameraId, setActiveCameraId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [alerts, setAlerts] = useState([]);
  
  const { socket } = useSocket();

  const fetchCameras = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cameras');
      setCameras(response.data.data);
      if (response.data.data.length > 0 && !activeCameraId) {
        setActiveCameraId(response.data.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to sync hardware list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    
    // Fetch last 10 violations for history
    api.get('/violations?limit=10').then(res => {
      setAlerts(res.data.data);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newViolation', (violation) => {
      setAlerts(prev => [violation, ...prev].slice(0, 15));
    });

    socket.on('cameraUpdate', (update) => {
      setCameras(prev => prev.map(c => c._id === update.cameraId ? { ...c, status: update.status } : c));
    });

    return () => {
      socket.off('newViolation');
      socket.off('cameraUpdate');
    };
  }, [socket]);

  const activeCamera = cameras.find(c => c._id === activeCameraId);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 pb-24 md:pb-6 gap-4 w-full max-w-[1800px] mx-auto overflow-hidden">
        
       {/* Top Header / Controls */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl glass-panel z-10">
           <div>
               <h2 className="text-2xl font-bold font-logo flex items-center gap-3">
                 Live Monitoring
               </h2>
               <p className="text-white/50 text-xs font-mono mt-1 uppercase tracking-widest">Real-time Telemetry Overlay</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
               <button 
                  onClick={() => setShowZones(!showZones)}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors ${showZones ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:bg-white/5'}`}
               >
                   <Map className="w-4 h-4" /> Privacy Zones
               </button>
               
               <div className="w-[1px] h-6 bg-white/10" />

               <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 text-[10px] font-mono">
                  <button 
                      onClick={() => setAiEnabled(true)}
                      className={`px-4 py-1.5 rounded-md transition-all ${aiEnabled ? 'bg-accent-blue/20 text-accent-blue' : 'text-white/40 hover:text-white'}`}
                  >
                      AI ON
                  </button>
                  <button 
                      onClick={() => setAiEnabled(false)}
                      className={`px-4 py-1.5 rounded-md transition-all ${!aiEnabled ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                      AI OFF
                  </button>
               </div>
           </div>
       </div>

       {/* Main Content Grid */}
       <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
           
           {/* Left Column: Camera List */}
           <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="lg:col-span-3 xl:col-span-2 h-[300px] lg:h-full order-3 lg:order-1"
           >
              <CameraList 
                 cameras={cameras} 
                 activeCameraId={activeCameraId} 
                 onSelect={setActiveCameraId} 
                 isLoading={isLoading}
              />
           </motion.div>

           {/* Center Column: Live Video Feed */}
           <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="lg:col-span-6 xl:col-span-7 h-[400px] lg:h-full group order-1 lg:order-2"
           >
              <MainLiveFeed 
                 camera={activeCamera}
                 isPaused={isPaused}
                 aiEnabled={aiEnabled}
                 showZones={showZones}
                 setAiEnabled={setAiEnabled}
                 setIsPaused={setIsPaused}
              />
           </motion.div>

           {/* Right Column: Alerts Panel */}
           <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="lg:col-span-3 xl:col-span-3 h-[400px] lg:h-full order-2 lg:order-3"
           >
              <AlertsPanel alerts={alerts} />
           </motion.div>

       </div>
    </div>
  );
};

export default LiveMonitoring;
