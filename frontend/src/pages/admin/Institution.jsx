import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Building2, Search, GraduationCap, Layers } from 'lucide-react';

const Institution = ({ initialTab = 'colleges' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [data, setData] = useState({ colleges: [], courses: [], batches: [] });
    const [loading, setLoading] = useState(true);

    // Sync tab when prop changes (navigation)
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get('/institution/details');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch institution details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm rounded-lg transition-all duration-200 ${activeTab === id
                    ? 'bg-primary-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const renderContent = () => {
        const items = activeTab === 'colleges' ? data.colleges
            : activeTab === 'programs' ? data.courses
                : data.batches;

        const getIconInfo = () => {
            if (activeTab === 'colleges') return { icon: Building2, bg: 'bg-blue-50', text: 'text-blue-600' };
            if (activeTab === 'programs') return { icon: GraduationCap, bg: 'bg-purple-50', text: 'text-purple-600' };
            return { icon: Layers, bg: 'bg-orange-50', text: 'text-orange-600' };
        };

        const { icon: Icon, bg, text } = getIconInfo();
        const title = activeTab === 'colleges' ? 'Colleges'
            : activeTab === 'programs' ? 'Programs'
                : 'Batches';

        if (loading) return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in pb-8">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div key={index} className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${bg.replace('50', '500')}`}></div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className={`w-14 h-14 rounded-2xl ${bg} ${text} flex items-center justify-center shadow-inner mb-4 group-hover:rotate-6 transition-transform`}>
                                    <Icon size={28} />
                                </div>
                                <span className="px-2 py-1 bg-gray-50 text-xs font-semibold text-gray-500 rounded-md border border-gray-100">
                                    ID: {index + 1}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors font-display">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    <span className="font-medium">{item.student_count} Students</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <Icon size={32} />
                        </div>
                        <h3 className="text-gray-900 font-medium text-lg mb-1">No {title.toLowerCase()} found</h3>
                        <p className="text-gray-500 max-w-sm">Try adjusting your search or add new {title.toLowerCase()} to get started.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 font-display mb-2">Institution</h1>
                    <p className="text-gray-500 text-lg">Manage colleges, programs, and batches.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 p-2">
                    <div className="flex bg-gray-50 p-1.5 rounded-xl gap-1 overflow-x-auto">
                        <TabButton id="colleges" label="Colleges" icon={Building2} />
                        <TabButton id="programs" label="Programs" icon={GraduationCap} />
                        <TabButton id="batches" label="Batches" icon={Layers} />
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default Institution;
