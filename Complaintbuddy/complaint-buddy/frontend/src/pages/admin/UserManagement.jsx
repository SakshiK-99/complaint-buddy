import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Users } from 'lucide-react';

const ROLES = ['student', 'cr', 'mentor', 'hod', 'principal', 'admin'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    api.get('/users').then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      showToast('Role updated', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const toggleStatus = async (user) => {
    const status = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/users/${user._id}/status`, { status });
      showToast(`User marked ${status}`, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">User Management</h1>
      <p className="text-sm text-slate-500 mb-6">View all users and manage their roles.</p>

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field py-1 text-xs w-auto"
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">{u.department}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`text-xs px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {u.status}
                    </button>
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
