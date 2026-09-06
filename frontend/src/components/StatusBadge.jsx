import React from 'react';

const STYLES = {
  Submitted: 'bg-slate-100 text-slate-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
