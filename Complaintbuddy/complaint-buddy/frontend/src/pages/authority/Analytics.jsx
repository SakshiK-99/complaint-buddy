import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7', '#14b8a6', '#f97316', '#64748b'];

function toChartData(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/analytics').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;
  if (!data || data.totals.total === 0) {
    return (
      <DashboardLayout>
        <EmptyState icon={BarChart3} title="Not enough data yet" message="Analytics will appear once complaints start coming in." />
      </DashboardLayout>
    );
  }

  const categoryData = toChartData(data.byCategory);
  const priorityData = toChartData(data.byPriority);
  const statusData = toChartData(data.byStatus);
  const monthData = toChartData(data.byMonth);

  const cards = [
    { label: 'Total Complaints', value: data.totals.total },
    { label: 'Resolved', value: data.totals.resolved },
    { label: 'Pending', value: data.totals.pending },
    { label: 'Urgent', value: data.totals.urgent },
    { label: 'Avg Resolution (days)', value: data.totals.avgResolutionDays ?? '—' },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Analytics</h1>
      <p className="text-sm text-slate-500 mb-6">Real-time insights from all complaint data.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs text-slate-500">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Complaints by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Complaints by Priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Complaints Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs text-slate-500">Most Common Category</p>
          <p className="font-semibold text-slate-800 mt-1">{data.mostCommonCategory || '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Department with Most Complaints</p>
          <p className="font-semibold text-slate-800 mt-1">{data.mostAffectedDepartment || '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-500">Repeated Issue Count</p>
          <p className="font-semibold text-slate-800 mt-1">{data.repeatedIssueCount}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
