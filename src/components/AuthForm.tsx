import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, Sword } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Don't call onSuccess here - let the auth state change handle navigation
        console.log('Authentication successful');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-yellow-400 mr-4 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              HABIT HERO
            </h1>
            <Sparkles className="w-12 h-12 text-yellow-400 ml-4 animate-pulse" />
          </div>
          <p className="text-xl text-gray-300 mb-2">Begin Your Epic Adventure</p>
          <p className="text-gray-400">
            {isLogin ? 'Welcome back, hero!' : 'Create your legendary account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Sword className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Enter the Realm' : 'Join the Quest'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                    placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
                    focus:ring-opacity-50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret code"
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                    placeholder-gray-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 
                    focus:ring-opacity-50 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white 
                rounded-lg hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 
                disabled:cursor-not-allowed transition-all font-semibold transform hover:scale-105
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-5 h-5" />
                  {isLogin ? 'Begin Adventure' : 'Create Hero'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-yellow-400 hover:text-yellow-300 transition-colors font-semibold"
            >
              {isLogin 
                ? "New hero? Create your legend!" 
                : "Returning hero? Continue your quest!"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};