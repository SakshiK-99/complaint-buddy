import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, FileText, Download } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/mentees'),
      api.get('/complaints'),
    ])
      .then(([menteesRes, complaintsRes]) => {
        setMentees(menteesRes.data.mentees || []);
        setComplaints(complaintsRes.data.complaints || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const menteeComplaints = useMemo(() => {
    const ids = new Set(mentees.map((m) => String(m._id)));
    return complaints.filter((complaint) => ids.has(String(complaint.studentReference || complaint.studentId)) || complaint.mentorId === user?._id);
  }, [complaints, mentees, user]);

  const stats = useMemo(() => {
    const total = menteeComplaints.length;
    return {
      total,
      pending: menteeComplaints.filter((c) => c.status !== 'Resolved').length,
      resolved: menteeComplaints.filter((c) => c.status === 'Resolved').length,
      urgent: menteeComplaints.filter((c) => c.priority === 'Urgent').length,
    };
  }, [menteeComplaints]);

  const exportCsv = () => {
    const rows = [
      ['Complaint ID', 'Student', 'Category', 'Priority', 'Status', 'Department', 'Created'],
      ...menteeComplaints.map((c) => [
        c.complaintId,
        'Anonymous Student',
        c.category,
        c.priority,
        c.status,
        c.department,
        new Date(c.createdAt).toLocaleDateString(),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mentor-report-${user?.name?.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Mentor Dashboard</h1>
          <p className="text-sm text-slate-500">Anonymous complaints raised by your mentees and the current status of each issue.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-slate-500">Mentees</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{mentees.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.resolved}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-800">My Mentees</h2>
              <p className="text-sm text-slate-500">Students assigned to {user?.name}</p>
            </div>
            <button onClick={exportCsv} className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
          </div>

          {mentees.length === 0 ? (
            <EmptyState icon={Users} title="No mentees assigned" message="Assign students to this mentor from the admin user management page." />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {mentees.map((mentee) => (
                <div key={mentee._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <p className="font-semibold text-slate-800">{mentee.name}</p>
                  <p className="text-sm text-slate-500">{mentee.department} · {mentee.studentId || 'No ID'}</p>
                  <div className="mt-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1"><FileText className="w-4 h-4" /> {menteeComplaints.filter((c) => String(c.studentReference) === String(mentee._id)).length} complaints</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Complaint Report</h2>
          </div>

          {menteeComplaints.length === 0 ? (
            <div className="p-6"><EmptyState icon={FileText} title="No complaints for your mentees" message="Your assigned students have not raised any complaints yet." /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {menteeComplaints.map((c) => (
                    <tr key={c._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-xs">{c.complaintId}</td>
                      <td className="px-4 py-3">{c.category}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">{c.department}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
