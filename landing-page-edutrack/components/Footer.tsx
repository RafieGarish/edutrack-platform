import React from 'react';
import { QrCode, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-brand-600 p-1 rounded-md">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">EduTrack</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Revolutionizing attendance management with secure, efficient, and eco-friendly digital solutions.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#features" className="hover:text-brand-600">Features</Link></li>
              <li><Link href="#" className="hover:text-brand-600">Integrations</Link></li>
              <li><Link href="#pricing" className="hover:text-brand-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-brand-600">Case Studies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link href="#" className="hover:text-brand-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-brand-600">Careers</Link></li>
              <li><Link href="#" className="hover:text-brand-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-brand-600">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-brand-600"><Github size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-400"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-700"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} EduTrack Systems. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
