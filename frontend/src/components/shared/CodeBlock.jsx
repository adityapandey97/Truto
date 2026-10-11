import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function CodeBlock({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split('\n') : [];

  return (
    <div
      className={`rounded-lg border border-codepilot-border bg-[#0B0D13] overflow-hidden my-3 text-left ${className}`}
    >
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-codepilot-surface/70 border-b border-codepilot-border text-xs text-codepilot-muted">
        <span className="font-mono text-[11px] text-codepilot-text">
          {filename || language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-codepilot-hover text-codepilot-muted hover:text-codepilot-text transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto p-3 text-xs font-mono leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-codepilot-hover/30">
                {showLineNumbers && (
                  <td className="w-8 pr-3 text-right text-codepilot-subtle select-none opacity-40 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                )}
                <td className="text-codepilot-text whitespace-pre font-mono">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
