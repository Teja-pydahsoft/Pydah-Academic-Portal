import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const AttendanceMonitoring = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Attendance Monitoring</h1>
                    <p className="text-gray-500 mt-1">Track student attendance across departments</p>
                </div>
                <div className="flex gap-2">
                    <input type="date" className="input-field" />
                    <button className="btn-primary">View Report</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-green-50 border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="font-semibold text-green-900">Present</span>
                    </div>
                    <p className="text-3xl font-bold text-green-700">85%</p>
                </div>
                <div className="card bg-red-50 border-red-100">
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="text-red-600" size={20} />
                        <span className="font-semibold text-red-900">Absent</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">12%</p>
                </div>
                <div className="card bg-yellow-50 border-yellow-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="text-yellow-600" size={20} />
                        <span className="font-semibold text-yellow-900">On Leave</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">3%</p>
                </div>
            </div>

            <div className="card">
                <h3 className="text-lg font-bold mb-4">Daily Attendance Log</h3>
                <div className="responsive-table">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-xs font-semibold uppercase text-gray-500">Student</th>
                                <th className="p-3 text-xs font-semibold uppercase text-gray-500">Subject</th>
                                <th className="p-3 text-xs font-semibold uppercase text-gray-500">Time</th>
                                <th className="p-3 text-xs font-semibold uppercase text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="p-3">John Doe (CSE-A)</td>
                                <td className="p-3">Data Structures</td>
                                <td className="p-3">09:00 AM - 10:00 AM</td>
                                <td className="p-3"><span className="text-green-600 font-medium">Present</span></td>
                            </tr>
                            <tr>
                                <td className="p-3">Jane Smith (CSE-A)</td>
                                <td className="p-3">Data Structures</td>
                                <td className="p-3">09:00 AM - 10:00 AM</td>
                                <td className="p-3"><span className="text-red-600 font-medium">Absent</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMonitoring;
