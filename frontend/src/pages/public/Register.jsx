import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', department: '', year: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck className="w-8 h-8 text-primary-500" />
          <span className="font-bold text-xl text-slate-800">CampusCare</span>
        </div>
        <div className="card">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Create your student account</h1>
          <p className="text-sm text-slate-500 mb-6">Registration is for students. Authority accounts are created by admin.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input required className="input-field" value={form.name} onChange={update('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required className="input-field" value={form.email} onChange={update('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} className="input-field" value={form.password} onChange={update('password')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Student ID</label>
                <input className="input-field" value={form.studentId} onChange={update('studentId')} />
              </div>
              <div>
                <label className="label">Year</label>
                <input className="input-field" value={form.year} onChange={update('year')} placeholder="e.g. Final Year" />
              </div>
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input-field" value={form.department} onChange={update('department')} placeholder="e.g. Computer Engineering" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="text-sm text-slate-500 text-center mt-5">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
