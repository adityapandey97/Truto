import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { DemoBanner } from '../../components/shared/DemoBanner.jsx';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'aditya@codepilot.dev',
      password: 'password123',
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Logged in successfully (Demo Session)');
      navigate('/app');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
  };

  const handleDemoFill = () => {
    setValue('email', 'aditya@codepilot.dev');
    setValue('password', 'password123');
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-codepilot-text">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">
            CodePilot <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-xs text-codepilot-muted">
          Access your repository intelligence and AI assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-codepilot-panel border border-codepilot-border py-8 px-6 sm:px-8 rounded-2xl shadow-panel space-y-6">
          <DemoBanner message="Demo Authentication: Sign in simulates an active session. Real authentication backend connects in Phase 3." />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              error={errors.password?.message}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-codepilot-subtle hover:text-codepilot-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-2 border-t border-codepilot-border/60 flex items-center justify-between text-xs text-codepilot-muted">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-indigo-400 hover:underline"
            >
              Fill Demo Credentials
            </button>
            <Link to="/signup" className="text-codepilot-text hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
