import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DarkstoreManagement } from './components/DarkstoreManagement';
import { ProductionManagement } from './components/ProductionManagement';
import { MerchManagement } from './components/MerchManagement';
import { RiderManagement } from './components/RiderManagement';
import { FinanceManagement } from './components/FinanceManagement';
import { VendorManagement } from './components/VendorManagement';
import { WarehouseManagement } from './components/WarehouseManagement';
import { AdminManagement } from './components/AdminManagement';
import { LoginScreen } from './components/LoginScreen';
import { SuperAdminToolbar } from './components/SuperAdminToolbar';
import { Toaster } from "./components/ui/sonner";
import { isAuthenticated, getCurrentUser } from './api/authApi';

const VALID_DASHBOARDS = ['darkstore', 'production', 'merch', 'rider', 'finance', 'vendor', 'warehouse', 'admin'] as const;

// Redirect /dashboard to the dashboard that matches the user's role (prevents redirect loop).
function DashboardRedirect() {
  const user = getCurrentUser();
  const role = user?.role?.toLowerCase();
  const target = role && VALID_DASHBOARDS.includes(role as any) ? role : 'darkstore';
  return <Navigate to={`/dashboard/${target}`} replace />;
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Redirect /dashboard/admin to /admin for backwards compatibility
function RedirectDashboardAdmin() {
  const { screen } = useParams<{ screen?: string }>();
  const to = screen ? `/admin/${screen}` : '/admin';
  return <Navigate to={to} replace />;
}

// Dashboard Route Component with Super Admin Support
function DashboardRoute({ 
  component: Component, 
  allowedRoles,
  dashboardId 
}: { 
  component: React.ComponentType<{ onLogout: () => void }>;
  allowedRoles: string[];
  dashboardId?: string;
}) {
  const user = getCurrentUser();
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  
  // Check if user has access to this dashboard
  if (!isSuperAdmin && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isSuperAdmin');
    window.location.href = '/login';
  };

  const currentDashboard = dashboardId ?? (user?.role as string);

  return (
    <>
      {isSuperAdmin && (
        <SuperAdminToolbar 
          currentDashboard={currentDashboard} 
          onSwitch={(dashboard) => {
            if (dashboard === 'admin') {
              window.location.href = '/admin';
            } else {
              window.location.href = `/dashboard/${dashboard}`;
            }
          }} 
          onLogout={handleLogout} 
        />
      )}
      <div className={isSuperAdmin ? "pt-14" : ""}>
        <Component onLogout={handleLogout} />
      </div>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginScreen />
            )
          } 
        />
        
        {/* Dashboard Routes - redirect to role-specific dashboard to avoid loop */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } 
        />
        
        {/* Darkstore Dashboard with screen routing */}
        <Route 
          path="/dashboard/darkstore/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <DarkstoreManagement {...props} />} 
                allowedRoles={['darkstore', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Production Dashboard with screen routing */}
        <Route 
          path="/dashboard/production/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <ProductionManagement {...props} />} 
                allowedRoles={['production', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Merch Dashboard with screen routing */}
        <Route 
          path="/dashboard/merch/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <MerchManagement {...props} />} 
                allowedRoles={['merch', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Rider Dashboard with screen routing */}
        <Route 
          path="/dashboard/rider/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <RiderManagement {...props} />} 
                allowedRoles={['rider', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Finance Dashboard with screen routing */}
        <Route 
          path="/dashboard/finance/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <FinanceManagement {...props} />} 
                allowedRoles={['finance', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Vendor Dashboard with screen routing */}
        <Route 
          path="/dashboard/vendor/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <VendorManagement {...props} />} 
                allowedRoles={['vendor', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Warehouse Dashboard with screen routing */}
        <Route 
          path="/dashboard/warehouse/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <WarehouseManagement {...props} />} 
                allowedRoles={['warehouse', 'admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin at top-level /admin */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Navigate to="/admin/citywide" replace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <AdminManagement {...props} />} 
                allowedRoles={['admin', 'super_admin']} 
                dashboardId="admin"
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirect old /dashboard/admin to /admin for backwards compatibility */}
        <Route 
          path="/dashboard/admin" 
          element={<RedirectDashboardAdmin />} 
        />
        <Route 
          path="/dashboard/admin/:screen" 
          element={<RedirectDashboardAdmin />} 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
