import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null); // State for server errors

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setServerError(null); // Reset server error before submission
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 404) {
        // Account not found, redirect to register
        setServerError('Account not found. Please register.');
        navigate('/register');
        return;
      }

      if (!response.ok) {
        // Display a general error if login fails
        const errorData = await response.json();
        setServerError(errorData.message || 'Failed to log in');
        return;
      }

      const data = await response.json();

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Navigate to the dashboard if login is successful
      navigate('/dashboard');
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
    <div>
      <label className="block text-lg font-semibold text-gray-800">Email</label>
      <input
        type="email"
        {...register('email', { required: 'Email is required' })}
        className="mt-2 block w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-700"
      />
      {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
    </div>

    <div>
      <label className="block text-lg font-semibold text-gray-800">Password</label>
      <input
        type="password"
        {...register('password', { required: 'Password is required' })}
        className="mt-2 block w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-700"
      />
      {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
    </div>

    {serverError && (
      <div className="mt-2 text-sm text-red-500">
        {serverError}
      </div>
    )}

    <button
      type="submit"
      className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
    >
      Sign in
    </button>

    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
          Register here
        </Link>
      </p>
    </div>
  </form>
);
}
