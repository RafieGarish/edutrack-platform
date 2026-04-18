import React from 'react';
import { MapPin, Clock, BarChart3, Leaf, Shield, CheckCircle2 } from 'lucide-react';
import { Benefit } from '../types';

const benefits: Benefit[] = [
  {
    title: "Higher Attendance Accuracy",
    description: "Geo-validation ensures attendance is recorded only when students are physically present in the designated area, eliminating proxy attendance.",
    icon: MapPin,
  },
  {
    title: "Time and Process Efficiency",
    description: "Automated QR scanning drastically reduces roll-call time, allowing teachers to dedicate more valuable time to actual teaching.",
    icon: Clock,
  },
  {
    title: "Integrated Data Management",
    description: "Real-time admin dashboard allows for instant monitoring, trend analysis, and automated reporting for better decision making.",
    icon: BarChart3,
  },
  {
    title: "Reduced Paper Usage",
    description: "A completely digital workflow supports eco-friendly initiatives by eliminating paper registers and reducing administrative waste.",
    icon: Leaf,
  },
  {
    title: "Improved Security",
    description: "Location-locked attendance records provide an accountable audit trail, increasing trust between schools and parents.",
    icon: Shield,
  },
  {
    title: "Structured Environment",
    description: "Encourages discipline and punctuality through a modern, tech-forward approach to daily school routines.",
    icon: CheckCircle2,
  }
];

export const Features: React.FC = () => {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-brand-600 tracking-wide uppercase">Why EduTrack?</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Benefits of the EduTrack Project
          </p>
          <p className="mt-4 text-xl text-slate-600">
            We move beyond simple check-ins. EduTrack creates a secure, efficient, and eco-friendly ecosystem for educational institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                
                <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-xl shadow-lg shadow-brand-600/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
