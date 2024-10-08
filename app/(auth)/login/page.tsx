'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Sign in successful!');
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user?.user_metadata.role === 'manager') {
        router.push('/dashboard/manager');
      } else {
        router.push('/dashboard/salesperson');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="w-full h-12 bg-red-600 flex items-center justify-between px-4 absolute top-0 left-0"></div>
      <div className="flex justify-center items-center h-screen relative">
        <div
          className="w-2/3 bg-white flex items-center justify-center p-4"
          style={{
            marginTop: '-50px',
            marginLeft: '-300px',
            position: 'relative',
          }}
        >
          <Image
            src="/images/dashboard-image.png"
            alt="Dashboard Overview"
            width={800}
            height={600}
            className="object-contain"
          />
        </div>
        <div
          className="bg-white flex flex-col items-center justify-center p-10 rounded-lg border border-gray-300"
          style={{
            marginTop: '-400px',
            marginLeft: '-150px',
            transform: 'translate(0, -50%)',
            top: '50%',
            position: 'relative',
          }}
        >
          <Image
            src="/images/mitsubishi-logo.png"
            alt="Mitsubishi Logo"
            width={300}
            height={200}
            className="mb-4"
          />
          <h1 className="text-xl mb-8 text-center">Sales Commission Portal</h1>
          <div className="w-full max-w-sm">
            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="mb-4">
                  <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-600">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring focus:border-gray-600"
              >
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </form>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full mt-4 text-blue-600 hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {success && <p className="mt-4 text-green-500">{success}</p>}
          </div>
          <footer className="mt-10 text-gray-500 text-sm text-center">
            Developed by Robertson CZ
          </footer>
        </div>
      </div>
    </div>
  );
}