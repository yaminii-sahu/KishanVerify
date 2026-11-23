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

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USER,
  farmer: DEMO_FARMER,
  role: 'farmer',
  setRole: () => {},
  switchRole: () => {},
  isDemoMode: true,
  setDemoMode: () => {},
  updateFarmerAvatar: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('farmer');
  const [isDemoMode, setDemoMode] = useState<boolean>(true);

  const [user, setUser] = useState<User>(DEMO_USER);
  const [farmer, setFarmer] = useState<FarmerProfile>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('kisanverify_farmer_avatar') : null;
      return saved ? { ...DEMO_FARMER, avatarUrl: saved } : DEMO_FARMER;
    } catch {
      return DEMO_FARMER;
    }
  });

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
    if (newRole === 'admin') {
      setUser({
        id: 'u-admin-1',
        name: 'Vikas Sharma (SBI Durg)',
        phone: '+91 91234 56789',
        role: 'admin',
      });
    } else {
      setUser(DEMO_USER);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
