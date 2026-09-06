import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { Repeat } from 'lucide-react';

export default function RecurringIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/analytics').then((res) => setIssues(res.data.recurringIssues)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Recurring Issues</h1>
      <p className="text-sm text-slate-500 mb-6">Automatically detected using simple keyword similarity — no AI APIs used.</p>

      {issues.length === 0 ? (
        <EmptyState icon={Repeat} title="No recurring issues detected" message="Once similar complaints are submitted, they'll be grouped here." />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Latest Report</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-700">{issue.issue}</td>
                  <td className="px-4 py-3">
                    <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-1 rounded-full">{issue.count} reports</span>
                  </td>
                  <td className="px-4 py-3">{issue.category}</td>
                  <td className="px-4 py-3">{issue.department}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(issue.latestReport).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
