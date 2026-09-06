import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Upload } from 'lucide-react';

const CATEGORIES = ['Academic', 'Infrastructure', 'Faculty', 'Hostel', 'Transport', 'Canteen', 'Examination', 'Harassment', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function SubmitComplaint() {
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Low' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      showToast('Please select a category', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      files.forEach((f) => data.append('evidence', f));

      const res = await api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(`Complaint submitted! Your ID is ${res.data.complaint.complaintId}`, 'success');
      navigate('/my-complaints');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Submit a Complaint</h1>
      <p className="text-sm text-slate-500 mb-6">This complaint will be submitted anonymously. Your identity is never shown to other students or in the complaint UI.</p>

      <form onSubmit={submit} className="card max-w-2xl space-y-4">
        <div>
          <label className="label">Title</label>
          <input required className="input-field" value={form.title} onChange={update('title')} placeholder="Short summary of the issue" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required rows={5} className="input-field" value={form.description} onChange={update('description')} placeholder="Describe the issue in detail" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select required className="input-field" value={form.category} onChange={update('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input-field" value={form.priority} onChange={update('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Evidence (optional)</label>
          <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-6 cursor-pointer justify-center text-slate-500 hover:border-primary-400">
            <Upload className="w-5 h-5" />
            <span className="text-sm">{files.length ? `${files.length} file(s) selected` : 'JPG, PNG, PDF or MP4 — click to upload'}</span>
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4" className="hidden" onChange={(e) => setFiles(Array.from(e.target.files))} />
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </DashboardLayout>
  );
}
