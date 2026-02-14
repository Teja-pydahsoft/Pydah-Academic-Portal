import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, Clock, FileText, Settings, LogOut, MessageSquare, ChevronRight, Building2, GraduationCap, Layers } from 'lucide-react';


import logo from '../../assets/logo.png';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    return (
        <div className="admin-layout">
            {/* Sidebar - Premium Dark/Olive Theme */}
            <aside className="sidebar">
                {/* Logo Area */}
                <div className="sidebar-header justify-center py-4 px-4">
                    <div className="logo-highlight">
                        <img src={logo} className="w-28 h-auto" alt="Pydah Group" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="nav-section custom-scrollbar">
                    <div style={{ marginBottom: '24px' }}>
                        <p className="nav-label">Main Menu</p>
                        <div className="flex-col gap-2">
                            <Link to="/admin/dashboard" className={`nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/admin/faculty" className={`nav-item ${location.pathname.includes('/admin/faculty') ? 'active' : ''}`}>
                                <Users size={18} />
                                <span>Faculty</span>
                            </Link>
                            <Link to="/admin/attendance" className={`nav-item ${location.pathname.includes('/admin/attendance') ? 'active' : ''}`}>
                                <Clock size={18} />
                                <span>Attendance</span>
                            </Link>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p className="nav-label">Institution</p>
                        <div className="flex-col gap-2">
                            <Link to="/admin/institution" className={`nav-item ${location.pathname.includes('/admin/institution') ? 'active' : ''}`}>
                                <Building2 size={18} />
                                <span>Institution</span>
                            </Link>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p className="nav-label">Academics</p>
                        <div className="flex-col gap-2">
                            <Link to="/admin/subjects" className={`nav-item ${location.pathname.includes('/admin/subjects') ? 'active' : ''}`}>
                                <BookOpen size={18} />
                                <span>Subjects</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="user-profile">
                    <div className="profile-card">
                        <div className="logo-box" style={{ width: '32px', height: '32px', background: 'var(--primary-700)', fontSize: '14px' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--gray-400)', margin: 0, textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn w-full"
                        style={{ marginTop: '12px', background: 'transparent', border: '1px solid rgba(220, 38, 38, 0.3)', color: '#fca5a5', fontSize: '13px', padding: '8px' }}
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="container animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
