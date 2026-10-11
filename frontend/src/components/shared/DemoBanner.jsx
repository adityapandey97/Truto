import { Info } from 'lucide-react';

export function DemoBanner({ message }) {
  return (
    <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg px-3.5 py-2 flex items-center gap-2.5 text-xs text-indigo-200">
      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
      <span>
        {message ||
          'Phase 2 Demo Mode: Operations are simulated locally on sample repository state without external backend services.'}
      </span>
    </div>
  );
}
