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
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Faculty Management</h1>
                    <p className="text-gray-500 mt-1">Manage faculty members and their assignments</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Faculty</span>
                </button>
            </div>

            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            className="input-field pl-10"
                        />
                    </div>
                    <button className="btn-outline flex items-center gap-2">
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden p-0">
                <div className="responsive-table">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : faculty.length > 0 ? (
                                faculty.map((f) => (
                                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{f.name}</div>
                                            <div className="text-xs text-gray-500">{f.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{f.department}</td>
                                        <td className="p-4 text-sm text-gray-700">{f.designation}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-400 hover:text-primary-600 mr-3"><Edit size={18} /></button>
                                            <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No faculty found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FacultyManagement;
