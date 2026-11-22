import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Phone, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const [tab, setTab] = useState<'farmer' | 'admin'>('farmer');
  const [phone, setPhone] = useState('9876543210');
  const [adminId, setAdminId] = useState('SBI-DURG-881');
  const [password, setPassword] = useState('••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'farmer') {
      switchRole('farmer');
      navigate('/farmer');
    } else {
      switchRole('admin');
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-warm-border">
        {/* Brand */}
        <div className="flex justify-center mb-6">
          <Logo variant="dark" size="md" showTagline={true} />
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-warm-card rounded-2xl mb-6 border border-warm-border">
          <button
            type="button"
            onClick={() => setTab('farmer')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'farmer'
                ? 'bg-white text-gray-900 shadow-soft'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4 text-sage-600" />
            <span>Farmer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('admin')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'admin'
                ? 'bg-white text-gray-900 shadow-soft'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <span>Bank / Admin</span>
          </button>
        </div>

        {/* 1-Click Instant Demo Button */}
        <div className="mb-6 p-3 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sage-600 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-sage-900">1-Click Demo Mode</p>
              <p className="text-[11px] text-sage-700">Pre-seeded sample farmer & bank records</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (tab === 'farmer') {
                switchRole('farmer');
                navigate('/farmer');
              } else {
                switchRole('admin');
                navigate('/admin');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold shadow-soft"
          >
            Launch
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {tab === 'farmer' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mobile Number or Farmer ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-warm-border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="Enter 10 digit number"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Default demo: 9876543210 (Ramesh Kumar, Durg)</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Bank Officer Employee ID
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-warm-border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Branch Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-2xl border border-warm-border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full h-12 py-3 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>{tab === 'farmer' ? 'Enter Farmer Portal' : 'Login to Bank Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>KisanVerify • Built for Agricultural Financial Transparency</p>
        </div>
      </div>
    </div>
  );
};
