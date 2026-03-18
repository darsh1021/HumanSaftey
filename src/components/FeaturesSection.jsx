import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Activity, BellRing, Map, LineChart, FileText } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'PPE Detection',
    description: 'Detects helmets, vests, and safety gear using real-time object detection.',
    icon: <HardHat className="w-6 h-6" />,
    color: 'var(--color-accent-blue)',
    visual: (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-20 border-[2px] border-dashed border-accent-blue/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-[80%] h-[30%] border border-accent-green/80 bg-accent-green/20 rounded-sm top-2 absolute"></div>
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent-green text-[8px] font-mono text-black px-1 rounded whitespace-nowrap">HELMET: 99%</div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Unsafe Behavior',
    description: 'Identifies risky actions like running, falling, and restricted area violations.',
    icon: <Activity className="w-6 h-6" />,
    color: 'var(--color-accent-red)',
    visual: (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
          <motion.div 
             animate={{ x: [-20, 20, -20], skewX: [-10, 10, -10] }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-1 absolute h-16 bg-accent-red/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur"
          />
           <motion.div 
             animate={{ x: [-20, 20, -20] }}
             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             className="w-4 h-16 bg-gradient-to-t from-transparent via-accent-red/40 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-sm"
          />
      </div>
    )
  },
  {
    id: 3,
    title: 'Real-Time Alerts',
    description: 'Instant alerts via dashboard, sound, and notifications when violations occur.',
    icon: <BellRing className="w-6 h-6" />,
    color: 'var(--color-accent-green)',
    visual: (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
         <motion.div 
            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="w-12 h-12 border-2 border-accent-green/60 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
         />
      </div>
    )
  },
  {
    id: 4,
    title: 'Zone-Based Monitoring',
    description: 'Define restricted zones and trigger alerts when intrusions are detected.',
    icon: <Map className="w-6 h-6" />,
    color: 'var(--color-accent-blue)',
    visual: (
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none flex items-center justify-center">
         <svg viewBox="0 0 100 100" className="w-full h-full stroke-accent-blue/60 fill-accent-blue/10 stroke-[2px]">
             <motion.polygon 
                 points="50,10 90,40 70,90 30,90 10,40"
                 animate={{
                     strokeDasharray: ["0, 300", "200, 300"],
                     strokeDashoffset: [0, -200]
                 }}
                 transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
             />
         </svg>
       </div>
    )
  },
  {
    id: 5,
    title: 'Analytics Dashboard',
    description: 'Track safety trends, violations, and performance with real-time analytics.',
    icon: <LineChart className="w-6 h-6" />,
    color: 'var(--color-accent-red)',
    visual: (
       <div className="absolute bottom-4 left-4 right-4 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end gap-1">
          {[40, 70, 45, 90, 60, 100, 30].map((h, i) => (
             <motion.div 
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-accent-red/10 to-accent-red/50 rounded-t-sm border-t border-accent-red/80"
             />
          ))}
       </div>
    )
  },
  {
    id: 6,
    title: 'Smart Reporting',
    description: 'Generate daily reports with compliance rates and high-risk insights.',
    icon: <FileText className="w-6 h-6" />,
    color: 'var(--color-accent-green)',
    visual: (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-24 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/5 border border-white/10 p-2 rounded pointer-events-none">
          <motion.div 
             animate={{ y: [0, -50] }}
             transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
             className="flex flex-col gap-1 w-full"
          >
              <div className="w-3/4 h-1 bg-white/20 rounded" />
              <div className="w-full h-1 bg-white/10 rounded" />
              <div className="w-5/6 h-1 bg-white/10 rounded" />
              <div className="w-1/2 h-1 bg-accent-green/50 rounded" />
              <div className="w-full h-1 bg-white/10 rounded" />
              <div className="w-3/4 h-1 bg-white/20 rounded mt-2" />
              <div className="w-full h-1 bg-white/10 rounded" />
              <div className="w-5/6 h-1 bg-white/10 rounded" />
          </motion.div>
      </div>
    )
  }
];

const FeatureCard = ({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative h-80 glass-panel rounded-2xl p-8 overflow-hidden border border-white/5 transition-all duration-300 hover:-translate-y-2 z-10 hover:bg-white/[0.03]"
    >
      {/* Glow gradient effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${feature.color}15 0%, transparent 70%)`,
        }}
      />

      {/* Border glow wrapper */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl box-border border border-transparent mix-blend-screen"
        style={{
          boxShadow: `inset 0 0 20px ${feature.color}30, 0 0 15px ${feature.color}20`,
        }}
      />

      {/* Visual background area */}
      <div className="absolute inset-0 z-0">{feature.visual}</div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-start justify-end pointer-events-none">
        <div
          className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm transition-colors duration-300"
          style={{ color: feature.color }}
        >
          {feature.icon}
        </div>
        <h3 className="text-xl font-logo font-semibold text-white mb-2">
          {feature.title}
        </h3>
        <p className="text-sm font-inter text-white/60 leading-relaxed font-light">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 w-full px-6 md:px-12 bg-primary">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-red/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center">
           <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-white/60 mb-6"
           >
               <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
               Core Modules
           </motion.div>
           
           <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold font-logo mb-6"
           >
               AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-green to-accent-blue bg-300% animate-gradient">Safety Intelligence</span>
           </motion.h2>

           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/60 font-inter"
           >
               Advanced computer vision modules designed to monitor, detect, and prevent workplace risks in real time.
           </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {features.map((feature, index) => (
               <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
