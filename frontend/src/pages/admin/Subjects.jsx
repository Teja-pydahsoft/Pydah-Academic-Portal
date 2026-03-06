import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Search, Edit, Trash2, BookOpen, FlaskConical, Presentation, X } from 'lucide-react';
import './Subjects.css';
import '../admin/Faculty.css';

const Subjects = () => {
    // All data
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [regulations, setRegulations] = useState([]);
    const [institutionData, setInstitutionData] = useState({ courses: [], branches: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Page-level filter state
    const [filter, setFilter] = useState({
        regulation_id: '',
        branch_id: '',
        year_of_study: '',
        semester_number: ''
    });

    // Modal form state
    const [form, setForm] = useState({
        regulation_id: '',
        branch_id: '',
        year_of_study: '',
        semester_number: '',
        name: '',
        code: '',
        subject_type: 'theory',
        units: '',
        experiments_count: '',
        credits: ''
    });

    // Derived data from selected regulation
    const activeRegulation = regulations.find(r => String(r.id) === String(filter.regulation_id)) || null;
    const formRegulation = regulations.find(r => String(r.id) === String(form.regulation_id)) || null;

    const totalYears = activeRegulation?.total_years || 4;
    const semsPerYear = activeRegulation?.semesters_per_year || 2;
    const totalSems = totalYears * semsPerYear;

    const formTotalYears = formRegulation?.total_years || 4;
    const formSemsPerYear = formRegulation?.semesters_per_year || 2;
    const formTotalSems = formTotalYears * formSemsPerYear;

    // Branches filtered by regulation's course
    const pageBranches = institutionData.branches.filter(b =>
        activeRegulation ? String(b.course_id) === String(activeRegulation.course_id) : false
    );
    const formBranches = institutionData.branches.filter(b =>
        formRegulation ? String(b.course_id) === String(formRegulation.course_id) : false
    );

    useEffect(() => {
        fetchRegulations();
        fetchInstitutionData();
    }, []);

    useEffect(() => {
        if (filter.regulation_id) fetchSubjects();
        else setSubjects([]);
    }, [filter]);

    const fetchInstitutionData = async () => {
        try {
            const resp = await api.get('/institution/details');
            if (resp.data.success) {
                const { courses, branches } = resp.data.data;
                setInstitutionData({ courses: courses || [], branches: branches || [] });
            }
        } catch (err) { console.error(err); }
    };

    const fetchRegulations = async () => {
        try {
            const resp = await api.get('/regulations');
            if (resp.data.success) {
                setRegulations(resp.data.data);
                if (resp.data.data.length > 0) {
                    setFilter(prev => ({ ...prev, regulation_id: String(resp.data.data[0].id) }));
                }
            }
        } catch (err) { console.error(err); }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.regulation_id) params.set('regulation_id', filter.regulation_id);
            if (filter.branch_id) params.set('branch_id', filter.branch_id);
            if (filter.year_of_study) params.set('year_of_study', filter.year_of_study);
            if (filter.semester_number) params.set('semester_number', filter.semester_number);
            const resp = await api.get(`/subjects?${params}`);
            if (resp.data.success) setSubjects(resp.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'regulation_id') { next.branch_id = ''; next.year_of_study = ''; next.semester_number = ''; }
            if (name === 'branch_id') { next.year_of_study = ''; next.semester_number = ''; }
            return next;
        });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'regulation_id') { next.branch_id = ''; next.year_of_study = ''; next.semester_number = ''; }
            return next;
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setForm({
            regulation_id: filter.regulation_id || '',
            branch_id: filter.branch_id || '',
            year_of_study: filter.year_of_study || '',
            semester_number: filter.semester_number || '',
            name: '', code: '', subject_type: 'theory',
            units: '', experiments_count: '', credits: ''
        });
        setModalStep(1);
        setShowModal(true);
    };

    const openEditModal = (subject) => {
        setIsEditing(true);
        setEditingId(subject.id);
        setForm({
            regulation_id: String(subject.regulation_id),
            branch_id: subject.branch_id ? String(subject.branch_id) : '',
            year_of_study: String(subject.year_of_study),
            semester_number: String(subject.semester_number),
            name: subject.name || '',
            code: subject.code || '',
            subject_type: subject.subject_type || 'theory',
            units: subject.units || '',
            experiments_count: subject.experiments_count || '',
            credits: subject.credits || ''
        });
        setModalStep(1);
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                regulation_id: form.regulation_id,
                branch_id: form.branch_id || null,
                year_of_study: form.year_of_study,
                semester_number: form.semester_number,
                name: form.name,
                code: form.code,
                subject_type: form.subject_type,
                units: form.subject_type === 'theory' ? (form.units || null) : null,
                experiments_count: form.subject_type === 'lab' ? (form.experiments_count || null) : null,
                credits: form.credits || null
            };
            if (isEditing) {
                await api.put(`/subjects/${editingId}`, payload);
            } else {
                await api.post('/subjects', payload);
            }
            setShowModal(false);
            fetchSubjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save subject');
        } finally { setSaving(false); }
    };

    const handleDelete = async (subject) => {
        if (!window.confirm(`Delete "${subject.name}"?`)) return;
        try {
            await api.delete(`/subjects/${subject.id}`);
            fetchSubjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete subject');
        }
    };

    const filtered = subjects.filter(s =>
        !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group by Branch → "Year X — Sem Y"
    const grouped = filtered.reduce((acc, subj) => {
        const branchKey = subj.branch_name || 'General (No Branch)';
        const semKey = `Year ${subj.year_of_study} — Sem ${subj.semester_number}`;
        if (!acc[branchKey]) acc[branchKey] = {};
        if (!acc[branchKey][semKey]) acc[branchKey][semKey] = [];
        acc[branchKey][semKey].push(subj);
        return acc;
    }, {});

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title font-display">Subject Directory</h1>
                    <p className="page-subtitle">Manage curriculum subjects across branches and semesters.</p>
                </div>
                {filter.regulation_id && (
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        <Plus size={16} /> Add Subject
                    </button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                <select
                    name="regulation_id"
                    value={filter.regulation_id}
                    onChange={handleFilterChange}
                    className="form-select"
                    style={{ minWidth: '200px' }}
                >
                    <option value="">Select Regulation</option>
                    {regulations.map(r => (
                        <option key={r.id} value={r.id}>{r.name} — {r.course_name} ({r.college_name})</option>
                    ))}
                </select>

                <select
                    name="branch_id"
                    value={filter.branch_id}
                    onChange={handleFilterChange}
                    className="form-select"
                    style={{ minWidth: '160px' }}
                    disabled={!filter.regulation_id || pageBranches.length === 0}
                >
                    <option value="">All Branches</option>
                    {pageBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>

                <select
                    name="year_of_study"
                    value={filter.year_of_study}
                    onChange={handleFilterChange}
                    className="form-select"
                    style={{ maxWidth: '140px' }}
                    disabled={!filter.regulation_id}
                >
                    <option value="">All Years</option>
                    {Array.from({ length: totalYears }, (_, i) => i + 1).map(y => (
                        <option key={y} value={y}>Year {y}</option>
                    ))}
                </select>

                <select
                    name="semester_number"
                    value={filter.semester_number}
                    onChange={handleFilterChange}
                    className="form-select"
                    style={{ maxWidth: '150px' }}
                    disabled={!filter.regulation_id}
                >
                    <option value="">All Sems</option>
                    {Array.from({ length: totalSems }, (_, i) => i + 1).map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                    ))}
                </select>

                <div className="search-box" style={{ marginLeft: 'auto' }}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Active Regulation Badge */}
            {activeRegulation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px 16px', background: 'var(--primary-50)', borderRadius: '10px', border: '1px solid var(--primary-100)' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-700)', padding: '2px 10px', background: 'var(--primary-100)', borderRadius: '20px' }}>
                        {activeRegulation.name}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--primary-600)' }}>
                        {activeRegulation.course_name} · {activeRegulation.college_name}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--gray-500)' }}>
                        {subjects.length} subjects
                    </span>
                </div>
            )}

            {/* Content */}
            {!filter.regulation_id ? (
                <div className="empty-state">
                    <BookOpen size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                    <h3>Select a Regulation</h3>
                    <p>Choose a regulation above to view and manage its subjects.</p>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Loading subjects...</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                    <h3>No Subjects Found</h3>
                    <p>{searchTerm ? 'No subjects match your search.' : 'Add the first subject to this regulation.'}</p>
                    {!searchTerm && <button className="btn btn-primary" onClick={openCreateModal}><Plus size={16} /> Add Subject</button>}
                </div>
            ) : (
                Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([branchName, semGroups]) => (
                    <div key={branchName} style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-500)', display: 'inline-block' }}></span>
                            {branchName}
                        </h2>
                        {Object.entries(semGroups).sort(([a], [b]) => a.localeCompare(b)).map(([semKey, semSubjects]) => (
                            <div key={semKey} style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{semKey}</h3>
                                <div className="subjects-grid">
                                    {semSubjects.map(subject => (
                                        <div key={subject.id} className="subject-card">
                                            <div className="subject-card-header">
                                                <div className={`subject-icon-wrap ${subject.subject_type === 'lab' ? 'lab' : 'theory'}`}>
                                                    {subject.subject_type === 'lab' ? <FlaskConical size={18} /> : <Presentation size={18} />}
                                                </div>
                                                <div className="subject-actions">
                                                    <button className="icon-btn" onClick={() => openEditModal(subject)}><Edit size={14} /></button>
                                                    <button className="icon-btn danger" onClick={() => handleDelete(subject)}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <h3 className="subject-name">{subject.name}</h3>
                                            <div className="subject-meta">
                                                {subject.code && <span className="badge badge-gray">{subject.code}</span>}
                                                <span className={`badge ${subject.subject_type === 'lab' ? 'badge-lab' : 'badge-theory'}`}>
                                                    {subject.subject_type === 'lab' ? 'LAB' : 'THEORY'}
                                                </span>
                                            </div>
                                            <div className="subject-stats">
                                                {subject.credits && <span className="subject-stat"><BookOpen size={12} /> {subject.credits} Cr</span>}
                                                {subject.subject_type === 'theory' && subject.units && <span className="subject-stat"><Presentation size={12} /> {subject.units} Units</span>}
                                                {subject.subject_type === 'lab' && subject.experiments_count && <span className="subject-stat"><FlaskConical size={12} /> {subject.experiments_count} Exp</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}

            {/* Add/Edit Subject Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSave}>
                            <div className="modal-header">
                                <h3 className="modal-title font-display">
                                    {isEditing ? 'Edit Subject' : 'Add New Subject'} — Step {modalStep}/2
                                </h3>
                                <button type="button" className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
                            </div>

                            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                {modalStep === 1 ? (
                                    <div>
                                        <div className="form-group">
                                            <label className="form-label">Regulation *</label>
                                            <select name="regulation_id" value={form.regulation_id} onChange={handleFormChange} className="form-select" required>
                                                <option value="">Select Regulation</option>
                                                {regulations.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name} — {r.course_name} ({r.college_name})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Branch</label>
                                            <select name="branch_id" value={form.branch_id} onChange={handleFormChange} className="form-select" disabled={!form.regulation_id}>
                                                <option value="">General / No Branch</option>
                                                {formBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Year of Study *</label>
                                                <select name="year_of_study" value={form.year_of_study} onChange={handleFormChange} className="form-select" required disabled={!form.regulation_id}>
                                                    <option value="">Select Year</option>
                                                    {Array.from({ length: formTotalYears }, (_, i) => i + 1).map(y => (
                                                        <option key={y} value={y}>Year {y}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Semester *</label>
                                                <select name="semester_number" value={form.semester_number} onChange={handleFormChange} className="form-select" required disabled={!form.regulation_id}>
                                                    <option value="">Select Semester</option>
                                                    {Array.from({ length: formTotalSems }, (_, i) => i + 1).map(s => (
                                                        <option key={s} value={s}>Sem {s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="form-group">
                                            <label className="form-label">Subject Name *</label>
                                            <input type="text" name="name" value={form.name} onChange={handleFormChange} className="form-input" placeholder="e.g. Engineering Mathematics" required />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Subject Code</label>
                                                <input type="text" name="code" value={form.code} onChange={handleFormChange} className="form-input" placeholder="e.g. CS101" />
                                            </div>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Type *</label>
                                                <select name="subject_type" value={form.subject_type} onChange={handleFormChange} className="form-select" required>
                                                    <option value="theory">Theory</option>
                                                    <option value="lab">Laboratory</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            <div className="form-group" style={{ margin: 0 }}>
                                                <label className="form-label">Credits</label>
                                                <input type="number" step="0.5" name="credits" value={form.credits} onChange={handleFormChange} className="form-input" />
                                            </div>
                                            {form.subject_type === 'theory' ? (
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label className="form-label">Units</label>
                                                    <input type="number" name="units" value={form.units} onChange={handleFormChange} className="form-input" />
                                                </div>
                                            ) : (
                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label className="form-label">Experiments</label>
                                                    <input type="number" name="experiments_count" value={form.experiments_count} onChange={handleFormChange} className="form-input" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => modalStep === 1 ? setShowModal(false) : setModalStep(1)}>
                                    {modalStep === 1 ? 'Cancel' : 'Back'}
                                </button>
                                {modalStep === 1 ? (
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setModalStep(2)}
                                        disabled={!form.regulation_id || !form.year_of_study || !form.semester_number}
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Subject'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subjects;
