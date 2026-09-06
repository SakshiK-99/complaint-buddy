import React from 'react';
import { Check } from 'lucide-react';

const STAGES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export default function ComplaintTimeline({ status }) {
  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="flex items-center w-full overflow-x-auto py-2">
      {STAGES.map((stage, idx) => {
        const done = idx <= currentIndex;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  done ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 text-center ${done ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{stage}</span>
            </div>
            {idx < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${idx < currentIndex ? 'bg-primary-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
