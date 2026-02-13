import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, Clock, FileText, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    return (
        <div className="flex h-screen bg-app">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 transition-all duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                    <span className="font-display font-semibold text-lg text-gray-900">Pydah Portal</span>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="flex flex-col gap-1">
                        <li>
                            <Link to="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === '/admin/dashboard' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <LayoutDashboard size={20} />
                                <span className="font-medium">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/faculty" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname.includes('/admin/faculty') ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                                <Users size={20} />
                                <span className="font-medium">Faculty</span>
                            </Link>
                        </li>
                        <li>
                            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50">
                                <BookOpen size={20} />
                                <span className="font-medium">Academics</span>
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen bg-gray-50">
                <div className="container mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
