import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0B0D13] flex flex-col items-center justify-center p-6 text-center text-codepilot-text">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest">
        404 — Route Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3">
        Page Does Not Exist
      </h1>

      <p className="text-xs sm:text-sm text-codepilot-muted max-w-md mb-8">
        The requested path could not be found or has been moved. Check the URL or return to your active workspace dashboard.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/app">
          <Button variant="primary" size="md" icon={Home}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="md" icon={ArrowLeft}>
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
