'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';
import { DemoModal } from '../components/DemoModal';

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero onStartDemo={() => setIsDemoModalOpen(true)} />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>

      <Footer />

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
}
