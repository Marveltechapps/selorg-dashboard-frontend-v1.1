import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
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
 
// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Dashboard Route Component with Super Admin Support
function DashboardRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType<{ onLogout: () => void }>;
  allowedRoles: string[];
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

  return (
    <>
      {isSuperAdmin && (
        <SuperAdminToolbar 
          currentDashboard={user?.role as any} 
          onSwitch={(dashboard) => {
            // Navigate to the selected dashboard
            window.location.href = `/dashboard/${dashboard}`;
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
        
        {/* Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/darkstore" replace />
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
        
        {/* Admin Dashboard with screen routing */}
        <Route 
          path="/dashboard/admin/:screen?" 
          element={
            <ProtectedRoute>
              <DashboardRoute 
                component={(props) => <AdminManagement {...props} />} 
                allowedRoles={['admin', 'super_admin']} 
              />
            </ProtectedRoute>
          } 
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
