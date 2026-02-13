import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Lazy load layouts
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));

// Lazy load pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const FacultyManagement = lazy(() => import('./pages/admin/FacultyManagement'));
const AttendanceMonitoring = lazy(() => import('./pages/admin/AttendanceMonitoring'));

function PrivateRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="loading-spinner"></div></div>;

    if (!user) return <Navigate to="/login" replace />;

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="loading-spinner"></div></div>}>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/admin" element={
                        <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                            <AdminLayout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="faculty" element={<FacultyManagement />} />
                        <Route path="attendance" element={<AttendanceMonitoring />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App;
