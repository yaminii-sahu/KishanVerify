import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream-surface rounded-3xl p-6 sm:p-8 shadow-card border border-warm-border">
        {/* Brand */}
        <div className="flex justify-center mb-6">
          <Logo variant="dark" size="md" showTagline={true} />
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-cream rounded-2xl mb-6 border border-warm-border">
          <button
            type="button"
            onClick={() => setTab('farmer')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'farmer'
                ? 'bg-cream-surface text-charcoal shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <User className="w-4 h-4 text-forest" />
            <span>Farmer Portal</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('admin')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === 'admin'
                ? 'bg-cream-surface text-charcoal shadow-soft'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Bank / Admin</span>
          </button>
        </div>

        {/* 1-Click Instant Demo Button */}
        <div className="mb-6 p-3 rounded-2xl bg-tint border border-forest/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-forest shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-forest">1-Click Quick Demo</p>
              <p className="text-[11px] text-charcoal-muted">Pre-seeded farmer & bank records</p>
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
            className="px-3.5 py-1.5 rounded-xl bg-olive hover:bg-forest text-white text-xs font-bold shadow-soft transition-colors"
          >
            Launch
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {tab === 'farmer' ? (
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                Mobile Number or Farmer ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-charcoal-muted">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  className="w-full pl-12 pr-4 py-3 bg-cream rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive font-medium"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Bank / Officer Employee ID
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="e.g. SBI-DURG-881"
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive font-medium"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full h-[52px] rounded-xl bg-olive hover:bg-forest text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-colors mt-2"
          >
            <span>Sign In to {tab === 'farmer' ? 'Farmer Portal' : 'Admin Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-charcoal-muted">
          Protected by Ministry of Agriculture & Farmers Welfare • GoI
        </div>
      </div>
    </div>
  );
};
