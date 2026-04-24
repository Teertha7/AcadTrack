import { useEffect, useState, useCallback } from 'react';
import { studentsAPI, adminAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdPeople } from 'react-icons/md';

const GENDERS = ['male', 'female', 'other'];

const emptyForm = {
  department_id: '', roll_number: '', full_name: '', email: '',
  password: '', phone: '', date_of_birth: '', gender: '',
  address: '', enrollment_year: new Date().getFullYear(), current_semester: 1,
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsAPI.getAll({ page, limit, search, department_id: deptFilter || undefined });
      setStudents(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [page, search, deptFilter]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  useEffect(() => {
    adminAPI.getDepartments().then(r => setDepartments(r.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('create'); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      department_id: s.department_id, roll_number: s.roll_number, full_name: s.full_name,
      email: s.email, password: '', phone: s.phone || '', date_of_birth: s.date_of_birth?.slice(0, 10) || '',
      gender: s.gender || '', address: s.address || '',
      enrollment_year: s.enrollment_year, current_semester: s.current_semester,
    });
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'create') {
        await studentsAPI.create(form);
        toast.success('Student created successfully');
      } else {
        const { password, roll_number, email, ...updateData } = form;
        await studentsAPI.update(editing.id, updateData);
        toast.success('Student updated successfully');
      }
      setModal(null);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await studentsAPI.delete(deleteConfirm.id);
      toast.success('Student deactivated');
      setDeleteConfirm(null);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>Manage student registrations and profiles</p>
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name, roll, email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              id="student-search"
            />
          </div>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 160 }}
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            id="student-dept-filter"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-student-btn">
          <MdAdd size={18} /> Add Student
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length ? students.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                          {s.full_name.split(' ').map(w => w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="fw-600" style={{ fontSize: 14 }}>{s.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ color: 'var(--primary-light)', fontSize: 12 }}>{s.roll_number}</code></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.department_name}</td>
                    <td><span className="badge badge-primary">Sem {s.current_semester}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.phone || '—'}</td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit">
                          <MdEdit size={15} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(s)} title="Deactivate">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <MdPeople className="empty-state-icon" />
                      <p>No students found</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && total > 0 && (
          <div className="pagination">
            <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} students</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Add New Student' : 'Edit Student'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span>*</span></label>
                    <input className="form-control" value={form.full_name}
                      onChange={e => f('full_name', e.target.value)} required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll Number <span>*</span></label>
                    <input className="form-control" value={form.roll_number}
                      onChange={e => f('roll_number', e.target.value)} required
                      disabled={modal === 'edit'} placeholder="CSE2024001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span>*</span></label>
                    <input type="email" className="form-control" value={form.email}
                      onChange={e => f('email', e.target.value)} required
                      disabled={modal === 'edit'} placeholder="student@email.com" />
                  </div>
                  {modal === 'create' && (
                    <div className="form-group">
                      <label className="form-label">Password <span>*</span></label>
                      <input type="password" className="form-control" value={form.password}
                        onChange={e => f('password', e.target.value)} required minLength={8}
                        placeholder="Min 8 characters" />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Department <span>*</span></label>
                    <select className="form-control" value={form.department_id}
                      onChange={e => f('department_id', e.target.value)} required>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone}
                      onChange={e => f('phone', e.target.value)} placeholder="+91 9000000000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.date_of_birth}
                      onChange={e => f('date_of_birth', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={e => f('gender', e.target.value)}>
                      <option value="">Select Gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Enrollment Year <span>*</span></label>
                    <input type="number" className="form-control" value={form.enrollment_year}
                      onChange={e => f('enrollment_year', parseInt(e.target.value))} required min={2000} max={2100} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Semester <span>*</span></label>
                    <select className="form-control" value={form.current_semester}
                      onChange={e => f('current_semester', parseInt(e.target.value))}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" rows={2} value={form.address}
                    onChange={e => f('address', e.target.value)} placeholder="Full residential address" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="student-submit-btn">
                  {submitting ? 'Saving…' : modal === 'create' ? 'Create Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Deactivation</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to deactivate <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.full_name}</strong>?
                This action can be reversed by updating the student's status.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
