import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './component/Protectedroute';

// Pages
import LoginPage from './page/login';
import RegisterPage from './page/register';
import ForgotPasswordPage from './page/forgotpassword';
import DashboardPage from './page/dashboard';
import BankDetail from './page/BankDetail'; // 1. Import the BankDetail page

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 2. Protected Wrapper */}
          <Route element={<ProtectedRoute />}>
            {/* DashboardPage handles sub-views internally (Status, Settings).
                BankDetail is a separate page accessed via a URL parameter.
            */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* 2. Integrated BankDetail Route */}
            <Route path="/bank/:bankName" element={<BankDetail />} />
          </Route>

          {/* 3. Global Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}