import React, { useState } from 'react';
import { UserIcon, LockIcon, SpectrumIcon } from '../icons';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || password.trim() === '') {
      setError('Please enter both email and password.');
      return;
    }
    // In a real app, you'd have an API call here.
    // For this demo, any non-empty fields will log in.
    setError('');
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-light-gray p-4">
      <div className="w-full max-w-md bg-theme-white rounded-2xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <SpectrumIcon className="w-16 h-16 mx-auto text-accent-orange" />
          <h1 className="text-3xl font-bold text-text-light-primary mt-4">TVWS Connect Mapper</h1>
          <p className="text-text-light-secondary">Field Technician Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="technician@email.com"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-text-light-primary focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition"
              aria-label="Email Address"
            />
          </div>
          <div className="relative">
            <LockIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-text-light-primary focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent transition"
              aria-label="Password"
            />
          </div>
          
          {error && <p className="text-sm text-accent-orange-dark text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-gradient-to-r from-accent-orange to-accent-orange-light rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Secure Login
          </button>
        </form>

        <div className="text-center text-xs text-text-light-secondary pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-text-light-primary mb-2">Privacy & Data Notice</h3>
          <p>
            By logging in, you consent to the use of your device's geolocation for spectrum analysis and installation logging. All data is handled securely and is for internal operational use only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;