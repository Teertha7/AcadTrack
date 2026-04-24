import { useEffect, useState, useCallback } from 'react';
import { facultyAPI, adminAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdSchool } from 'react-icons/md';

const emptyForm = {
  department_id: '', full_name: '', email: '', password: '',
  phone: '', designation: '', qualification: '', joining_date: '',
};

export default function AdminFaculty() {
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await facultyAPI.getAll({ page, limit, search, department_id: deptFilter || undefined });
      setList(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load faculty'); }
    finally { setLoading(false); }
  }, [page, search, deptFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { adminAPI.getDepartments().then(r => setDepartments(r.data.data || [])); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('create'); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({ department_id: f.department_id, full_name: f.full_name, email: f.email, password: '',
      phone: f.phone || '', designation: f.designation || '', qualification: f.qualification || '',
      joining_date: f.joining_date?.slice?.(0, 10) || '' });
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (modal === 'create') { await facultyAPI.create(form); toast.success('Faculty added!'); }
      else {
        const { password, email, ...data } = form;
        await facultyAPI.update(editing.id, data); toast.success('Faculty updated!');
      }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await facultyAPI.delete(deleteConfirm.id);
      toast.success('Faculty deactivated'); setDeleteConfirm(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <h1>Faculty</h1>
        <p>Manage faculty members and their department assignments</p>
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input className="search-input" placeholder="Search faculty…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width:'auto', minWidth:160 }}
            value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-faculty-btn">
          <MdAdd size={18} /> Add Faculty
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Qualification</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length ? list.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar" style={{ width:34,height:34,fontSize:12 }}>
                          {f.full_name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                        <div>
                          <div className="fw-600" style={{ fontSize:14 }}>{f.full_name}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{f.department_name}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{f.designation || '—'}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:13 }}>{f.qualification || '—'}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:13 }}>{f.phone || '—'}</td>
                    <td><span className={`badge ${f.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {f.is_active ? 'Active' : 'Inactive'}
                    </span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(f)}><MdEdit size={15}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm(f)}><MdDelete size={15}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7}><div className="empty-state"><MdSchool className="empty-state-icon" /><p>No faculty found</p></div></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && total > 0 && (
          <div className="pagination">
            <span>Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">{modal==='create'?'Add Faculty':'Edit Faculty'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span>*</span></label>
                    <input className="form-control" value={form.full_name} onChange={e=>upd('full_name',e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span>*</span></label>
                    <input type="email" className="form-control" value={form.email}
                      onChange={e=>upd('email',e.target.value)} required disabled={modal==='edit'} />
                  </div>
                  {modal==='create' && (
                    <div className="form-group">
                      <label className="form-label">Password <span>*</span></label>
                      <input type="password" className="form-control" value={form.password}
                        onChange={e=>upd('password',e.target.value)} required minLength={8} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Department <span>*</span></label>
                    <select className="form-control" value={form.department_id}
                      onChange={e=>upd('department_id',e.target.value)} required>
                      <option value="">Select Department</option>
                      {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={form.designation}
                      onChange={e=>upd('designation',e.target.value)} placeholder="e.g. Associate Professor" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input className="form-control" value={form.qualification}
                      onChange={e=>upd('qualification',e.target.value)} placeholder="e.g. Ph.D. Computer Science" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={e=>upd('phone',e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input type="date" className="form-control" value={form.joining_date}
                      onChange={e=>upd('joining_date',e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting?'Saving…':modal==='create'?'Add Faculty':'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDeleteConfirm(null)}>
          <div className="modal" style={{maxWidth:420}}>
            <div className="modal-header">
              <h2 className="modal-title">Deactivate Faculty</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{color:'var(--text-secondary)'}}>
                Deactivate <strong style={{color:'var(--text-primary)'}}>{deleteConfirm.full_name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={()=>setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
