import React from 'react';
import { ArrowRight, MapPin, QrCode, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface HeroProps {
  onStartDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartDemo }) => {
  return (
    <div id="try-demo" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-[600px] h-[600px] bg-accent-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold tracking-wide uppercase mb-6 border border-brand-100">
              <span className="w-2 h-2 bg-brand-500 rounded-full mr-2"></span>
              Next Gen Attendance
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Smart Attendance, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
                Verified Location.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              EduTrack combines QR Code technology with GPS geo-validation to ensure 100% accurate, accountable, and paperless student attendance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStartDemo}
                className="inline-flex justify-center items-center px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:scale-105 transition-all duration-200"
              >
                Try Live Demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <a 
                href="#features"
                className="inline-flex justify-center items-center px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Learn More
              </a>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4" /> QR Instant Scan
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> GPS Validated
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Secure Data
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500 w-full aspect-[4/3]">
               <Image
                 src="https://picsum.photos/seed/students/800/600" 
                 alt="Students using app"
                 fill
                 referrerPolicy="no-referrer" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-500 p-1.5 rounded-full">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg">Location Verified</span>
                    </div>
                    <p className="text-slate-200 text-sm">Student is within the designated classroom zone.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
