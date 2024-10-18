'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SignupRequest {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  created_at: string;
}

export default function SignupRequests() {
  const [requests, setRequests] = useState<SignupRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from('signup_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching signup requests:', error);
      setError('Failed to fetch signup requests');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/signup-request/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      // Update the local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      ));
    } catch (error) {
      console.error('Error approving request:', error);
      setError('Failed to approve request');
    }
    setLoading(false);
  }

  async function handleReject(id: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/signup-request/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Update the local state
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request');
    }
    setLoading(false);
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Signup Requests</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Username</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="py-2 px-4 border-b">{request.email}</td>
              <td className="py-2 px-4 border-b">{request.username}</td>
              <td className="py-2 px-4 border-b">{request.role}</td>
              <td className="py-2 px-4 border-b">{request.status}</td>
              <td className="py-2 px-4 border-b">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
