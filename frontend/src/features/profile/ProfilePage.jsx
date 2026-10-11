import { useState } from 'react';
import { User, Mail, Briefcase, Building, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || 'Aditya Pandey');
  const [email, setEmail] = useState(user?.email || 'aditya@codepilot.dev');
  const [role, setRole] = useState(user?.role || 'Staff Engineer & Architect');
  const [workspace, setWorkspace] = useState(user?.workspace || 'Truto Core Engineering');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, email, role, workspace });
    setIsEditing(false);
    toast.success('Profile updated locally (Demo Session)');
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setRole(user?.role || '');
    setWorkspace(user?.workspace || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <DemoBanner message="User Profile: Session changes are saved in local browser storage. User accounts will be managed via MongoDB in Phase 3." />

      <PageHeader
        title="Developer Profile"
        description="Manage your account profile information and workspace affiliations."
        actions={
          !isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-codepilot-border">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-bold uppercase shadow-glow">
            {name ? name[0] : 'U'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-codepilot-text">{name}</h2>
            <p className="text-xs text-codepilot-muted font-mono">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 font-medium">
                {role}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-codepilot-surface border border-codepilot-border text-codepilot-muted">
                {workspace}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Role / Title"
              icon={Briefcase}
              value={role}
              disabled={!isEditing}
              onChange={(e) => setRole(e.target.value)}
            />

            <Input
              label="Primary Workspace"
              icon={Building}
              value={workspace}
              disabled={!isEditing}
              onChange={(e) => setWorkspace(e.target.value)}
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-codepilot-border">
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
