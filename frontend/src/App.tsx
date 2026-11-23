import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { FarmerLayout } from './layouts/FarmerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { SplashPage } from './pages/SplashPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { FarmerHomePage } from './pages/FarmerHomePage';
import { SchemesPage } from './pages/SchemesPage';
import { LoanVerificationPage } from './pages/LoanVerificationPage';
import { MSPVerificationPage } from './pages/MSPVerificationPage';
import { InsuranceVerificationPage } from './pages/InsuranceVerificationPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { GrievancePage } from './pages/GrievancePage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DocumentsPage } from './pages/DocumentsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminComplaintsPage } from './pages/AdminComplaintsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { ApiToastContainer } from './components/ApiToastContainer';
import { ServerReadinessGate } from './components/ServerReadinessGate';

export default function App() {
  return (
    <ServerReadinessGate>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <ApiToastContainer />
            <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<SplashPage />} />
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Farmer Portal (Mobile Bottom Tab Bar + Desktop Sidebar Layout) */}
            <Route path="/farmer" element={<FarmerLayout />}>
              <Route index element={<FarmerHomePage />} />
              <Route path="schemes" element={<SchemesPage />} />
              <Route path="loan-verify" element={<LoanVerificationPage />} />
              <Route path="msp-verify" element={<MSPVerificationPage />} />
              <Route path="insurance-verify" element={<InsuranceVerificationPage />} />
              <Route path="assistant" element={<AIAssistantPage />} />
              <Route path="grievance" element={<GrievancePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Bank / Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ServerReadinessGate>
  );
}
