import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Daly City Mitsubishi Sales Team Sign Up</h1>
        <p className="text-gray-600">
          Welcome to the Daly City Mitsubishi sales team registration page. 
          Please fill out the form below to request an account. 
          Your request will be reviewed by an administrator.
        </p>
      </div>
      <AuthForm isSignUp={true} />
    </div>
  );
}
