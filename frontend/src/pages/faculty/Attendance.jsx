import { useEffect, useState } from 'react';
import { coursesAPI, enrollmentsAPI, attendanceAPI } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdChecklist, MdSave } from 'react-icons/md';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'];
const BADGE_MAP = { present:'badge-success', absent:'badge-danger', late:'badge-warning', excused:'badge-info' };

export default function FacultyAttendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // {student_id: status}
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesAPI.getAll({ faculty_id: user?.id, limit: 100 })
      .then(r => setCourses(r.data.data || []))
      .finally(() => setCoursesLoading(false));
  }, [user]);

  const loadStudentsAndAttendance = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const [enrollRes, attRes] = await Promise.all([
        enrollmentsAPI.getAll({ course_id: selectedCourse, status: 'active', limit: 200 }),
        attendanceAPI.getByCourse(selectedCourse, date),
      ]);
      const enrolled = enrollRes.data.data || [];
      const att = attRes.data.data || [];
      setStudents(enrolled);
      setExisting(att);

      // Pre-fill attendance state: first from existing records
      const map = {};
      enrolled.forEach(s => { map[s.student_id] = 'present'; }); // default present
      att.forEach(a => { map[a.student_id] = a.status; });
      setAttendance(map);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (selectedCourse && date) loadStudentsAndAttendance(); }, [selectedCourse, date]);

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s.student_id] = status; });
    setAttendance(map);
  };

  const handleSave = async () => {
    if (!students.length) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        student_id: s.student_id,
        status: attendance[s.student_id] || 'present',
        remarks: '',
      }));
      await attendanceAPI.markBulk({ course_id: parseInt(selectedCourse), class_date: date, records });
      toast.success(`Attendance marked for ${students.length} students`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(attendance).filter(v => v === 'present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Record daily attendance for your courses</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Course <span>*</span></label>
            <select className="form-control" value={selectedCourse}
              onChange={e => { setSelectedCourse(e.target.value); setStudents([]); setAttendance({}); }}>
              <option value="">Select course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Class Date <span>*</span></label>
            <input type="date" className="form-control" value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {loading && <div className="loading-center"><div className="spinner"/></div>}

      {!loading && students.length > 0 && (
        <>
          {/* Summary + Quick Actions */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
            <div style={{ display:'flex', gap:12 }}>
              <span className="badge badge-success" style={{ fontSize:13, padding:'6px 14px' }}>Present: {presentCount}</span>
              <span className="badge badge-danger" style={{ fontSize:13, padding:'6px 14px' }}>Absent: {absentCount}</span>
              <span className="badge badge-muted" style={{ fontSize:13, padding:'6px 14px' }}>Total: {students.length}</span>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => markAll('present')}>Mark All Present</button>
              <button className="btn btn-secondary btn-sm" onClick={() => markAll('absent')}>Mark All Absent</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-attendance-btn">
                <MdSave size={16}/> {saving ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding:0 }}>
            <div className="table-wrapper" style={{ border:'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Roll Number</th>
                    {STATUS_OPTIONS.map(s => (
                      <th key={s} style={{ textAlign:'center' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</th>
                    ))}
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.student_id}>
                      <td style={{ color:'var(--text-muted)', fontSize:13 }}>{i+1}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div className="avatar" style={{ width:30, height:30, fontSize:11 }}>
                            {s.student_name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                          </div>
                          <span className="fw-600" style={{ fontSize:14 }}>{s.student_name}</span>
                        </div>
                      </td>
                      <td><code style={{ color:'var(--primary-light)', fontSize:12 }}>{s.roll_number}</code></td>
                      {STATUS_OPTIONS.map(status => (
                        <td key={status} style={{ textAlign:'center' }}>
                          <input
                            type="radio"
                            name={`att-${s.student_id}`}
                            value={status}
                            checked={attendance[s.student_id] === status}
                            onChange={() => setAttendance(prev => ({ ...prev, [s.student_id]: status }))}
                            style={{ accentColor:'var(--primary)', width:16, height:16, cursor:'pointer' }}
                          />
                        </td>
                      ))}
                      <td>
                        <span className={`badge ${BADGE_MAP[attendance[s.student_id]] || 'badge-muted'}`}>
                          {attendance[s.student_id] || 'present'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loading && selectedCourse && !students.length && (
        <div className="empty-state">
          <MdChecklist className="empty-state-icon"/>
          <p>No students enrolled in this course</p>
        </div>
      )}
    </div>
  );
}
