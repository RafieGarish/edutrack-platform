import React from 'react';
import { Smartphone, Scan, UserCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "Teacher Generates QR",
      description: "The teacher opens EduTrack on the classroom projector or device, generating a unique, time-sensitive QR code.",
      icon: Smartphone,
    },
    {
      title: "Student Scans Code",
      description: "Students use their smartphones to scan the code. The app instantly requests GPS permission.",
      icon: Scan,
    },
    {
      title: "System Validates & Logs",
      description: "EduTrack verifies the student is in the classroom geofence. Attendance is logged instantly to the cloud.",
      icon: UserCheck,
    }
  ];

  return (
    <div id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            How EduTrack Works
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A seamless three-step process that eliminates roll-call errors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-700 -z-10"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-brand-500 flex items-center justify-center mb-6 shadow-xl shadow-brand-500/20 relative z-10">
                  <Icon className="w-10 h-10 text-brand-400" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-brand-900 font-bold flex items-center justify-center border-2 border-slate-900">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed px-4">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
