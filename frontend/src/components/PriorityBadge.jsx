import React from 'react';

const STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STYLES[priority] || 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  );
}
