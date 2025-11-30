import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ArrowRight, Loader2 } from "lucide-react";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", step);

      await signIn("password", formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials or user already exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-2xl max-w-sm w-full border border-zinc-200 dark:border-zinc-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {step === 'signIn' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {step === 'signIn' ? 'Sign in to access AI features' : 'Sign up to start your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-rose-500 text-xs text-center bg-rose-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                {step === 'signIn' ? 'Sign In' : 'Sign Up'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {step === 'signIn' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setStep('signUp')} className="text-zinc-900 dark:text-white font-medium hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => setStep('signIn')} className="text-zinc-900 dark:text-white font-medium hover:underline">
                Sign in
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-8 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 block mx-auto transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
