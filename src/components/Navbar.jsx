import React, { useState, useEffect } from 'react';
import { Camera, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass-panel py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center border border-accent-blue/50">
            <Camera className="w-6 h-6 text-accent-blue" />
          </div>
          <span className="font-logo font-bold text-xl tracking-wide text-white">
            Safe<span className="text-accent-blue">Vision</span> AI
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-white/70 hover:text-accent-blue hover:text-glow transition-all duration-300 font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
          {user ? (
             <Link to="/dashboard" className="btn-primary py-2 px-5 text-sm ml-4 border-accent-green text-accent-green hover:bg-accent-green hover:text-primary shadow-[0_0_15px_rgba(0,255,156,0.2)] inset-[0_0_10px_rgba(0,255,156,0.1)]">
               Go to Dashboard
             </Link>
          ) : (
             <Link to="/login" className="btn-primary py-2 px-5 text-sm ml-4">
               Sign In
             </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white/80 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel absolute top-full left-0 w-full py-4 px-6 flex flex-col gap-4 border-t border-glass-border">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/80 hover:text-accent-blue font-medium text-lg py-2 border-b border-white/5"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
