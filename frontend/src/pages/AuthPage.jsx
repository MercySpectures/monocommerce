import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      } else {
        await register(name, email, password, phone);
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setIsLogin(true);
    setEmail('customer@monocommerce.com');
    setPassword('customer123');
  };

  const fillDemoAdmin = () => {
    setIsLogin(true);
    setEmail('admin@monocommerce.com');
    setPassword('admin123');
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 md:py-24 space-y-8">
      {/* Tab toggle */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-mono text-[#737373] tracking-widest uppercase">
          ARCHIVAL ACCESS
        </span>
        <h1 className="text-3xl font-black uppercase tracking-tight text-black font-editorial">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E5]">
        <button
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            isLogin ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
            !isLogin ? 'border-b-2 border-black text-black' : 'text-[#737373] hover:text-black'
          }`}
        >
          Register
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Devin Vance"
              required
              className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black uppercase"
            />
          </div>
        )}

        <div>
          <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="devin@example.com"
            required
            className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
          />
        </div>

        {!isLogin && (
          <div>
            <label className="text-[10px] font-mono uppercase text-[#737373] block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2.5 border border-[#E5E5E5] text-xs font-medium focus:outline-none focus:border-black"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#171717] text-white text-xs font-mono">
            ! {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In to Account' : 'Create Archival Account'}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* Quick Demo Pre-fills */}
      <div className="pt-4 border-t border-[#E5E5E5] space-y-2">
        <span className="text-[10px] font-mono uppercase text-[#737373] block text-center">
          DEMO CREDENTIALS (CLICK TO AUTOFILL)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillDemoCustomer}
            className="p-2 border border-[#E5E5E5] bg-[#F5F5F5] hover:border-black text-[10px] font-mono uppercase text-black flex items-center justify-center gap-1 transition-colors"
          >
            <UserCheck size={12} />
            <span>Demo Customer</span>
          </button>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="p-2 border border-[#E5E5E5] bg-[#F5F5F5] hover:border-black text-[10px] font-mono uppercase text-black flex items-center justify-center gap-1 transition-colors"
          >
            <ShieldCheck size={12} />
            <span>Demo Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
