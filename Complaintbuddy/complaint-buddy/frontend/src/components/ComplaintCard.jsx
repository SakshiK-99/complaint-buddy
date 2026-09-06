import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye } from 'lucide-react';

export default function ComplaintCard({ complaint }) {
  const navigate = useNavigate();
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400 font-mono">{complaint.complaintId}</p>
          <h3 className="font-semibold text-slate-800 mt-1">{complaint.title}</h3>
        </div>
        <PriorityBadge priority={complaint.priority} />
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{complaint.category}</span>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{complaint.department}</span>
        <StatusBadge status={complaint.status} />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</span>
        <button
          onClick={() => navigate(`/complaints/${complaint._id}`)}
          className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline"
        >
          <Eye className="w-4 h-4" /> View
        </button>
      </div>
    </div>
  );
}
