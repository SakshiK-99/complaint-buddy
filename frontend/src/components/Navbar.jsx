import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'About', to: '/about' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary-500" />
          <span className="font-bold text-lg text-slate-800">ComplaintBuddy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-slate-600 hover:text-primary-600 font-medium">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                Dashboard
              </button>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 space-y-2 bg-white">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-sm text-slate-600 py-1">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <button onClick={() => { navigate('/dashboard'); setOpen(false); }} className="btn-secondary w-full">Dashboard</button>
              <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="btn-primary w-full">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary block text-center">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary block text-center">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
