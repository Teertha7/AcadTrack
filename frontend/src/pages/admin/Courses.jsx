import { useEffect, useState, useCallback, useMemo } from 'react';
import { coursesAPI, adminAPI, facultyAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdMenuBook } from 'react-icons/md';

const emptyForm = {
  department_id:'', faculty_id:'', course_code:'', title:'', description:'',
  credits:3, semester:1, max_students:60,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getAll({
        page, limit, search,
        department_id: deptFilter || undefined,
        semester: semFilter || undefined,
      });
      setCourses(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  }, [page, search, deptFilter, semFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    adminAPI.getDepartments().then(r => setDepartments(r.data.data || []));
    facultyAPI.getAll({ limit: 200 }).then(r => setFaculties(r.data.data || []));
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('create'); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ department_id: c.department_id, faculty_id: c.faculty_id || '', course_code: c.course_code,
      title: c.title, description: c.description || '', credits: c.credits,
      semester: c.semester, max_students: c.max_students });
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...form, faculty_id: form.faculty_id || null };
      if (modal === 'create') { await coursesAPI.create(data); toast.success('Course created!'); }
      else { const { course_code, ...upd } = data; await coursesAPI.update(editing.id, upd); toast.success('Course updated!'); }
      setModal(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this course?')) return;
    try { await coursesAPI.delete(id); toast.success('Course deactivated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const totalPages = Math.ceil(total / limit);

  // When department changes in the form, reset faculty selection
  const handleDeptChange = (val) => {
    setForm(p => ({ ...p, department_id: val, faculty_id: '' }));
  };

  // Only show faculty from the selected department
  const filteredFaculties = useMemo(() => {
    if (!form.department_id) return faculties;
    return faculties.filter(fc => String(fc.department_id) === String(form.department_id));
  }, [faculties, form.department_id]);

  return (
    <div>
      <div className="page-header">
        <h1>Courses</h1>
        <p>Manage academic courses and faculty assignments</p>
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="search-input-wrapper">
            <MdSearch className="search-icon" />
            <input className="search-input" placeholder="Search courses…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ width:'auto', minWidth:150 }}
            value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-control" style={{ width:'auto', minWidth:120 }}
            value={semFilter} onChange={e => { setSemFilter(e.target.value); setPage(1); }}>
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-course-btn">
          <MdAdd size={18} /> Add Course
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Faculty</th>
                  <th>Sem</th>
                  <th>Credits</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length ? courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-600" style={{ fontSize:14 }}>{c.title}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.description?.slice(0,50)}{c.description?.length>50?'…':''}</div>
                    </td>
                    <td><code style={{ color:'var(--primary-light)', fontSize:12 }}>{c.course_code}</code></td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{c.department_name}</td>
                    <td style={{ fontSize:13, color:'var(--text-secondary)' }}>{c.faculty_name || <span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                    <td><span className="badge badge-primary">Sem {c.semester}</span></td>
                    <td style={{ color:'var(--text-secondary)' }}>{c.credits}</td>
                    <td>
                      <span style={{ fontSize:13 }}>{c.enrolled_count}/{c.max_students}</span>
                      <div className="progress-bar" style={{ width:60, marginTop:4 }}>
                        <div className="progress-fill" style={{ width:`${Math.min((c.enrolled_count/c.max_students)*100,100)}%` }} />
                      </div>
                    </td>
                    <td><span className={`badge ${c.is_active?'badge-success':'badge-danger'}`}>{c.is_active?'Active':'Inactive'}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(c)}><MdEdit size={15}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c.id)}><MdDelete size={15}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9}><div className="empty-state"><MdMenuBook className="empty-state-icon"/><p>No courses found</p></div></td></tr>
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
              <h2 className="modal-title">{modal==='create'?'Add Course':'Edit Course'}</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Course Title <span>*</span></label>
                    <input className="form-control" value={form.title} onChange={e=>f('title',e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course Code <span>*</span></label>
                    <input className="form-control" value={form.course_code}
                      onChange={e=>f('course_code',e.target.value)} required disabled={modal==='edit'} placeholder="CSE401" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department <span>*</span></label>
                    <select className="form-control" value={form.department_id}
                      onChange={e=>handleDeptChange(e.target.value)} required>
                      <option value="">Select</option>
                      {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Assign Faculty
                      {form.department_id && filteredFaculties.length === 0 && (
                        <span style={{color:'var(--warning)',fontSize:11,marginLeft:8,fontWeight:400}}>No faculty in this dept</span>
                      )}
                      {form.department_id && filteredFaculties.length > 0 && (
                        <span style={{color:'var(--text-muted)',fontSize:11,marginLeft:8,fontWeight:400}}>({filteredFaculties.length} available)</span>
                      )}
                    </label>
                    <select className="form-control" value={form.faculty_id}
                      onChange={e=>f('faculty_id',e.target.value)}
                      disabled={!form.department_id}>
                      <option value="">{form.department_id ? 'Unassigned' : 'Select department first'}</option>
                      {filteredFaculties.map(fc=><option key={fc.id} value={fc.id}>{fc.full_name} ({fc.designation||'Faculty'})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester <span>*</span></label>
                    <select className="form-control" value={form.semester} onChange={e=>f('semester',parseInt(e.target.value))} required>
                      {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <input type="number" className="form-control" value={form.credits}
                      onChange={e=>f('credits',parseInt(e.target.value))} min={1} max={10} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Students</label>
                    <input type="number" className="form-control" value={form.max_students}
                      onChange={e=>f('max_students',parseInt(e.target.value))} min={1} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={form.description}
                    onChange={e=>f('description',e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting?'Saving…':modal==='create'?'Create Course':'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
