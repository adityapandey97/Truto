import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FolderGit2,
  Bot,
  GitPullRequest,
  Activity,
  Terminal,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0D13] text-codepilot-text selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation */}
      <header className="h-16 border-b border-codepilot-border/60 bg-[#0B0D13]/90 backdrop-blur-md sticky top-0 z-40 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            CodePilot <span className="text-indigo-400">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-codepilot-muted">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#capabilities" className="hover:text-white transition-colors">
            Capabilities
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 max-w-5xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 mb-6">
          <Badge variant="indigo" size="md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1" />
            Phase 2: Intelligent Developer Interface
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Understand Your Codebase.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300">
            Build Faster.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-codepilot-muted max-w-2xl mx-auto leading-relaxed">
          An AI-powered codebase assistant designed to help developers explore, analyze, and modify complex software repositories with contextual precision.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/app">
            <Button size="lg" variant="primary" icon={ArrowRight}>
              Get Started
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="secondary">
              Explore Features
            </Button>
          </a>
        </div>

        {/* Product UI Preview Window */}
        <div className="mt-14 rounded-2xl border border-codepilot-border bg-codepilot-panel shadow-panel overflow-hidden text-left max-w-4xl mx-auto">
          <div className="h-10 bg-[#0E111A] border-b border-codepilot-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-codepilot-subtle">
              CodePilot AI Assistant — codepilot-core
            </span>
            <div className="w-12" />
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0B0D13]/60">
            {/* Mock File Tree column */}
            <div className="border border-codepilot-border rounded-lg p-3 bg-codepilot-panel/40 font-mono text-xs space-y-1.5 text-codepilot-muted">
              <div className="text-[11px] text-codepilot-subtle font-sans font-semibold uppercase tracking-wider mb-2">
                Repository Tree
              </div>
              <div className="text-indigo-300">▼ src/</div>
              <div className="pl-4 text-emerald-300">● index.js</div>
              <div className="pl-4">▼ auth/</div>
              <div className="pl-8 text-emerald-300">● jwtMiddleware.js</div>
              <div className="pl-4">▼ indexer/</div>
              <div className="pl-8 text-emerald-300">● symbolParser.js</div>
            </div>

            {/* Mock Chat preview column */}
            <div className="md:col-span-2 border border-codepilot-border rounded-lg p-4 bg-codepilot-panel/40 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  YOU
                </div>
                <div className="p-2.5 rounded-lg bg-codepilot-surface text-codepilot-text border border-codepilot-border">
                  Explain the architecture of this repository.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-violet-600/30 text-violet-400 flex items-center justify-center font-bold text-[10px]">
                  AI
                </div>
                <div className="p-3 rounded-lg bg-codepilot-panel text-codepilot-text border border-codepilot-border space-y-2">
                  <p className="text-codepilot-muted">
                    Found 3 relevant files: <code className="text-indigo-300">src/index.js</code>, <code className="text-indigo-300">src/auth/jwtMiddleware.js</code>, and <code className="text-indigo-300">src/indexer/symbolParser.js</code>.
                  </p>
                  <div className="bg-[#0B0D13] p-2.5 rounded font-mono text-[11px] text-indigo-300 border border-codepilot-border">
                    // Inbound Express Gateway routed to AST Symbol Engine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-codepilot-border/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for High-Velocity Software Teams
          </h2>
          <p className="mt-3 text-sm text-codepilot-muted">
            Seamlessly navigate complex codebases with deep structural awareness and deterministic developer tooling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mb-4">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Repository Intelligence
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Multi-repository ingestion with language breakdown, symbol indexing, commit tree mapping, and file hierarchy tracking.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Context-Aware AI Assistant
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Ask questions about architectures, trace request flows, diagnose error handling gaps, and examine functions with syntax highlighting.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Integrated Monaco Explorer
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Browse repositories with the industry-standard Monaco Editor featuring line numbers, file metadata, and responsive tabs.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center mb-4">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Change Reviews & Diffs
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Inspect side-by-side or unified code diffs, review additions and deletions, and manage approvals with local state updates.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Background Indexing Pipeline
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Monitor repository imports, AST symbol extraction, embedding generation, and validation jobs with event timelines and logs.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-codepilot-panel border border-codepilot-border hover:border-codepilot-borderLight transition-all">
            <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              Automated Test Telemetry
            </h3>
            <p className="mt-2 text-xs text-codepilot-muted leading-relaxed">
              Track unit and integration test suites, failure traces, execution durations, and historical test reliability trends.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 max-w-7xl mx-auto border-t border-codepilot-border/60 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System Architecture Workflow
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-codepilot-muted max-w-xl mx-auto mb-14">
          Structured end-to-end data pipeline connecting repository source trees with developer interfaces.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
          {[
            { step: '01', title: 'Repository Ingestion', desc: 'Git cloning, AST parsing, symbol extraction' },
            { step: '02', title: 'Background Indexing', desc: 'Chunk segmentation & vector embedding' },
            { step: '03', title: 'Context Retrieval', desc: 'Semantic search & relevance scoring' },
            { step: '04', title: 'AI Assistant', desc: 'Conversational code synthesis & answers' },
            { step: '05', title: 'Code Reviews', desc: 'Diff inspection & interactive verification' },
          ].map((item) => (
            <div key={item.step} className="flex-1 p-4 rounded-xl bg-codepilot-panel border border-codepilot-border text-left w-full">
              <span className="text-[10px] font-mono text-indigo-400 font-bold">
                {item.step}
              </span>
              <h4 className="text-xs font-semibold text-white mt-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-codepilot-muted mt-1 leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 px-6 max-w-7xl mx-auto border-t border-codepilot-border/60">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-codepilot-panel border border-indigo-900/40 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Serious Engineering
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-codepilot-muted max-w-xl mx-auto">
            CodePilot AI leverages enterprise design standards with zero unnecessary fluff, responsive layouts, and clean separation between UI and future backend microservices.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link to="/app">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Enter CodePilot Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-codepilot-border/60 py-10 px-6 text-center text-xs text-codepilot-subtle">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-codepilot-text">CodePilot AI</span>
            <span>— Phase 2 Frontend Architecture</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/app/repositories" className="hover:text-codepilot-text">
              Repositories
            </Link>
            <Link to="/app/assistant" className="hover:text-codepilot-text">
              Assistant
            </Link>
            <Link to="/app/reviews" className="hover:text-codepilot-text">
              Reviews
            </Link>
            <Link to="/app/jobs" className="hover:text-codepilot-text">
              Jobs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
