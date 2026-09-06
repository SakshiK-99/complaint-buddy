import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Eye, Inbox } from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/stats'), api.get('/complaints')])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data.stats);
        setComplaints(complaintsRes.data.complaints.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const cards = [
    { label: 'Total Complaints', value: stats.total },
    { label: 'Pending', value: stats.pending },
    { label: 'Urgent', value: stats.urgent, highlight: true },
    { label: 'Resolved', value: stats.resolved },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1 capitalize">{user.role} Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Complaints assigned to your role, sorted by priority.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`card ${c.highlight && c.value > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className={`text-3xl font-bold mt-1 ${c.highlight && c.value > 0 ? 'text-red-600' : 'text-slate-800'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Recent Complaints</h2>
        <Link to="/complaint-management" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
      </div>

      {complaints.length === 0 ? (
        <EmptyState icon={Inbox} title="No complaints assigned" message="You're all caught up." />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className={`border-t border-slate-100 ${c.priority === 'Urgent' ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{c.complaintId}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link to={`/complaints/${c._id}`} className="text-primary-600 flex items-center gap-1"><Eye className="w-4 h-4" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
