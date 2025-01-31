import React from 'react';
import { LoginForm } from '../components/LoginForm';

export function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 py-12 sm:px-6 lg:px-8">
      <div className="sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-6">
          Sign in 
        </h2>

        <LoginForm />
      </div>
    </div>
  );
}