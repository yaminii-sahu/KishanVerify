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
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { MandiPricesPage } from './pages/MandiPricesPage';
import { WeatherPage } from './pages/WeatherPage';
import { NearbyOfficesPage } from './pages/NearbyOfficesPage';
import { ContactPage } from './pages/ContactPage';

// Policy & Information Pages
import { AboutPage } from './pages/policies/AboutPage';
import { TermsPage } from './pages/policies/TermsPage';
import { PrivacyPage } from './pages/policies/PrivacyPage';
import { DisclaimerPage } from './pages/policies/DisclaimerPage';
import { HyperlinkPolicyPage } from './pages/policies/HyperlinkPolicyPage';
import { CopyrightPage } from './pages/policies/CopyrightPage';
import { AccessibilityPage } from './pages/policies/AccessibilityPage';
import { FaqPage } from './pages/policies/FaqPage';
import { SitemapPage } from './pages/policies/SitemapPage';

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
              <Route path="loan" element={<LoanVerificationPage />} />
              <Route path="msp-verify" element={<MSPVerificationPage />} />
              <Route path="msp" element={<MSPVerificationPage />} />
              <Route path="insurance-verify" element={<InsuranceVerificationPage />} />
              <Route path="insurance" element={<InsuranceVerificationPage />} />
              <Route path="mandi" element={<MandiPricesPage />} />
              <Route path="weather" element={<WeatherPage />} />
              <Route path="offices" element={<NearbyOfficesPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="assistant" element={<AIAssistantPage />} />
              <Route path="grievance" element={<GrievancePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:reportId" element={<ReportDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Direct convenience aliases */}
            <Route path="/loan-verification" element={<Navigate to="/farmer/loan-verify" replace />} />
            <Route path="/msp-verification" element={<Navigate to="/farmer/msp-verify" replace />} />
            <Route path="/verify/loan/:id" element={<FarmerLayout />}>
              <Route index element={<LoanVerificationPage />} />
            </Route>
            <Route path="/verify/msp/:id" element={<FarmerLayout />}>
              <Route index element={<MSPVerificationPage />} />
            </Route>

            {/* Bank / Admin Portal */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Policy & Information Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/disclaimer" element={<DisclaimerPage />} />
            <Route path="/hyperlinking-policy" element={<HyperlinkPolicyPage />} />
            <Route path="/copyright-policy" element={<CopyrightPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ServerReadinessGate>
  );
}
