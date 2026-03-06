import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FileText, Plus, X, Calendar as CalendarIcon, Clock, Filter, Trash2, Edit } from 'lucide-react';
import './Timetable.css';
import '../admin/Faculty.css';

const DAYS_OF_WEEK = [
    { id: 'MON', label: 'Monday' },
    { id: 'TUE', label: 'Tuesday' },
    { id: 'WED', label: 'Wednesday' },
    { id: 'THUR', label: 'Thursday' },
    { id: 'FRI', label: 'Friday' },
    { id: 'SAT', label: 'Saturday' }
];

const Timetable = () => {
    const [loading, setLoading] = useState(false);

    // Master data
    const [institutionData, setInstitutionData] = useState({ batches: [], colleges: [], courses: [], branches: [] });
    const [periodSlots, setPeriodSlots] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableData, setTimetableData] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        batch: '',
        college_id: '',
        course_id: '',
        branch_id: '',
        year_of_study: '1',
        semester_number: '1'
    });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { day, slot, existingEntry }
    const [newEntry, setNewEntry] = useState({
        subject_id: '',
        type: 'subject',
        custom_label: ''
    });
    const [saving, setSaving] = useState(false);

    // Period Slot Management State
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [isEditingSlot, setIsEditingSlot] = useState(false);
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [slotFormData, setSlotFormData] = useState({
        slot_name: '',
        start_time: '',
        end_time: '',
        is_break: false,
        sort_order: 0
    });
    const [slotSaving, setSlotSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (filters.branch_id && filters.year_of_study && filters.semester_number) {
            fetchTimetable();
        } else {
            setTimetableData([]); // Clear if incomplete filters
        }
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newState = { ...prev, [name]: value };
            // Cascade reset
            if (name === 'batch_id') {
                newState.college_id = '';
                newState.course_id = '';
                newState.branch_id = '';
            } else if (name === 'college_id') {
                newState.course_id = '';
                newState.branch_id = '';
            } else if (name === 'course_id') {
                newState.branch_id = '';
            }
            return newState;
        });
    };

    const fetchInitialData = async () => {
        try {
            const [instRes, slotsRes] = await Promise.all([
                api.get('/institution/details'),
                api.get('/period-slots')
            ]);

            if (instRes.data.success) {
                const data = instRes.data.data;
                setInstitutionData(data);

                // Pre-select first batch for immediate view
                if (data.batches.length > 0 && !filters.batch) {
                    setFilters(prev => ({
                        ...prev,
                        batch: String(data.batches[0].id)
                    }));
                }
            }
            if (slotsRes.data.success) {
                // Map DB 'name' to 'slot_name' for UI consistency if needed, 
                // but better to just use name. However, existing code uses slot_name.
                const mappedSlots = slotsRes.data.data.map(s => ({
                    ...s,
                    slot_name: s.name // Ensure UI finds slot_name
                }));
                setPeriodSlots(mappedSlots);
            }
        } catch (error) {
            console.error('Failed to fetch initial data', error);
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await api.get(`/timetable?${query}`);
            if (res.data.success) {
                setTimetableData(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjectsForSlot = async () => {
        try {
            const query = new URLSearchParams({
                branch_id: filters.branch_id,
                year_of_study: filters.year_of_study,
                semester_number: filters.semester_number,
                batch: filters.batch
            }).toString();
            const response = await api.get(`/subjects?${query}`);
            if (response.data.success) {
                setSubjects(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        }
    };

    // Filtered data for cascading
    const pageFilteredColleges = institutionData.colleges.filter(c => true); // Support future hierarchical colleges if needed
    const pageFilteredCourses = institutionData.courses.filter(c =>
        !filters.college_id || String(c.college_id) === String(filters.college_id)
    );
    const pageFilteredBranches = institutionData.branches.filter(b =>
        !filters.course_id || String(b.course_id) === String(filters.course_id)
    );

    // Dynamic duration helpers
    const getAcademicLimits = () => {
        const selectedBranch = institutionData.branches.find(b => String(b.id) === String(filters.branch_id));
        const selectedCourse = institutionData.courses.find(c => String(c.id) === String(filters.course_id));

        const totalYears = selectedBranch?.total_years || selectedCourse?.total_years || 4;
        const semsPerYear = selectedBranch?.semesters_per_year || selectedCourse?.semesters_per_year || 2;

        return { totalYears, semsPerYear };
    };

    const { totalYears, semsPerYear } = getAcademicLimits();
    const maxSemesters = totalYears * semsPerYear;

    const handleSlotClick = (day, slot, existingEntry) => {
        if (!filters.branch_id) {
            alert('Please select a branch first.');
            return;
        }

        setSelectedSlot({ day, slot, existingEntry });

        if (existingEntry) {
            setNewEntry({
                subject_id: existingEntry.subject_id || '',
                type: existingEntry.type || 'subject',
                custom_label: existingEntry.custom_label || ''
            });
        } else {
            setNewEntry({
                subject_id: '',
                type: 'subject',
                custom_label: ''
            });
        }
        fetchSubjectsForSlot(); // Fetch subjects when modal opens
        setShowModal(true);
    };

    const handleEntryChange = (e) => {
        const { name, value } = e.target;
        setNewEntry(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEntry = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...filters,
                day_of_week: selectedSlot.day,
                period_slot_id: selectedSlot.slot.id,
                subject_id: newEntry.subject_id || null,
                type: newEntry.type,
                custom_label: newEntry.custom_label || null
            };

            if (selectedSlot.existingEntry) {
                await api.put(`/timetable/${selectedSlot.existingEntry.id}`, payload);
            } else {
                await api.post('/timetable', payload);
            }

            setShowModal(false);
            fetchTimetable();
        } catch (error) {
            console.error('Failed to save entry', error);
            alert(error.response?.data?.message || 'Failed to save entry');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEntry = async (e, id) => {
        e.stopPropagation(); // prevent modal opening
        if (!window.confirm('Delete this timetable entry?')) return;

        try {
            await api.delete(`/timetable/${id}`);
            fetchTimetable();
        } catch (error) {
            console.error('Failed to delete entry', error);
        }
    };

    const handleSaveSlot = async (e) => {
        e.preventDefault();
        setSlotSaving(true);
        try {
            const payload = {
                ...slotFormData,
                college_id: filters.college_id
            };
            if (isEditingSlot) {
                await api.put(`/period-slots/${editingSlotId}`, payload);
            } else {
                await api.post('/period-slots', payload);
            }
            setShowSlotModal(false);
            setSlotFormData({ slot_name: '', start_time: '', end_time: '', is_break: false, sort_order: 0 });
            setIsEditingSlot(false);
            fetchInitialData(); // Refresh slots
        } catch (error) {
            console.error('Failed to save slot', error);
            alert('Failed to save slot');
        } finally {
            setSlotSaving(false);
        }
    };

    const handleEditSlot = (slot) => {
        setSlotFormData({
            slot_name: slot.slot_name || slot.name,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_break: !!slot.is_break,
            sort_order: slot.sort_order || 0
        });
        setEditingSlotId(slot.id);
        setIsEditingSlot(true);
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Are you sure you want to delete this time slot?')) return;
        try {
            await api.delete(`/period-slots/${id}`);
            fetchInitialData();
        } catch (error) {
            alert('Failed to delete slot. It might be in use in a timetable.');
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${m} ${ampm}`;
    };

    const days = ['MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT']; // Use IDs for consistency with backend

    return (
        <div className="institution-container timetable-page">
            <div className="institution-header">
                <div>
                    <h1 className="institution-title">Class Timetables</h1>
                    <p className="institution-subtitle">Manage weekly schedules for branches and semesters.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        className="btn btn-ghost border border-gray-200"
                        onClick={() => setShowSlotModal(true)}
                    >
                        <Clock size={18} />
                        <span>Manage Slots</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar - Cascading Selection */}
            <div className="timetable-filters px-6 py-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', height: 'auto' }}>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">1. Batch</label>
                    <select name="batch" value={filters.batch} onChange={handleFilterChange} className="form-select text-sm h-10">
                        <option value="">Select Batch</option>
                        {institutionData.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">2. College</label>
                    <select name="college_id" value={filters.college_id} onChange={handleFilterChange} className="form-select text-sm h-10" disabled={!filters.batch}>
                        <option value="">Select College</option>
                        {institutionData.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">3. Program</label>
                    <select name="course_id" value={filters.course_id} onChange={handleFilterChange} className="form-select text-sm h-10" disabled={!filters.college_id}>
                        <option value="">Select Program</option>
                        {pageFilteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">4. Branch</label>
                    <select name="branch_id" value={filters.branch_id} onChange={handleFilterChange} className="form-select text-sm h-10" disabled={!filters.course_id}>
                        <option value="">Select Branch</option>
                        {pageFilteredBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">Year</label>
                    <select name="year_of_study" value={filters.year_of_study} onChange={handleFilterChange} className="form-select text-sm h-10" disabled={!filters.branch_id}>
                        {Array.from({ length: totalYears }, (_, i) => i + 1).map(y => (
                            <option key={y} value={y}>Year {y}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group mb-0">
                    <label className="form-label text-[10px] uppercase font-bold text-gray-400">Semester</label>
                    <select name="semester_number" value={filters.semester_number} onChange={handleFilterChange} className="form-select text-sm h-10" disabled={!filters.branch_id}>
                        {Array.from({ length: maxSemesters }, (_, i) => i + 1).map(s => (
                            <option key={s} value={s}>Sem {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {!filters.branch_id ? (
                <div className="empty-state bg-white rounded-xl border border-gray-200 py-16 anim-fade-in-up">
                    <div className="icon-box theme-principals" style={{ marginBottom: '1rem', width: '4rem', height: '4rem' }}>
                        <Filter size={32} strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                        Select a Branch
                    </h3>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        Please select a batch, college, program, branch, year, and semester to view or edit the timetable.
                    </p>
                </div>
            ) : (
                <div className="timetable-grid-wrapper custom-scrollbar anim-fade-in-up">
                    {loading ? (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <table className="timetable-table">
                            <thead>
                                <tr>
                                    <th>Day / Time</th>
                                    {periodSlots.map(slot => (
                                        <th key={slot.id} className={slot.is_break ? 'bg-orange-50/50' : ''}>
                                            <div className="text-sm font-bold">{slot.slot_name}</div>
                                            <div className="text-xs text-gray-500 font-normal mt-1 flex items-center justify-center gap-1">
                                                <Clock size={12} />
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {days.map(day => (
                                    <tr key={day}>
                                        <td className="day-cell">{DAYS_OF_WEEK.find(d => d.id === day)?.label}</td>
                                        {periodSlots.map(slot => {
                                            const entry = timetableData.find(t => t.day_of_week === day && t.period_slot_id === slot.id);
                                            return (
                                                <td key={`${day}-${slot.id}`} className="slot-cell">
                                                    <div className="slot-content" onClick={() => handleSlotClick(day, slot, entry)}>
                                                        {entry ? (
                                                            <div className={`slot-entry type-${entry.type}`}>
                                                                {entry.type === 'break' ? (
                                                                    <span>{entry.custom_label || 'Break'}</span>
                                                                ) : (
                                                                    <>
                                                                        <div className="slot-subject">{entry.subject_name || entry.custom_label}</div>
                                                                        {entry.subject_code && <div className="slot-code">{entry.subject_code}</div>}
                                                                    </>
                                                                )}
                                                                <button
                                                                    className="remove-slot-btn"
                                                                    onClick={(e) => handleDeleteEntry(e, entry.id)}
                                                                    title="Remove Entry"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="slot-empty">
                                                                <Plus size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <form onSubmit={handleSaveEntry}>
                            <div className="modal-header">
                                <h3 className="modal-title">
                                    {selectedSlot?.existingEntry ? 'Edit Slot Entry' : 'Assign Subject to Slot'}
                                </h3>
                                <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4 font-medium flex items-center gap-2">
                                    <CalendarIcon size={16} />
                                    {DAYS_OF_WEEK.find(d => d.id === selectedSlot?.day)?.label}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Entry Type</label>
                                    <select
                                        name="type"
                                        value={newEntry.type}
                                        onChange={handleEntryChange}
                                        className="form-select"
                                    >
                                        <option value="subject">Theory Subject</option>
                                        <option value="lab">Laboratory</option>
                                        <option value="break">Break / Lunch</option>
                                        <option value="other">Other Activity</option>
                                    </select>
                                </div>

                                {['subject', 'lab'].includes(newEntry.type) ? (
                                    <div className="form-group animate-fade-in">
                                        <label className="form-label">Subject *</label>
                                        <select
                                            name="subject_id"
                                            value={newEntry.subject_id}
                                            onChange={handleEntryChange}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">Select a Subject...</option>
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} {s.code ? `(${s.code})` : ''} - {s.subject_type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="form-group animate-fade-in">
                                        <label className="form-label">Custom Label *</label>
                                        <input
                                            type="text"
                                            name="custom_label"
                                            value={newEntry.custom_label}
                                            onChange={handleEntryChange}
                                            className="form-input"
                                            placeholder="e.g., Lunch Break, Seminar, Library"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Period Slot Management Modal */}
            {showSlotModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Manage Period Slots</h3>
                            <button className="modal-close" onClick={() => {
                                setShowSlotModal(false);
                                setIsEditingSlot(false);
                                setSlotFormData({ slot_name: '', start_time: '', end_time: '', is_break: false, sort_order: 0 });
                            }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSaveSlot} className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="form-group">
                                    <label className="form-label">Slot Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={slotFormData.slot_name}
                                        onChange={(e) => setSlotFormData({ ...slotFormData, slot_name: e.target.value })}
                                        placeholder="e.g., Period 1, Lunch"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select
                                        className="form-select"
                                        value={slotFormData.is_break ? 'break' : 'period'}
                                        onChange={(e) => setSlotFormData({ ...slotFormData, is_break: e.target.value === 'break' })}
                                    >
                                        <option value="period">Academic Period</option>
                                        <option value="break">Break / Intermission</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Position (Order) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={slotFormData.sort_order}
                                        onChange={(e) => setSlotFormData({ ...slotFormData, sort_order: parseInt(e.target.value, 10) || 0 })}
                                        placeholder="e.g., 1"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Start Time *</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={slotFormData.start_time}
                                        onChange={(e) => setSlotFormData({ ...slotFormData, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time *</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={slotFormData.end_time}
                                        onChange={(e) => setSlotFormData({ ...slotFormData, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    <button type="submit" className="btn btn-primary" disabled={slotSaving}>
                                        {slotSaving ? 'Saving...' : isEditingSlot ? 'Update Slot' : 'Add New Slot'}
                                    </button>
                                </div>
                            </form>

                            <div className="slot-list max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left">Pos</th>
                                            <th className="p-2 text-left">Slot Name</th>
                                            <th className="p-2 text-left">Time Range</th>
                                            <th className="p-2 text-left">Type</th>
                                            <th className="p-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periodSlots.map(slot => (
                                            <tr key={slot.id} className="border-b transition-colors hover:bg-gray-50">
                                                <td className="p-2 text-gray-500 font-mono text-xs">{slot.sort_order}</td>
                                                <td className="p-2 font-medium">{slot.slot_name}</td>
                                                <td className="p-2 text-gray-600">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</td>
                                                <td className="p-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${slot.is_break ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {slot.is_break ? 'Break' : 'Period'}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditSlot(slot)}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit Slot"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timetable;
