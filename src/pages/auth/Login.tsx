import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-cream-lightest flex items-center justify-center p-4">
      <div className="vintage-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brown-darkest mb-2">ThrowbackTee</h1>
          <p className="text-brown-dark">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brown-darkest mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="vintage-input w-full"
              placeholder="admin@throwbacktee.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-red">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brown-darkest mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="vintage-input w-full"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-red">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-status-red/10 border border-status-red rounded text-status-red text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="vintage-button w-full flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cream-lightest mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brown-dark">
          <p>Demo Credentials:</p>
          <p>Email: admin@throwbacktee.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 