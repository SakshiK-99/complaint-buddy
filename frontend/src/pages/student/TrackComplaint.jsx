import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ComplaintTimeline from '../../components/ComplaintTimeline';
import PriorityBadge from '../../components/PriorityBadge';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Search } from 'lucide-react';

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { showToast } = useToast();

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/complaints/track/${complaintId.trim()}`);
      setComplaint(res.data.complaint);
    } catch (err) {
      setComplaint(null);
      showToast(err.response?.data?.message || 'Complaint not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Track Complaint</h1>
      <p className="text-sm text-slate-500 mb-6">Enter your complaint ID to check its current status.</p>

      <form onSubmit={search} className="flex gap-2 max-w-lg mb-8">
        <input
          className="input-field"
          placeholder="e.g. CC-2026-000123"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {complaint && (
        <div className="card max-w-3xl">
          <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
            <div>
              <p className="text-xs font-mono text-slate-400">{complaint.complaintId}</p>
              <h2 className="font-semibold text-lg text-slate-800">{complaint.title}</h2>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-6">
            <p><span className="text-slate-400">Category:</span> {complaint.category}</p>
            <p><span className="text-slate-400">Department:</span> {complaint.department}</p>
            <p><span className="text-slate-400">Created:</span> {new Date(complaint.createdAt).toLocaleDateString()}</p>
            <p><span className="text-slate-400">Current Status:</span> {complaint.status}</p>
          </div>
          <ComplaintTimeline status={complaint.status} />
        </div>
      )}

      {!complaint && searched && !loading && (
        <p className="text-sm text-slate-400">No complaint found with that ID. Double-check and try again.</p>
      )}
    </DashboardLayout>
  );
}
