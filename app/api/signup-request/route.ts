import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const { email, username, role } = await request.json();

  try {
    const { data, error } = await supabase
      .from('signup_requests')
      .insert([{ email, username, role, status: 'pending' }]);

    if (error) throw error;

    return NextResponse.json({ message: 'Sign-up request submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error submitting sign-up request:', error);
    return NextResponse.json({ error: 'Failed to submit sign-up request' }, { status: 500 });
  }
}
