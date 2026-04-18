'use client';

import React, { useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small classrooms or pilot programs.",
      price: isAnnual ? "Free" : "Free",
      period: "/forever",
      features: [
        "Up to 50 Students",
        "Basic QR Generation",
        "Standard Geo-fencing",
        "7-Day Data Retention",
        "Email Support"
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Institution",
      description: "For growing schools needing full automation.",
      price: isAnnual ? "$49" : "$59",
      period: "/month",
      features: [
        "Up to 1,000 Students",
        "Advanced Analytics Dashboard",
        "SMS & Email Alerts to Parents",
        "Unlimited Data Retention",
        "Priority 24/7 Support",
        "Export to PDF/Excel"
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "Custom solutions for universities & districts.",
      price: "Custom",
      period: "",
      features: [
        "Unlimited Students",
        "Multi-Campus Management",
        "SIS/LMS API Integration",
        "Dedicated Account Manager",
        "On-premise Deployment Option",
        "SLA Guarantee"
      ],
      cta: "Contact Sales",
      popular: false,
    }
  ];

  return (
    <div id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-brand-100/50 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-brand-600 font-semibold tracking-wide uppercase text-sm">Transparent Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Choose the plan that fits your school
          </p>
          <p className="mt-4 text-xl text-slate-600">
            Simple pricing with no hidden fees. Upgrade or downgrade at any time.
          </p>

          {/* Toggle Switch */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <span
                className={`block w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-6 bg-brand-600' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Yearly <span className="text-brand-600 text-xs font-bold bg-brand-50 px-2 py-0.5 rounded-full ml-1">-20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-white rounded-2xl shadow-xl border 
                ${plan.popular 
                  ? 'border-brand-500 shadow-brand-200 scale-105 z-10' 
                  : 'border-slate-100 hover:border-slate-200 hover:shadow-2xl'
                } 
                transition-all duration-300 p-8 flex flex-col h-full
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="text-slate-500 ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.popular ? 'bg-brand-100' : 'bg-slate-100'}`}>
                      <Check className={`w-3 h-3 ${plan.popular ? 'text-brand-600' : 'text-slate-500'}`} />
                    </div>
                    <span className="ml-3 text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200
                  ${plan.popular
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Need help choosing? <a href="#" className="text-brand-600 font-medium hover:underline">Contact our sales team</a>
          </p>
        </div>

      </div>
    </div>
  );
};
