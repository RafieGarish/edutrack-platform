import React, { useState, useEffect } from 'react';
import { Menu, X, QrCode, ArrowRight } from 'lucide-react';
// Import Link from react-scroll for smooth scrolling
import { Link } from 'react-scroll';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Removed the '#' from hrefs to work with react-scroll 'to' prop
  const navLinks = [
    { name: 'Features', target: 'features' },
    { name: 'How it Works', target: 'how-it-works' },
    // { name: 'Benefits', target: 'benefits' },
    { name: 'Pricing', target: 'pricing' }
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300 ${isScrolled ? 'pt-4' : 'pt-6'}`}>
      
      <nav
        className={`
          relative w-full max-w-5xl transition-all duration-300 ease-in-out
          ${isScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-slate-200/50 shadow-lg shadow-slate-500/5 py-3' 
            : 'bg-white/50 backdrop-blur-md border-white/20 shadow-sm py-4'
          }
          border rounded-full px-6 flex justify-between items-center
        `}
      >
        {/* Logo Section - commonly points to top of page */}
        <Link 
          to="hero" 
          smooth={true} 
          duration={500} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-gradient-to-tr from-brand-600 to-brand-500 p-1.5 rounded-lg shadow-sm">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            EduTrack
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center px-4 py-1 bg-slate-100/50 rounded-full border border-slate-200/50 mr-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.target}
                spy={true}
                smooth={true}
                offset={-100} // Adjusts for the navbar height
                duration={500}
                className="cursor-pointer text-sm font-medium text-slate-600 hover:text-brand-600 px-4 py-1.5 rounded-full hover:bg-white transition-all duration-200"
                activeClass="text-brand-600 bg-white shadow-sm" // Highlights when you are in that section
              >
                {link.name}
              </Link>
            ))}
          </div>

          <button className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors px-2">
            Sign In
          </button>
          
          {/* CTA Button */}
          <Link
            to="try-demo"
            smooth={true}
            offset={-100}
            duration={500}
            className="cursor-pointer group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
          >
            Get Started
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100/50 transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Floating Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 p-2 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.target}
                  smooth={true}
                  offset={-100}
                  duration={500}
                  className="cursor-pointer text-base font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-50 p-3 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-1" />
              <Link
                to="try-demo"
                smooth={true}
                offset={-100}
                duration={500}
                className="cursor-pointer bg-brand-600 text-white text-center py-3 rounded-xl font-medium shadow-lg shadow-brand-600/20 active:scale-95 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};