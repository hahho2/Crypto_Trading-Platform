import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { TrendingUp } from 'lucide-react';
import { Button, Card } from '../components/UI';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.signin({ email, password });
      
      if (response.isTwoFactorAuthEnable) {
        navigate('/verify-2fa', {
          state: { sessionId: response.session, otpExpiresAt: response.otpExpiresAt },
        });
      } else if (response.jwt) {
        localStorage.setItem('jwt', response.jwt);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans transition-colors duration-300">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the markets</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => navigate('/forgot-password')}
              className="text-xs text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </button>
          </div>

          <Button variant="primary" className="w-full h-10 mt-2" type="submit">
            {loading ? 'Processing...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-indigo-600 font-medium hover:text-indigo-500">
              Sign Up
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
