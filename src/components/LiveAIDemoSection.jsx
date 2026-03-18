import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, AlertTriangle, ShieldCheck, Power, RefreshCw, Activity, CheckCircle, AlertCircle } from 'lucide-react';

// Demo configuration
const CAMERAS = [
  { id: 1, name: 'Camera 01 - Factory Floor' },
  { id: 2, name: 'Camera 02 - Assembly Line' },
  { id: 3, name: 'Camera 03 - Loading Dock' }
];

const EVENT_TYPES = {
  SAFE: { color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30', icon: CheckCircle, label: 'SAFE' },
  WARNING: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', icon: AlertTriangle, label: 'WARNING' },
  DANGER: { color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30', icon: AlertCircle, label: 'DANGER' }
};

const MOCK_MESSAGES = [
  { type: 'SAFE', msg: 'PPE Compliant - Worker ID {id}' },
  { type: 'SAFE', msg: 'Zone Clear - Area {zone}' },
  { type: 'WARNING', msg: 'Unauthorized Access - Zone {zone}' },
  { type: 'WARNING', msg: 'PPE Missing: Gloves - Worker ID {id}' },
  { type: 'DANGER', msg: 'No Helmet Detected - Zone {zone}' },
  { type: 'DANGER', msg: 'Intrusion Detected - Restricted Area' },
  { type: 'DANGER', msg: 'Fall Detected - Sector {zone}' }
];

// --- Sub-components ---

const DetectionBox = ({ box }) => {
  const isSafe = box.type === 'SAFE';
  const colorClass = isSafe ? 'border-accent-green' : 'border-accent-red box-glow';
  const bgClass = isSafe ? 'bg-accent-green text-black' : 'bg-accent-red text-white';
  const Icon = isSafe ? ShieldCheck : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
          opacity: 1, 
          scale: 1,
          x: `${box.x}%`, 
          y: `${box.y}%`, 
          width: `${box.width}%`, 
          height: `${box.height}%` 
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className={`absolute border-[2px] rounded-sm transition-all duration-300 ${colorClass}`}
      style={{ left: 0, top: 0 }}
    >
      <div className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-mono whitespace-nowrap flex items-center gap-1 ${bgClass}`}>
        <Icon className="w-3 h-3" />
        {box.label} {box.confidence}%
      </div>
      
      {/* Corner brackets */}
      <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${colorClass}`} />
      <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${colorClass}`} />
      <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${colorClass}`} />
      <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${colorClass}`} />
    </motion.div>
  );
};

const VideoFeed = ({ isActive, currentCamera, detections }) => {
  return (
    <div className="relative w-full aspect-video glass-panel rounded-xl overflow-hidden border border-white/10 group bg-black">
      {/* Fake Video Background */}
      <div className={`absolute inset-0 bg-[#0B0F19] transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
         {/* Noise or static pattern could go here, for now a dark gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
         
         {/* Subtle simulated ambient movement */}
         {isActive && (
            <motion.div 
               animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
               transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
               className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-[100px]"
            />
         )}
      </div>

      {isActive ? (
        <>
          {/* Scanline */}
          <div className="absolute inset-0 scanline pointer-events-none opacity-50 mix-blend-screen" />
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

          {/* Detections */}
          <AnimatePresence>
            {detections.map(box => (
              <DetectionBox key={box.id} box={box} />
            ))}
          </AnimatePresence>

          {/* Crosshairs & UI */}
          <div className="absolute inset-0 pointer-events-none opacity-20 hidden md:block">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-accent-blue border-y border-transparent" />
             <div className="absolute top-0 left-1/2 w-[1px] h-full bg-accent-blue border-x border-transparent" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-accent-blue w-32 h-32 rounded-full" />
          </div>

          <div className="absolute bottom-4 left-4 text-xs font-mono text-accent-blue drop-shadow-md">
            SYS.OP. NORMAL // FPS: 29.97
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
             <span className="text-xs font-mono text-white/50">REC</span>
             <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 font-mono text-sm">
           <Power className="w-8 h-8 mb-2 opacity-50" />
           SYSTEM OFFLINE
        </div>
      )}

      {/* Top Bar Info */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
         <div className="flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur rounded border border-white/5 text-xs font-mono text-white/80">
            <Camera className="w-3 h-3" />
            {currentCamera.name}
         </div>
      </div>
    </div>
  );
};

const EventLog = ({ logs }) => {
  return (
    <div className="h-full glass-panel rounded-xl border border-white/10 flex flex-col overflow-hidden bg-black/40">
      <div className="px-5 py-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between sticky top-0 z-10">
         <h3 className="font-logo font-semibold text-white/90 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-blue" /> Live Event Log
         </h3>
         <div className="flex items-center gap-2 text-[10px] font-mono text-accent-green uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" /> Live
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm relative custom-scrollbar">
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const style = EVENT_TYPES[log.type];
            const Icon = style.icon;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex gap-3 p-3 rounded-lg border backdrop-blur-sm ${style.bg} ${style.border}`}
              >
                <div className={`mt-0.5 ${style.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold tracking-wider ${style.color}`}>
                       {style.label}
                    </span>
                    <span className="text-[10px] text-white/40">{log.time}</span>
                  </div>
                  <span className="text-white/80 text-xs leading-relaxed">{log.msg}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {logs.length === 0 && (
           <div className="text-center text-white/30 text-xs mt-10">WAITING FOR EVENTS...</div>
        )}
      </div>
    </div>
  );
};

// --- Main Section Component ---

const LiveAIDemoSection = () => {
  const [isActive, setIsActive] = useState(true);
  const [cameraIdx, setCameraIdx] = useState(0);
  const [detections, setDetections] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const timerRef = useRef(null);
  const logIdCounter = useRef(0);

  // Simulation Logic
  useEffect(() => {
    if (!isActive) {
      setDetections([]);
      return;
    }

    const generateSimulation = () => {
      // 1. Generate random detections (1 to 4 boxes)
      const numBoxes = Math.floor(Math.random() * 3) + 1;
      const newDetections = [];
      
      for(let i=0; i<numBoxes; i++) {
         const isSafe = Math.random() > 0.4; // 60% chance of Safe
         newDetections.push({
            id: `box-${Date.now()}-${i}`,
            x: 10 + Math.random() * 60, // Keep away from right edge
            y: 10 + Math.random() * 60,
            width: 15 + Math.random() * 15,
            height: 20 + Math.random() * 20,
            type: isSafe ? 'SAFE' : 'DANGER',
            label: isSafe ? 'HELMET' : 'NO HELMET',
            confidence: (85 + Math.random() * 14).toFixed(1)
         });
      }
      setDetections(newDetections);

      // 2. Generate matching log entry occasionally (30% chance per tick to avoid spam)
      if (Math.random() > 0.6) {
         const logType = newDetections.some(d => d.type === 'DANGER') ? 
             (Math.random() > 0.5 ? 'DANGER' : 'WARNING') : 'SAFE';
             
         const templates = MOCK_MESSAGES.filter(m => m.type === logType);
         const template = templates[Math.floor(Math.random() * templates.length)];
         
         const msg = template.msg
             .replace('{id}', Math.floor(Math.random() * 90) + 10)
             .replace('{zone}', ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]);

         const now = new Date();
         const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

         setLogs(prev => {
            const newLogs = [{ 
               id: ++logIdCounter.current, 
               type: logType, 
               msg, 
               time: timeString 
            }, ...prev];
            // Keep only last 8 logs
            return newLogs.slice(0, 8);
         });
      }
    };

    // Initial tick
    generateSimulation();
    
    // Interval tick every 2.5s
    timerRef.current = setInterval(generateSimulation, 2500);

    return () => clearInterval(timerRef.current);
  }, [isActive, cameraIdx]);

  const handleSwitchCamera = () => {
    setCameraIdx(prev => (prev + 1) % CAMERAS.length);
    setDetections([]); // Clear immediately for transition feel
  };

  return (
    <section id="demo" className="relative py-32 w-full px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-logo mb-6"
            >
               Live AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-red to-accent-blue text-glow">Monitoring Demo</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/60 font-inter mb-8"
            >
               Real-time detection of safety compliance and violations powered by computer vision.
            </motion.p>
            
            {/* Controls */}
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="flex flex-wrap items-center justify-center gap-4 p-2 rounded-xl glass-panel border border-white/5"
            >
               <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase transition-all duration-300 ${
                      isActive ? 'bg-accent-green/20 text-accent-green border border-accent-green/50 hover:bg-accent-green/30' : 
                      'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
               >
                   <Power className="w-4 h-4" />
                   AI Status: {isActive ? 'Active' : 'Offline'}
               </button>
               
               <button 
                  onClick={handleSwitchCamera}
                  disabled={!isActive}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm uppercase bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   <RefreshCw className="w-4 h-4" />
                   Switch Camera
               </button>
            </motion.div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8 h-[600px]">
           {/* Left: Camera Panel (takes 4 columns) */}
           <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4 h-full flex flex-col"
           >
              <VideoFeed 
                 isActive={isActive} 
                 currentCamera={CAMERAS[cameraIdx]} 
                 detections={detections} 
              />
           </motion.div>

           {/* Right: Event Log (takes 3 columns) */}
           <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 h-full overflow-hidden"
           >
              <EventLog logs={logs} />
           </motion.div>
        </div>

      </div>
    </section>
  );
};

export default LiveAIDemoSection;
