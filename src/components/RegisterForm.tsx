import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

interface RegisterFormData {
  username: string;   // Added username
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const navigate = useNavigate();

  const onSubmit = async ({ username, email, password, confirmPassword }: RegisterFormData) => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),  // Pass username, email, and password
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to register');
        return;
      }

      // Redirect to login after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
      <div>
        <label className="block text-lg font-semibold text-gray-800">Username</label>
        <input
          type="text"
          {...register('username', { required: 'Username is required' })}
          className="mt-2 block w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-700"
        />
        {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username.message}</p>}
      </div>

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

      <div>
        <label className="block text-lg font-semibold text-gray-800">Confirm Password</label>
        <input
          type="password"
          {...register('confirmPassword', { required: 'Confirm password is required' })}
          className="mt-2 block w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-700"
        />
        {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        Sign up
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </form>
  );
}
