import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ClipboardList, Eye, X } from 'lucide-react';

const EMPTY_FORM = {
  week: '', department: '', commonConcerns: '', academicConcerns: '',
  infrastructureConcerns: '', otherConcerns: '', recurringIssues: '', mentorRemarks: '',
};

export default function WeeklyReports() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/reports/weekly').then((res) => setReports(res.data.reports)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (status) => {
    if (!form.week || !form.department) {
      showToast('Week and department are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/reports/weekly', { ...form, status });
      showToast(status === 'Submitted' ? 'Report submitted' : 'Draft saved', 'success');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save report', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Weekly Reports</h1>
      <p className="text-sm text-slate-500 mb-6">Mentor weekly reports on student concerns and recurring issues.</p>

      {user.role === 'mentor' && (
        <div className="card max-w-2xl mb-8">
          <h2 className="font-semibold text-slate-800 mb-4">New Weekly Report</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Week</label>
              <input className="input-field" placeholder="e.g. Week of Sep 1" value={form.week} onChange={update('week')} />
            </div>
            <div>
              <label className="label">Department / Class</label>
              <input className="input-field" value={form.department} onChange={update('department')} />
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="label">Common student concerns</label><textarea rows={2} className="input-field" value={form.commonConcerns} onChange={update('commonConcerns')} /></div>
            <div><label className="label">Academic concerns</label><textarea rows={2} className="input-field" value={form.academicConcerns} onChange={update('academicConcerns')} /></div>
            <div><label className="label">Infrastructure concerns</label><textarea rows={2} className="input-field" value={form.infrastructureConcerns} onChange={update('infrastructureConcerns')} /></div>
            <div><label className="label">Other concerns</label><textarea rows={2} className="input-field" value={form.otherConcerns} onChange={update('otherConcerns')} /></div>
            <div><label className="label">Recurring issues</label><textarea rows={2} className="input-field" value={form.recurringIssues} onChange={update('recurringIssues')} /></div>
            <div><label className="label">Mentor remarks</label><textarea rows={2} className="input-field" value={form.mentorRemarks} onChange={update('mentorRemarks')} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button disabled={saving} onClick={() => save('Draft')} className="btn-secondary">Save Draft</button>
            <button disabled={saving} onClick={() => save('Submitted')} className="btn-primary">Submit Report</button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No weekly reports yet" />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Submitted Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{r.mentor?.name}</td>
                  <td className="px-4 py-3">{r.week}</td>
                  <td className="px-4 py-3">{r.department}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(r)} className="text-primary-600 flex items-center gap-1"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h2 className="font-bold text-lg text-slate-800 mb-1">{selected.week}</h2>
            <p className="text-sm text-slate-500 mb-4">{selected.department} · {selected.mentor?.name}</p>
            {[
              ['Common concerns', selected.commonConcerns],
              ['Academic concerns', selected.academicConcerns],
              ['Infrastructure concerns', selected.infrastructureConcerns],
              ['Other concerns', selected.otherConcerns],
              ['Recurring issues', selected.recurringIssues],
              ['Mentor remarks', selected.mentorRemarks],
            ].map(([label, value]) => (
              <div key={label} className="mb-3">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm text-slate-700">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
