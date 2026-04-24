import { useEffect, useState } from 'react';
import { coursesAPI, gradesAPI } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdGrade, MdSave, MdEdit } from 'react-icons/md';

const GRADE_INFO = { O:'O (90+)', 'A+':'A+ (80-89)', A:'A (70-79)', 'B+':'B+ (60-69)', B:'B (50-59)', C:'C (40-49)', F:'F (<40)' };

export default function FacultyGrades() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesAPI.getAll({ faculty_id: user?.id, limit: 100 })
      .then(r => setCourses(r.data.data || []));
  }, [user]);

  const load = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await gradesAPI.getByCourse(courseId);
      setGrades(res.data.data || []);
    } catch { toast.error('Failed to load grades'); }
    finally { setLoading(false); }
  };

  const startEdit = (g) => {
    setEditRow(g.student_id);
    setEditForm({
      student_id: g.student_id, course_id: parseInt(selectedCourse),
      internal_marks: g.internal_marks || '',
      midterm_marks: g.midterm_marks || '',
      final_marks: g.final_marks || '',
      remarks: g.remarks || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await gradesAPI.upsert(editForm);
      toast.success('Grade saved!');
      setEditRow(null);
      await load(selectedCourse);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save grade'); }
    finally { setSaving(false); }
  };

  const ef = (k, v) => setEditForm(p => ({ ...p, [k]: v }));

  // Calculate live total for edit row
  const liveTotal = editRow
    ? (parseFloat(editForm.internal_marks || 0) + parseFloat(editForm.midterm_marks || 0) + parseFloat(editForm.final_marks || 0)).toFixed(1)
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>Manage Grades</h1>
        <p>Enter and update student grades for your courses</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ margin: 0, maxWidth: 400 }}>
          <label className="form-label">Select Course</label>
          <select className="form-control" value={selectedCourse} onChange={e => load(e.target.value)}>
            <option value="">Choose a course…</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
          </select>
        </div>
      </div>

      {loading && <div className="loading-center"><div className="spinner"/></div>}

      {!loading && selectedCourse && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--bg-border)' }}>
            <span className="card-title">
              Grade Sheet — {courses.find(c=>c.id==selectedCourse)?.title}
              {' '} <span style={{color:'var(--text-muted)',fontSize:13}}>({grades.length} students)</span>
            </span>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>
              Max marks: Internal 30 | Mid-term 30 | Final 40 | Total 100
            </p>
          </div>
          <div className="table-wrapper" style={{ border:'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th style={{textAlign:'center'}}>Internal (30)</th>
                  <th style={{textAlign:'center'}}>Mid-term (30)</th>
                  <th style={{textAlign:'center'}}>Final (40)</th>
                  <th style={{textAlign:'center'}}>Total</th>
                  <th style={{textAlign:'center'}}>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.length ? grades.map(g => (
                  <tr key={g.student_id}>
                    <td className="fw-600" style={{fontSize:14}}>{g.student_name}</td>
                    <td><code style={{color:'var(--primary-light)',fontSize:12}}>{g.roll_number}</code></td>
                    {editRow === g.student_id ? (
                      <>
                        <td style={{textAlign:'center'}}>
                          <input type="number" className="form-control" style={{width:70,padding:'4px 8px',fontSize:13,textAlign:'center'}}
                            value={editForm.internal_marks} onChange={e=>ef('internal_marks',e.target.value)} min={0} max={30} />
                        </td>
                        <td style={{textAlign:'center'}}>
                          <input type="number" className="form-control" style={{width:70,padding:'4px 8px',fontSize:13,textAlign:'center'}}
                            value={editForm.midterm_marks} onChange={e=>ef('midterm_marks',e.target.value)} min={0} max={30} />
                        </td>
                        <td style={{textAlign:'center'}}>
                          <input type="number" className="form-control" style={{width:70,padding:'4px 8px',fontSize:13,textAlign:'center'}}
                            value={editForm.final_marks} onChange={e=>ef('final_marks',e.target.value)} min={0} max={40} />
                        </td>
                        <td style={{textAlign:'center'}} className="fw-600">{liveTotal}</td>
                        <td style={{textAlign:'center'}}>
                          <span className={`badge ${parseFloat(liveTotal)>=40?'badge-success':'badge-danger'}`}>
                            {parseFloat(liveTotal)>=90?'O':parseFloat(liveTotal)>=80?'A+':parseFloat(liveTotal)>=70?'A':parseFloat(liveTotal)>=60?'B+':parseFloat(liveTotal)>=50?'B':parseFloat(liveTotal)>=40?'C':'F'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-success btn-sm" onClick={handleSave} disabled={saving}>
                              <MdSave size={14}/> {saving?'…':'Save'}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={()=>setEditRow(null)}>✕</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{textAlign:'center',color:'var(--text-secondary)'}}>{g.internal_marks??'—'}</td>
                        <td style={{textAlign:'center',color:'var(--text-secondary)'}}>{g.midterm_marks??'—'}</td>
                        <td style={{textAlign:'center',color:'var(--text-secondary)'}}>{g.final_marks??'—'}</td>
                        <td style={{textAlign:'center'}} className="fw-600">{g.total_marks??'—'}</td>
                        <td style={{textAlign:'center'}}>
                          {g.grade_letter
                            ? <span className={`badge ${g.grade_letter==='F'?'badge-danger':g.grade_letter==='O'||g.grade_letter==='A+'?'badge-success':'badge-primary'}`}>{g.grade_letter}</span>
                            : <span className="badge badge-muted">N/A</span>}
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>startEdit(g)} title="Edit grade">
                            <MdEdit size={15}/>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr><td colSpan={8}><div className="empty-state"><MdGrade className="empty-state-icon"/><p>No students enrolled in this course yet.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
