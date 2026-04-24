import { useEffect, useState, useCallback, useMemo } from 'react';
import { enrollmentsAPI, studentsAPI, coursesAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdAdd, MdAssignment, MdInfoOutline } from 'react-icons/md';

const STATUS_COLORS = { active:'badge-success', dropped:'badge-danger', completed:'badge-primary' };

export default function AdminEnrollments() {
  const [list, setList] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [studentFilter, setStudentFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ student_id:'', course_id:'' });
  const [submitting, setSubmitting] = useState(false);
  const [studentEnrolledIds, setStudentEnrolledIds] = useState(new Set());
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await enrollmentsAPI.getAll({
        page, limit,
        student_id: studentFilter || undefined,
        course_id: courseFilter || undefined,
        status: statusFilter || undefined,
      });
      setList(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load enrollments'); }
    finally { setLoading(false); }
  }, [page, studentFilter, courseFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    studentsAPI.getAll({ limit: 500 }).then(r => setStudents(r.data.data || []));
    coursesAPI.getAll({ limit: 500 }).then(r => setCourses(r.data.data || []));
  }, []);

  // Derive the selected student object from the form
  const selectedStudent = useMemo(
    () => students.find(s => String(s.id) === String(form.student_id)) || null,
    [students, form.student_id]
  );

  // Filter courses: must match selected student's semester AND department, AND not already actively enrolled
  const eligibleCourses = useMemo(() => {
    if (!selectedStudent) return courses;
    return courses.filter(c =>
      c.semester === selectedStudent.current_semester &&
      c.department_id === selectedStudent.department_id &&
      !studentEnrolledIds.has(c.id)
    );
  }, [courses, selectedStudent, studentEnrolledIds]);

  const openModal = () => {
    setForm({ student_id:'', course_id:'' });
    setStudentEnrolledIds(new Set());
    setModal(true);
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;
    setForm({ student_id: studentId, course_id: '' });
    setStudentEnrolledIds(new Set());
    if (!studentId) return;
    setLoadingEnrollments(true);
    try {
      // Fetch this student's active enrollments so we can exclude them from the dropdown
      const res = await enrollmentsAPI.getAll({ student_id: studentId, status: 'active', limit: 200 });
      const ids = new Set((res.data.data || []).map(e => e.course_id));
      setStudentEnrolledIds(ids);
    } catch { /* non-fatal — show all eligible courses */ }
    finally { setLoadingEnrollments(false); }
  };

  const handleEnroll = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await enrollmentsAPI.enroll(parseInt(form.student_id), parseInt(form.course_id));
      toast.success('Student enrolled successfully!');
      setModal(false); setForm({ student_id:'', course_id:'' }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await enrollmentsAPI.updateStatus(id, status);
      toast.success(`Enrollment ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <h1>Enrollments</h1>
        <p>Manage student course enrollments</p>
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select className="form-control" style={{ width:'auto', minWidth:180 }}
            value={studentFilter} onChange={e=>{setStudentFilter(e.target.value);setPage(1);}}>
            <option value="">All Students</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
          </select>
          <select className="form-control" style={{ width:'auto', minWidth:180 }}
            value={courseFilter} onChange={e=>{setCourseFilter(e.target.value);setPage(1);}}>
            <option value="">All Courses</option>
            {courses.map(c=><option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
          </select>
          <select className="form-control" style={{ width:'auto', minWidth:130 }}
            value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="dropped">Dropped</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openModal} id="enroll-btn">
          <MdAdd size={18} /> Enroll Student
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper" style={{ border:'none' }}>
          {loading ? <div className="loading-center"><div className="spinner"/></div> : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Faculty</th>
                  <th>Enrolled On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length ? list.map(e=>(
                  <tr key={e.id}>
                    <td className="fw-600" style={{fontSize:14}}>{e.student_name}</td>
                    <td><code style={{color:'var(--primary-light)',fontSize:12}}>{e.roll_number}</code></td>
                    <td style={{color:'var(--text-secondary)',fontSize:13}}>{e.course_title}</td>
                    <td><code style={{color:'var(--info)',fontSize:12}}>{e.course_code}</code></td>
                    <td style={{color:'var(--text-muted)',fontSize:13}}>{e.faculty_name||'—'}</td>
                    <td style={{color:'var(--text-muted)',fontSize:13}}>
                      {new Date(e.enrolled_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[e.status]||'badge-muted'}`}>{e.status}</span></td>
                    <td>
                      <select
                        className="form-control"
                        style={{width:'auto',padding:'4px 8px',fontSize:12}}
                        value={e.status}
                        onChange={ev=>handleStatusChange(e.id,ev.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="dropped">Drop</option>
                        <option value="completed">Complete</option>
                      </select>
                    </td>
                  </tr>
                )):(
                  <tr><td colSpan={8}><div className="empty-state"><MdAssignment className="empty-state-icon"/><p>No enrollments found</p></div></td></tr>
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
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Enroll Student in Course</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEnroll}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Student <span>*</span></label>
                  <select className="form-control" value={form.student_id}
                    onChange={handleStudentChange} required>
                    <option value="">Select Student</option>
                    {students.map(s=>(
                      <option key={s.id} value={s.id}>
                        {s.full_name} — {s.roll_number} (Sem {s.current_semester}, {s.department_name})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div style={{
                    background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.25)',
                    borderRadius:8, padding:'10px 14px', marginBottom:12, display:'flex',
                    alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)'
                  }}>
                    <MdInfoOutline size={16} style={{color:'var(--primary)',flexShrink:0}} />
                    {loadingEnrollments ? (
                      <span>Loading available courses…</span>
                    ) : (
                      <span>
                        Showing <strong style={{color:'var(--text-primary)'}}>Semester {selectedStudent.current_semester}</strong>
                        {' '}courses from <strong style={{color:'var(--text-primary)'}}>{selectedStudent.department_name}</strong>
                        {eligibleCourses.length === 0 && studentEnrolledIds.size > 0 && (
                          <span style={{color:'var(--warning)',marginLeft:4}}>— student is already enrolled in all available courses this semester</span>
                        )}
                        {eligibleCourses.length === 0 && studentEnrolledIds.size === 0 && (
                          <span style={{color:'var(--warning)',marginLeft:4}}>— no courses found for this semester &amp; department</span>
                        )}
                        {eligibleCourses.length > 0 && (
                          <span style={{color:'var(--success)',marginLeft:4}}>— {eligibleCourses.length} course{eligibleCourses.length > 1 ? 's' : ''} available</span>
                        )}
                      </span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Course <span>*</span></label>
                  <select className="form-control" value={form.course_id}
                    onChange={e=>setForm(p=>({...p,course_id:e.target.value}))} required
                    disabled={!form.student_id}>
                    <option value="">{form.student_id ? 'Select Course' : 'Select a student first'}</option>
                    {eligibleCourses.map(c=>(
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.course_code}) — Sem {c.semester} · {c.enrolled_count}/{c.max_students} enrolled
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"
                  disabled={submitting || !form.course_id} id="confirm-enroll-btn">
                  {submitting ? 'Enrolling…' : 'Enroll Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
