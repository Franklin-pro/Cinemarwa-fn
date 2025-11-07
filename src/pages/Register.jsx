import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { Mail, Lock, User, Film, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().split(' ').length < 2) {
      errors.name = 'Please enter your full name (first and last name)';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await dispatch(
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
    );

    if (result.payload) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 pt-24 pb-12 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent mb-2">
            Film Nyarwanda
          </h1>
          <p className="text-gray-400">Join us and discover amazing movies</p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 space-y-5"
        >
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                  validationErrors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-yellow-400'
                } focus:bg-gray-700 text-sm`}
              />
            </div>
            {validationErrors.name && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                  validationErrors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-yellow-400'
                } focus:bg-gray-700`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                  validationErrors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-yellow-400'
                } focus:bg-gray-700`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                  validationErrors.confirmPassword
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-600 focus:border-yellow-400'
                } focus:bg-gray-700`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">I am a:</label>
            <div className="space-y-3">
              {/* Viewer Option */}
              <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all" >
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={formData.role === 'viewer'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-400"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Movie Viewer</p>
                  <p className="text-gray-400 text-xs">Watch and enjoy movies</p>
                </div>
              </label>

              {/* Filmmaker Option */}
              <label className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="filmmaker"
                  checked={formData.role === 'filmmaker'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-yellow-400"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Filmmaker</p>
                  <p className="text-gray-400 text-xs">Upload and sell your films</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;