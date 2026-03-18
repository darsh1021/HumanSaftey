import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: 'LIVE', label: 'AI Monitoring', icon: '🔍' },
  { value: 'Edge', label: 'Inference Ready', icon: '⚡' },
  { value: 'Sync', label: 'Multi-Node Cluster', icon: '🏭' },
];

const TrustSection = () => {
  return (
    <section id="dashboard" className="py-20 relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative pointer-events-none">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-2 p-8 rounded-2xl glass-panel relative overflow-hidden pointer-events-auto"
          >
            {/* Top Glow Edge */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-blue to-transparent opacity-50" />
            
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-5xl font-bold font-logo text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-lg">
              {stat.value}
            </div>
            <div className="text-white/60 font-medium tracking-wide uppercase text-sm mt-2">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Partners Mock */}
      <div className="mt-20 pt-10 border-t border-glass-border flex flex-col items-center opacity-70">
          <p className="text-sm text-white/40 uppercase tracking-widest mb-8">Next-Generation Safety Infrastructure</p>
      </div>
    </section>
  );
};

export default TrustSection;
