import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const MapDashboardPage = lazy(() => import('./pages/MapDashboardPage'));
const HospitalDetailPage = lazy(() => import('./pages/HospitalDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<p className="text-slate-600">Loading page...</p>}>
        <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes — require login after accessibility check */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapDashboardPage /></ProtectedRoute>} />
          <Route path="/hospital/:id" element={<ProtectedRoute><HospitalDetailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
