import React from 'react';
import { RegisterForm } from '../components/RegisterForm';

export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 py-12 sm:px-6 lg:px-8">
      <div className="sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-6">
          Create account
        </h2>

        <RegisterForm />
      </div>
    </div>
  );
}