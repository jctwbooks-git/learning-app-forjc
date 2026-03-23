import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Timer from './pages/Timer';
import Notes from './pages/Notes';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="timer" element={<RouteGuard><Timer /></RouteGuard>} />
        <Route path="notes" element={<RouteGuard><Notes /></RouteGuard>} />
        <Route path="progress" element={<RouteGuard><Progress /></RouteGuard>} />
        <Route path="settings" element={<RouteGuard><Settings /></RouteGuard>} />
      </Route>
    </Routes>
  );
};

// Simple guard for protected features (optional but good)
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
