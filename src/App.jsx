import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { FileText } from 'lucide-react';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import LiveMonitoring from './pages/LiveMonitoring';
import ViolationsReports from './pages/ViolationsReports';
import SystemIntegration from './pages/SystemIntegration';
import CameraManagement from './pages/CameraManagement';


import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster 
          position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#00D1FF',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
         {/* Protected Dashboard Routes */}
         <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* Accessible to all authenticated users */}
            <Route index element={<DashboardOverview />} />
            <Route path="monitoring" element={<LiveMonitoring />} />
            <Route path="reports" element={
               <div className="p-8 text-white/50 text-center uppercase tracking-widest text-sm font-mono mt-10">
                  <div className="flex flex-col items-center gap-4">
                     <FileText className="w-12 h-12 opacity-10" />
                     Statistical Analysis Engine Coming Soon
                  </div>
               </div>
            } />
            
            {/* Accessible strictly to 'admin' role */}
            <Route path="violations" element={
               <ProtectedRoute allowedRoles={['admin']}>
                  <ViolationsReports />
               </ProtectedRoute>
            } />
            <Route path="cameras" element={
               <ProtectedRoute allowedRoles={['admin']}>
                  <CameraManagement />
               </ProtectedRoute>
            } />

            <Route path="settings" element={
               <ProtectedRoute allowedRoles={['admin']}>
                  <SystemIntegration />
               </ProtectedRoute>
            } />
         </Route>
      </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
