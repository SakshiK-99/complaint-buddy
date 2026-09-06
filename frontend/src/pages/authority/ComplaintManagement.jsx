import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import api from '../../api/axios';
import { Eye, Search } from 'lucide-react';

const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['Academic', 'Infrastructure', 'Faculty', 'Hostel', 'Transport', 'Canteen', 'Examination', 'Harassment', 'Other'];

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });

  const load = () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/complaints', { params }).then((res) => setComplaints(res.data.complaints)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters.status, filters.priority, filters.category]);

  const submitSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Complaint Management</h1>
      <p className="text-sm text-slate-500 mb-6">Review, escalate, and resolve complaints assigned to you.</p>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <form onSubmit={submitSearch} className="flex gap-2 flex-1 min-w-[220px]">
            <input
              className="input-field"
              placeholder="Search by ID or title"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <button type="submit" className="btn-secondary"><Search className="w-4 h-4" /></button>
          </form>
          <select className="input-field w-auto" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field w-auto" value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="input-field w-auto" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints found" message="Try adjusting your filters." />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className={`border-t border-slate-100 ${c.priority === 'Urgent' ? 'bg-red-50/50' : ''}`}>
                  <td className="px-4 py-3 font-mono text-xs">{c.complaintId}</td>
                  <td className="px-4 py-3">{c.category}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3">{c.department}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 uppercase text-xs text-slate-500">{c.assignedRole}</td>
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
