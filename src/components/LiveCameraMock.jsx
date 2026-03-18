import React, { useEffect, useState } from 'react';
import { Camera, AlertTriangle, ShieldCheck } from 'lucide-react';

const workers = [
  { id: 1, x: 20, y: 30, w: 25, h: 40, hasHelmet: true, name: 'Worker A' },
  { id: 2, x: 60, y: 20, w: 20, h: 35, hasHelmet: false, name: 'Worker B' },
  { id: 3, x: 45, y: 55, w: 22, h: 38, hasHelmet: true, name: 'Worker C' },
];

const LiveCameraMock = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => prev + 1);
    }, 100); // 10fps mock
    return () => clearInterval(interval);
  }, []);

  // Animate the workers slightly to simulate movement
  const animatedWorkers = workers.map((worker) => ({
    ...worker,
    x: worker.x + Math.sin(frame * 0.1 + worker.id) * 2,
    y: worker.y + Math.cos(frame * 0.1 + worker.id) * 1,
  }));

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video rounded-xl overflow-hidden glass-panel group">
      {/* Camera Feed Background (Mocked as dark noise or grid) */}
      <div className="absolute inset-0 bg-[#0a0f18] bg-grid opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/10 to-transparent mix-blend-overlay" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Bounding Boxes */}
      {animatedWorkers.map((worker) => (
        <div
          key={worker.id}
          className={`absolute transition-all duration-100 border-2 rounded-sm ${
            worker.hasHelmet ? 'border-accent-green' : 'border-accent-red box-glow'
          }`}
          style={{
            left: `${worker.x}%`,
            top: `${worker.y}%`,
            width: `${worker.w}%`,
            height: `${worker.h}%`,
          }}
        >
          {/* Label */}
          <div
            className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-mono whitespace-nowrap rounded ${
              worker.hasHelmet ? 'bg-accent-green text-primary' : 'bg-accent-red text-white'
            }`}
          >
            {worker.hasHelmet ? (
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Safe
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 animate-pulse" /> No Helmet
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Camera UI Overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-xs font-mono text-white/80">
        <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
        LIVE CAM 04 - MAIN SITE
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs font-mono text-white/50">
        AI CONFIDENCE: {(94 + Math.random() * 5).toFixed(1)}%
      </div>
      
      <div className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded bg-black/50 backdrop-blur border border-white/10 text-white/50">
        <Camera className="w-4 h-4" />
      </div>

      {/* Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-accent-blue" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-accent-blue" />
      </div>
    </div>
  );
};

export default LiveCameraMock;
