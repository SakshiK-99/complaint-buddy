import React from 'react';
import Navbar from '../../components/Navbar';
import { FilePlus2, Hash, Search, MessageSquare, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { icon: FilePlus2, title: 'Submit complaint', desc: 'Fill in the complaint form with category, description, priority and optional evidence.' },
  { icon: Hash, title: 'Receive Complaint ID', desc: 'You get a unique ID like CC-2026-000123 to track your complaint later.' },
  { icon: Search, title: 'Track progress', desc: 'Use your complaint ID anytime to see its current stage — no login-linked identity shown.' },
  { icon: MessageSquare, title: 'Communicate anonymously', desc: 'Chat with the assigned authority without revealing who you are.' },
  { icon: CheckCircle2, title: 'Get resolution', desc: 'Authorities update the status until your complaint is marked Resolved.' },
];

export default function HowItWorks() {
  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">How It Works</h1>
        <p className="text-slate-500 text-center mb-12">From reporting an issue to seeing it resolved — five simple steps.</p>
        <div className="space-y-6">
          {STEPS.map((s, idx) => (
            <div key={s.title} className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{idx + 1}. {s.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
