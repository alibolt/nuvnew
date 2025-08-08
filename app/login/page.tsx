'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Development mode check
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard'); // Redirect to dashboard after login
    }
  };

  // Quick login function for development
  const quickLogin = async (userType: 'admin' | 'user') => {
    setError('');
    
    const credentials = {
      admin: { email: 'admin@nuvi.dev', password: 'admin123' },
      user: { email: 'user@nuvi.dev', password: 'user123' }
    };

    // Clear form fields
    setEmail('');
    setPassword('');

    const result = await signIn('credentials', {
      redirect: false,
      email: credentials[userType].email,
      password: credentials[userType].password,
    });

    if (result?.error) {
      setError(`Failed to login as ${userType}`);
    } else {
      // Direct redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>Sign In</h1>
        
        {/* Development Quick Login */}
        {isDevelopment && (
          <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm font-medium text-yellow-800 text-center">🚀 Development Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin')}
                className="py-2 px-3 text-sm font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all"
              >
                👤 Admin Login
              </button>
              <button
                onClick={() => quickLogin('user')}
                className="py-2 px-3 text-sm font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
              >
                🙋‍♂️ User Login
              </button>
            </div>
            <div className="text-xs text-gray-600 text-center">
              Admin: admin@nuvi.dev / admin123<br/>
              User: user@nuvi.dev / user123
            </div>
          </div>
        )}

        <button 
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full py-3 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50 transition-all"
        >
          <span>Sign in with Google</span>
        </button>
        <div className="flex items-center justify-center">
          <hr className="w-full"/>
          <span className="px-2 text-gray-500">or</span>
          <hr className="w-full"/>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B9F7E]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B9F7E]"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-[#8B9F7E] rounded-md hover:bg-opacity-90 transition-all">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-[#8B9F7E] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
