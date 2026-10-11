import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderGit2, FolderPlus, Info, Check } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { repositoryService } from '../../services/repositoryService.js';
import toast from 'react-hot-toast';

const addRepoSchema = z.object({
  name: z.string().min(2, 'Repository name must be at least 2 characters'),
  url: z.string().url('Must be a valid URL (e.g. https://github.com/org/repo)'),
  branch: z.string().min(1, 'Default branch is required'),
  description: z.string().optional(),
});

const PRESET_REPOS = [
  {
    name: 'fastapi-indexer-service',
    url: 'https://github.com/truto/fastapi-indexer-service',
    branch: 'main',
    description: 'High-throughput AST symbol parser and semantic vector generator.',
  },
  {
    name: 'kubernetes-deployer',
    url: 'https://github.com/truto/kubernetes-deployer',
    branch: 'main',
    description: 'Declarative cluster orchestration manifests and helm templates.',
  },
];

export function AddRepositoryModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addRepoSchema),
    defaultValues: {
      name: '',
      url: '',
      branch: 'main',
      description: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const newRepo = await repositoryService.createRepository(data);
      toast.success(`Repository ${newRepo.name} imported (Demo Session)`);
      reset();
      onSuccess?.(newRepo);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to import repository');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setValue('name', preset.name);
    setValue('url', preset.url);
    setValue('branch', preset.branch);
    setValue('description', preset.description);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Repository"
      description="Connect a Git repository to CodePilot AI intelligence"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Notice */}
        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            <strong>Phase 2 Simulation:</strong> Real GitHub token OAuth and remote cloning require the Node.js/Express backend (Phase 3). You can import demo repositories or simulate custom entries.
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-medium text-codepilot-muted mb-1.5">
            Select Preset Sample Repository:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_REPOS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="p-2.5 rounded-lg border border-codepilot-border hover:border-indigo-500/60 bg-codepilot-surface/40 hover:bg-codepilot-surface text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-codepilot-text truncate">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{preset.name}</span>
                </div>
                <p className="text-[11px] text-codepilot-subtle truncate mt-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
          <Input
            label="Repository Name"
            placeholder="e.g. codepilot-api"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Git Repository URL"
            placeholder="https://github.com/organization/repository"
            icon={FolderGit2}
            error={errors.url?.message}
            {...register('url')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Default Branch"
              placeholder="main"
              error={errors.branch?.message}
              {...register('branch')}
            />
            <Input
              label="Short Description"
              placeholder="Optional overview"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-codepilot-border mt-4">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={FolderPlus}
            >
              Import (Demo)
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
