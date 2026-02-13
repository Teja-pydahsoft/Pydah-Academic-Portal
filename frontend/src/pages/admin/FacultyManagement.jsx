import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

const FacultyManagement = () => {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const response = await api.get('/faculty');
            if (response.data.success) {
                setFaculty(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch faculty', error);
            // fallback data for demo
            setFaculty([
                { id: 1, name: 'Dr. John Doe', department: 'CSE', designation: 'Professor', email: 'john@example.com', status: 'Active' },
                { id: 2, name: 'Prof. Jane Smith', department: 'ECE', designation: 'Assistant Professor', email: 'jane@example.com', status: 'Active' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="hero-title" style={{ fontSize: '1.75rem', color: 'var(--primary-900)' }}>Faculty Management</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Manage faculty members and their assignments</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    <span>Add Faculty</span>
                </button>
            </div>

            <div className="card mb-6 p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="input-wrapper w-full md:w-96">
                        <Search className="input-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="form-input"
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div className="data-table-container p-0 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
                        ) : faculty.length > 0 ? (
                            faculty.map((f) => (
                                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                    {f.name.charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{f.name}</div>
                                                <div className="text-sm text-gray-500">{f.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {f.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{f.designation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${f.status === 'Active' || f.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {f.status || (f.is_active ? 'Active' : 'Inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-primary-600 hover:text-primary-900 mr-4"><Edit size={18} /></button>
                                        <button className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No faculty found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyManagement;
