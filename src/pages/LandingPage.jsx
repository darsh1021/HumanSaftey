import React from 'react';
import Navbar from '../components/Navbar';
import PhysicsBackground from '../components/PhysicsBackground';
import HeroSection from '../components/HeroSection';
import TrustSection from '../components/TrustSection';
import FeaturesSection from '../components/FeaturesSection';
import LiveAIDemoSection from '../components/LiveAIDemoSection';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-primary overflow-hidden text-white font-sans selection:bg-accent-blue/30 selection:text-white flex flex-col items-center">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />
      
      {/* Physics Interactive Background */}
      <PhysicsBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <Navbar />
        <main className="w-full flex flex-col items-center mt-0 pt-0">
          <HeroSection />
          <TrustSection />
          <LiveAIDemoSection />
          <FeaturesSection />
        </main>
        
        {/* Footer / Contact */}
        <footer id="contact" className="w-full relative z-10 border-t border-white/5 bg-primary mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="flex flex-col gap-2">
               <span className="font-logo font-bold text-xl tracking-wide text-white">
                 Safe<span className="text-accent-blue">Vision</span> AI
               </span>
               <p className="text-white/40 text-sm">Empowering workplace safety globally.</p>
            </div>
            
            <div className="flex gap-4">
               <a href="#" className="text-white/60 hover:text-accent-blue transition-colors text-sm">Privacy</a>
               <a href="#" className="text-white/60 hover:text-accent-blue transition-colors text-sm">Terms</a>
               <a href="#" className="text-white/60 hover:text-accent-blue transition-colors text-sm">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Fog / Glow Effects */}
      <div className="fixed pointer-events-none bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent opacity-80 z-20" />
      <div className="fixed pointer-events-none top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full z-0 mix-blend-screen" />
      <div className="fixed pointer-events-none bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-green/5 blur-[120px] rounded-full z-0 mix-blend-screen" />
    </div>
  );
};

export default LandingPage;
