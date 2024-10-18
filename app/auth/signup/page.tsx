'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Salesperson');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      // First, check if the email is authorized
      const { data: authorizedEmail, error: authError } = await supabase
        .from('authorized_emails')
        .select('salesperson_id')
        .eq('email', email)
        .single();

      if (authError || !authorizedEmail) {
        throw new Error('Email is not authorized for signup');
      }

      // If email is authorized, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: username,
            email: email,
            role: role,
          });

        if (profileError) throw profileError;

        // If role is Salesperson, also insert into salespeople table
        if (role === 'Salesperson') {
          const { error: salespersonError } = await supabase
            .from('salespeople')
            .insert({
              id: data.user.id,
              name: username,
              email: email,
            });

          if (salespersonError) throw salespersonError;
        }

        // Redirect to dashboard or confirmation page
        router.push('/auth/signup-success');
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="Salesperson">Salesperson</option>
        <option value="Manager">Manager</option>
      </select>
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
    </form>
  );
}
