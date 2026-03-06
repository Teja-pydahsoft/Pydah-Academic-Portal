import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Edit, Trash2, X, Users, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import '../admin/Faculty.css';

const Regulations = () => {
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [institutionData, setInstitutionData] = useState({ colleges: [], courses: [], branches: [] });
    const [batches, setBatches] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    // Filter state for the page table
    const [filterCollege, setFilterCollege] = useState('');

    // Regulation CRUD modal
    const [showRegModal, setShowRegModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [regForm, setRegForm] = useState({ name: '', college_id: '', course_id: '', total_years: '4', semesters_per_year: '2' });
    const [saving, setSaving] = useState(false);

    // Batch assignment modal
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [selectedRegulation, setSelectedRegulation] = useState(null);
    const [assignedBatches, setAssignedBatches] = useState([]);
    const [savingBatches, setSavingBatches] = useState(false);

    useEffect(() => {
        fetchInstitutionDetails();
        fetchRegulations();
    }, []);

    const fetchInstitutionDetails = async () => {
        try {
            const resp = await api.get('/institution/details');
            if (resp.data.success) {
                const { colleges, courses, branches, batches: batchList } = resp.data.data;
                setInstitutionData({ colleges, courses, branches });
                setBatches(batchList || []);
            }
        } catch (err) { console.error('Failed to fetch institution details', err); }
    };

    const fetchRegulations = async () => {
        setLoading(true);
        try {
            const query = filterCollege ? `?college_id=${filterCollege}` : '';
            const resp = await api.get(`/regulations${query}`);
            if (resp.data.success) setRegulations(resp.data.data);
        } catch (err) { console.error('Failed to fetch regulations', err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRegulations(); }, [filterCollege]);

    // --- Regulation CRUD ---
    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setRegForm({ name: '', college_id: '', course_id: '', total_years: '4', semesters_per_year: '2' });
        setShowRegModal(true);
    };

    const openEditModal = (reg) => {
        setIsEditing(true);
        setEditingId(reg.id);
        setRegForm({
            name: reg.name,
            college_id: String(reg.college_id),
            course_id: String(reg.course_id),
            total_years: String(reg.total_years || 4),
            semesters_per_year: String(reg.semesters_per_year || 2)
        });
        setShowRegModal(true);
    };

    const handleRegFormChange = (e) => {
        const { name, value } = e.target;
        setRegForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'college_id') { next.course_id = ''; }
            return next;
        });
    };

    const handleSaveRegulation = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEditing) {
                await api.put(`/regulations/${editingId}`, regForm);
            } else {
                await api.post('/regulations', regForm);
            }
            setShowRegModal(false);
            fetchRegulations();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save regulation');
        } finally { setSaving(false); }
    };

    const handleDeleteRegulation = async (id) => {
        if (!window.confirm('Delete this regulation? This will also delete all its subjects.')) return;
        try {
            await api.delete(`/regulations/${id}`);
            fetchRegulations();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    // --- Batch Assignment ---
    const openBatchModal = async (reg) => {
        setSelectedRegulation(reg);
        try {
            const resp = await api.get(`/regulations/${reg.id}/batches`);
            const mapped = (resp.data.data || []).map(b => b.batch);
            setAssignedBatches(mapped);
        } catch (err) { setAssignedBatches([]); }
        setShowBatchModal(true);
    };

    const toggleBatch = (batchName) => {
        setAssignedBatches(prev =>
            prev.includes(batchName) ? prev.filter(b => b !== batchName) : [...prev, batchName]
        );
    };

    const handleSaveBatches = async () => {
        setSavingBatches(true);
        try {
            await api.post(`/regulations/${selectedRegulation.id}/batches`, { batches: assignedBatches });
            setShowBatchModal(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign batches');
        } finally { setSavingBatches(false); }
    };

    const filteredCourses = institutionData.courses.filter(c =>
        !regForm.college_id || String(c.college_id) === regForm.college_id
    );

    // Group regulations by college
    const grouped = regulations.reduce((acc, reg) => {
        const key = reg.college_name || 'Unknown College';
        if (!acc[key]) acc[key] = [];
        acc[key].push(reg);
        return acc;
    }, {});

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title font-display">Curriculum Regulations</h1>
                    <p className="page-subtitle">Manage syllabus regulations and assign them to student batches</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={16} /> New Regulation
                </button>
            </div>

            {/* Page Filters */}
            <div className="filter-bar" style={{ marginBottom: '24px' }}>
                <select
                    value={filterCollege}
                    onChange={e => setFilterCollege(e.target.value)}
                    className="form-select"
                    style={{ maxWidth: '240px' }}
                >
                    <option value="">All Colleges</option>
                    {institutionData.colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Regulations List */}
            {loading ? (
                <div className="text-center" style={{ padding: '60px 0', color: 'var(--gray-400)' }}>Loading...</div>
            ) : regulations.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                    <h3>No Regulations Found</h3>
                    <p>Create your first curriculum regulation to get started.</p>
                    <button className="btn btn-primary" onClick={openCreateModal}><Plus size={16} /> Create Regulation</button>
                </div>
            ) : (
                Object.entries(grouped).map(([collegeName, regs]) => (
                    <div key={collegeName} style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                            {collegeName}
                        </h2>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {regs.map(reg => (
                                <div key={reg.id} className="card" style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                                                {reg.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--gray-800)', margin: 0 }}>{reg.name}</h3>
                                                    <span className="badge badge-info" style={{ fontSize: '11px' }}>{reg.course_name}</span>
                                                    {reg.branch_name && <span className="badge badge-gray" style={{ fontSize: '11px' }}>{reg.branch_name}</span>}
                                                </div>
                                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gray-500)' }}>
                                                    {reg.college_name}
                                                    <span style={{ marginLeft: '10px', color: 'var(--gray-400)' }}>·</span>
                                                    <span style={{ marginLeft: '10px' }}>{reg.total_years || 4} Years · {(reg.total_years || 4) * (reg.semesters_per_year || 2)} Semesters Total</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ fontSize: '13px', padding: '6px 14px', gap: '6px' }}
                                                onClick={() => openBatchModal(reg)}
                                                title="Assign Batches"
                                            >
                                                <Users size={14} /> Batches
                                            </button>
                                            <button className="btn btn-outline" style={{ padding: '6px 10px' }} onClick={() => openEditModal(reg)}><Edit size={14} /></button>
                                            <button className="btn btn-danger-outline" style={{ padding: '6px 10px' }} onClick={() => handleDeleteRegulation(reg.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Create/Edit Regulation Modal */}
            {showRegModal && (
                <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSaveRegulation}>
                            <div className="modal-header">
                                <h3 className="modal-title font-display">{isEditing ? 'Edit Regulation' : 'Create New Regulation'}</h3>
                                <button type="button" className="modal-close" onClick={() => setShowRegModal(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Regulation Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={regForm.name}
                                        onChange={handleRegFormChange}
                                        className="form-input"
                                        placeholder="e.g. R20, R23, CBCS-2022"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">College *</label>
                                    <select name="college_id" value={regForm.college_id} onChange={handleRegFormChange} className="form-select" required>
                                        <option value="">Select College</option>
                                        {institutionData.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Program / Course *</label>
                                    <select name="course_id" value={regForm.course_id} onChange={handleRegFormChange} className="form-select" required disabled={!regForm.college_id}>
                                        <option value="">Select Program</option>
                                        {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Total Years *</label>
                                        <select name="total_years" value={regForm.total_years} onChange={handleRegFormChange} className="form-select" required>
                                            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>{y} {y === 1 ? 'Year' : 'Years'}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Semesters / Year *</label>
                                        <select name="semesters_per_year" value={regForm.semesters_per_year} onChange={handleRegFormChange} className="form-select" required>
                                            {[1, 2, 3, 4].map(s => <option key={s} value={s}>{s} {s === 1 ? 'Sem' : 'Sems'}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowRegModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Regulation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Batches Modal */}
            {showBatchModal && selectedRegulation && (
                <div className="modal-overlay" onClick={() => setShowBatchModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title font-display">Assign Batches</h3>
                                <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0' }}>
                                    {selectedRegulation.name} — {selectedRegulation.course_name}
                                </p>
                            </div>
                            <button type="button" className="modal-close" onClick={() => setShowBatchModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                                Select the student batches that follow this regulation's curriculum.
                            </p>
                            {batches.length === 0 ? (
                                <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '20px 0' }}>No batches found.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                                    {batches.map(batch => {
                                        const isAssigned = assignedBatches.includes(String(batch.id));
                                        return (
                                            <button
                                                key={batch.id}
                                                type="button"
                                                onClick={() => toggleBatch(String(batch.id))}
                                                style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    border: `2px solid ${isAssigned ? 'var(--primary-600)' : 'var(--gray-200)'}`,
                                                    background: isAssigned ? 'var(--primary-50)' : 'white',
                                                    color: isAssigned ? 'var(--primary-700)' : 'var(--gray-600)',
                                                    fontWeight: isAssigned ? 700 : 400,
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                {batch.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline" onClick={() => setShowBatchModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveBatches} disabled={savingBatches}>
                                {savingBatches ? 'Saving...' : 'Save Assignments'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Regulations;
