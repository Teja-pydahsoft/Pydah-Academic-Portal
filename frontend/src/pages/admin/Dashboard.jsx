import React from 'react';
import { Users, BookOpen, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="card flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-full mr-4 ${colorClass}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Calendar size={18} />
                    <span>Current Session: 2025-26</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Faculty"
                    value="124"
                    icon={Users}
                    colorClass="bg-primary-500"
                />
                <StatCard
                    title="Active Students"
                    value="2,845"
                    icon={BookOpen}
                    colorClass="bg-accent-500"
                />
                <StatCard
                    title="Todays Attendance"
                    value="92%"
                    icon={Calendar}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    title="Average Performance"
                    value="8.4 CGPA"
                    icon={Star}
                    colorClass="bg-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 font-display">Recent Activities</h3>
                        <button className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="w-2 h-2 mt-2 rounded-full bg-accent-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Faculty meeting scheduled</p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago • Admin</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 font-display">Department Overview</h3>
                        <select className="input-field w-auto py-1 px-3 text-sm">
                            <option>CSE</option>
                            <option>ECE</option>
                            <option>MECH</option>
                        </select>
                    </div>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <span className="text-gray-400">Chart Placeholder</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
