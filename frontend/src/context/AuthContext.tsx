import React, { createContext, useContext, useState } from 'react';
import { FarmerProfile, Role, User } from '../types';

interface AuthContextType {
  user: User;
  farmer: FarmerProfile;
  role: Role;
  setRole: (role: Role) => void;
  switchRole: (role: Role) => void;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  updateFarmerAvatar: (url: string | null) => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (role: Role, user?: User) => void;
  logout: () => void;
}

const DEMO_FARMER: FarmerProfile = {
  id: 'f-1',
  farmerId: 'FV12345',
  name: 'Ramesh Kumar',
  nameHi: 'रमेश कुमार',
  phone: '+91 98765 43210',
  village: 'Patan',
  district: 'Durg',
  state: 'Chhattisgarh',
  landAreaAcres: 3.0,
  crop: 'Paddy',
  category: 'Small Farmer',
  bankName: 'State Bank of India',
  accountNumberMasked: 'SBIN*******1234',
  kccActive: true,
};

const DEMO_USER: User = {
  id: 'u-1',
  name: 'Ramesh Kumar',
  phone: '+91 98765 43210',
  role: 'farmer',
  farmerId: 'FV12345',
};

const DEMO_ADMIN_USER: User = {
  id: 'u-admin-1',
  name: 'Vikas Sharma (SBI Durg)',
  phone: '+91 91234 56789',
  role: 'admin',
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USER,
  farmer: DEMO_FARMER,
  role: 'farmer',
  setRole: () => {},
  switchRole: () => {},
  isDemoMode: true,
  setDemoMode: () => {},
  updateFarmerAvatar: () => {},
  isAuthenticated: true,
  isAuthReady: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_user_role') : null;
      if (saved === 'admin' || saved === 'farmer') return saved;
    } catch {}
    return 'farmer';
  });

  const [isDemoMode, setDemoModeState] = useState<boolean>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_demo_mode') : null;
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [user, setUser] = useState<User>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_user') : null;
      if (saved) return JSON.parse(saved);
    } catch {}
    return role === 'admin' ? DEMO_ADMIN_USER : DEMO_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_authenticated') : null;
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // Default true in Demo mode so farmer is always authenticated
  });

  const [isAuthReady] = useState<boolean>(true);

  const [farmer, setFarmer] = useState<FarmerProfile>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_farmer_avatar') : null;
      return saved ? { ...DEMO_FARMER, avatarUrl: saved } : DEMO_FARMER;
    } catch {
      return DEMO_FARMER;
    }
  });

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    try {
      localStorage.setItem('kisanverify_demo_mode', String(val));
    } catch {}
  };

  const updateFarmerAvatar = (url: string | null) => {
    try {
      if (url) {
        localStorage.setItem('kisanverify_farmer_avatar', url);
        setFarmer(prev => ({ ...prev, avatarUrl: url }));
      } else {
        localStorage.removeItem('kisanverify_farmer_avatar');
        setFarmer(prev => {
          const next = { ...prev };
          delete next.avatarUrl;
          return next;
        });
      }
    } catch {
      if (url) {
        setFarmer(prev => ({ ...prev, avatarUrl: url }));
      }
    }
  };

  const switchRole = (newRole: Role) => {
    setRoleState(newRole);
    setIsAuthenticated(true);
    const targetUser = newRole === 'admin' ? DEMO_ADMIN_USER : DEMO_USER;
    setUser(targetUser);
    try {
      localStorage.setItem('kisanverify_user_role', newRole);
      localStorage.setItem('kisanverify_user', JSON.stringify(targetUser));
      localStorage.setItem('kisanverify_authenticated', 'true');
    } catch {}
  };

  const login = (newRole: Role, newUser?: User) => {
    const targetUser = newUser || (newRole === 'admin' ? DEMO_ADMIN_USER : DEMO_USER);
    setRoleState(newRole);
    setUser(targetUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('kisanverify_user_role', newRole);
      localStorage.setItem('kisanverify_user', JSON.stringify(targetUser));
      localStorage.setItem('kisanverify_authenticated', 'true');
    } catch {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(DEMO_USER);
    setRoleState('farmer');
    try {
      localStorage.removeItem('kisanverify_authenticated');
      localStorage.removeItem('kisanverify_user');
      localStorage.removeItem('kisanverify_user_role');
    } catch {}
  };

  const setRole = (newRole: Role) => {
    switchRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmer,
        role,
        setRole,
        switchRole,
        isDemoMode,
        setDemoMode,
        updateFarmerAvatar,
        isAuthenticated,
        isAuthReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
