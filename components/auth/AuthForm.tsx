'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// Remove this line completely:
// import { Database } from '@/types/supabase';

interface AuthFormProps {
  isSignUp: boolean;
}

export function AuthForm({ isSignUp }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('salesperson'); // Default role
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<{ auth: { users: any } }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role, // Include the selected role
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Sign up successful! Please check your email to verify your account.');
      }
    } else {
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
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <Image
          src="/images/mitsubishi-logo.png"
          alt="Mitsubishi Logo"
          width={200}
          height={100}
          className="mb-8 mx-auto"
        />
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h1>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        {success && <p className="mt-4 text-green-500 text-sm">{success}</p>}
        <p className="mt-4 text-sm text-center">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Sign In
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}