import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const { id } = await request.json();

  try {
    const { error } = await supabase
      .from('signup_requests')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) throw error;

    // TODO: Send an email to the user informing them that their request was rejected

    return NextResponse.json({ message: 'Sign-up request rejected' }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting sign-up request:', error);
    return NextResponse.json({ error: 'Failed to reject sign-up request' }, { status: 500 });
  }
}
