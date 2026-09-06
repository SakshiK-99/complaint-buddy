import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ComplaintCard from '../../components/ComplaintCard';
import api from '../../api/axios';
import { FilePlus2, Search, Inbox } from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/complaints')])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data.stats);
        setComplaints(complaintsRes.data.complaints.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const cards = [
    { label: 'Total Complaints', value: stats.total },
    { label: 'Pending', value: stats.pending },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'Resolved', value: stats.resolved },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-sm text-slate-500">Your anonymous complaints, all in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/submit-complaint" className="btn-primary flex items-center gap-2"><FilePlus2 className="w-4 h-4" /> Submit Complaint</Link>
          <Link to="/track" className="btn-secondary flex items-center gap-2"><Search className="w-4 h-4" /> Track Complaint</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-slate-800 mb-4">My Anonymous Complaints</h2>
      {complaints.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints yet" message="Submit your first complaint — it's completely anonymous." action={<Link to="/submit-complaint" className="btn-primary">Submit Complaint</Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      )}
    </DashboardLayout>
  );
}
