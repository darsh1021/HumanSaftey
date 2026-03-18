import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldAlert, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import LiveCameraMock from './LiveCameraMock';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden w-full max-w-7xl mx-auto px-6 md:px-12 z-10 pointer-events-none">
      
      {/* Container for content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full mt-10 pointer-events-auto">
        
        {/* Left Column (Text) */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-start gap-8 z-20"
        >
          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-accent-blue/40 bg-accent-blue/10 backdrop-blur-sm shadow-[0_0_15px_rgba(0,209,255,0.2)]">
            <Cpu className="w-4 h-4 text-accent-blue animate-pulse" />
            <span className="text-sm font-mono tracking-wider text-accent-blue uppercase font-semibold">
               Enterprise AI Safety Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight font-logo drop-shadow-xl text-white mt-4">
            AI-Powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-green pr-4 pb-2 text-glow">
              Safety Monitoring
            </span> <br /> 
            System.
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 max-w-lg leading-relaxed border-l-2 border-accent-red/50 pl-4 font-inter">
             Detect. Prevent. Protect.<br/> Real-time worker safety powered by artificial intelligence. Instantly identifying PPE non-compliance and hazardous conditions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-30 relative group">
            <Link to="/login" className="btn-primary flex items-center justify-between group-hover:shadow-[0_0_30px_rgba(0,209,255,0.6)]">
              <span>Launch Hub Portal</span>
              <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/dashboard" className="btn-secondary group-hover:border-white/50 text-center flex items-center justify-center">
              Explore Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono text-white/40 mt-6 lg:mt-12 backdrop-blur-sm bg-black/50 py-2 px-4 rounded border border-white/5">
              <ShieldAlert className="w-4 h-4 text-accent-red opacity-80" />
              <span>Real-time Safety Enforcement Active</span>
          </div>

        </motion.div>

        {/* Right Column (Visual) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative z-20 flex justify-center lg:justify-end w-full"
        >
             {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-accent-blue/20 blur-[100px] rounded-full z-[-1]" />
            <div className="absolute -inset-4 bg-gradient-to-b from-accent-blue/20 to-transparent blur-2xl z-[-1] rounded-full" />
            
            <LiveCameraMock />
        </motion.div>
      </div>

    </section>
  );
};

export default HeroSection;
