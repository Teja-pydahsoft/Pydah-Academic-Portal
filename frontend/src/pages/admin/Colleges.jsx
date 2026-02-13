import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Building2, Search, Filter } from 'lucide-react';

const Colleges = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                // Fetch distinct colleges from students table as we don't have a colleges table yet
                const response = await api.get('/dashboard/stats'); // Reusing stats for now or we need a new route
                // Actually, let's create a dedicated route or fetch logic
                // For now, let's enhance the dashboard/stats or create a mock implementation that fetches from DB
                // Since user wants "currect details", we should query the distinct colleges.

                // Let's rely on a new endpoint we will create: /api/institution/colleges
                const res = await api.get('/institution/colleges');
                if (res.data.success) {
                    setColleges(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch colleges', error);
                // Fallback for visual testing if backend endpoint not ready in this exact step
            } finally {
                setLoading(false);
            }
        };
        fetchColleges();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="hero-title" style={{ fontSize: '1.75rem', color: 'var(--primary-900)' }}>Colleges</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Overview of all institutions under the portal</p>
                </div>
            </div>

            <div className="card mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="input-wrapper w-full md:w-96">
                        <Search className="input-icon" size={18} />
                        <input type="text" placeholder="Search colleges..." className="form-input" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div>Loading...</div>
                ) : colleges.map((college, index) => (
                    <div key={index} className="card hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-2">{college.name}</h3>
                                <p className="text-xs text-gray-500">{college.student_count} Students</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Colleges;
