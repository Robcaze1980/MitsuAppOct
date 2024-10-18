import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const { id } = await request.json();

  try {
    // Fetch the signup request
    const { data: requestData, error: fetchError } = await supabase
      .from('signup_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Create the user account
    const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
      email: requestData.email,
      password: 'temporaryPassword123!', // You should generate a random password here
      email_confirm: true,
      user_metadata: { role: requestData.role, username: requestData.username }
    });

    if (signUpError) throw signUpError;

    // Update the signup request status
    const { error: updateError } = await supabase
      .from('signup_requests')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateError) throw updateError;

    // TODO: Send an email to the user with their temporary password

    return NextResponse.json({ message: 'Sign-up request approved and user account created' }, { status: 200 });
  } catch (error) {
    console.error('Error approving sign-up request:', error);
    return NextResponse.json({ error: 'Failed to approve sign-up request' }, { status: 500 });
  }
}
