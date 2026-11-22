import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  MessageSquareWarning, 
  TrendingUp, 
  Settings, 
  LogOut, 
  ArrowLeftRight, 
  Bell, 
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { TractorSilhouette } from '../components/TractorSilhouette';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AdminLayout: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState('Durg');

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/reports', label: 'Reports', icon: FileSpreadsheet },
    { path: '/admin/complaints', label: 'Complaints & Grievances', icon: MessageSquareWarning },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col md:flex-row antialiased text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-sidebar text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Logo variant="white" showTagline={true} size="md" />
          </div>

          <div className="px-6 py-3 bg-white/5 border-b border-white/10 text-xs flex items-center justify-between text-sage-200">
            <span>Bank Officer Console</span>
            <span className="px-2 py-0.5 rounded-full bg-sage-500/30 text-sage-300 font-mono text-[10px]">
              SBI • Durg
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-sage-600 text-white font-semibold shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-sage-300" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              switchRole('farmer');
              navigate('/farmer');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sage-700/60 hover:bg-sage-600 text-white text-xs font-semibold border border-sage-500/30 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Switch to Farmer Portal</span>
          </button>

          <button
            onClick={() => {
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-300" />
            <span>Sign Out</span>
          </button>

          <TractorSilhouette className="w-full h-12 opacity-40 mt-2" />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-warm-bg/95 backdrop-blur-md border-b border-warm-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Bank / Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Monitor records, verify discrepancies and resolve cases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* District dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-warm-border text-xs font-medium text-gray-700 shadow-soft">
              <Filter className="w-3.5 h-3.5 text-sage-600" />
              <span>District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent font-semibold text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="Durg">Durg (Chhattisgarh)</option>
                <option value="Raipur">Raipur</option>
                <option value="Bilaspur">Bilaspur</option>
                <option value="Rajnandgaon">Rajnandgaon</option>
                <option value="All">All Districts</option>
              </select>
            </div>

            {/* Quick link back to Farmer */}
            <button
              onClick={() => {
                switchRole('farmer');
                navigate('/farmer');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sage-100 text-sage-800 border border-sage-300 hover:bg-sage-200 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Farmer View</span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-sidebar text-white flex items-center justify-center font-bold text-xs">
                VS
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-none">Vikas Sharma</p>
                <p className="text-[10px] text-gray-500 mt-0.5">SBI Lead Bank Officer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet context={{ selectedDistrict }} />
        </main>
      </div>
    </div>
  );
};
