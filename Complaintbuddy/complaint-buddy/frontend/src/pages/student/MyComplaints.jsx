import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ComplaintCard from '../../components/ComplaintCard';
import api from '../../api/axios';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints').then((res) => setComplaints(res.data.complaints)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My Anonymous Complaints</h1>
      <p className="text-sm text-slate-500 mb-6">All complaints you've submitted, tracked from start to resolution.</p>

      {loading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints yet" message="You haven't submitted any complaints." action={<Link to="/submit-complaint" className="btn-primary">Submit Complaint</Link>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      )}
    </DashboardLayout>
  );
}
