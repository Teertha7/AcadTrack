import { useEffect, useState } from 'react';
import { gradesAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdGrade, MdTrendingUp } from 'react-icons/md';

const GRADE_COLOR = {
  O: 'badge-success', 'A+': 'badge-success', A: 'badge-primary',
  'B+': 'badge-primary', B: 'badge-info', C: 'badge-warning', F: 'badge-danger',
};

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradesAPI.getMy()
      .then(res => { setGrades(res.data.data || []); setGpa(res.data.gpa); })
      .catch(() => toast.error('Failed to load grades'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  // Group by semester
  const bySemester = grades.reduce((acc, g) => {
    const sem = g.semester || 'N/A';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(g);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1>My Grades</h1>
        <p>View your academic performance across all courses</p>
      </div>

      {/* GPA Summary */}
      <div style={{ display:'flex', gap:16, marginBottom:24 }}>
        <div className="stat-card cyan" style={{ flex:'0 0 auto', minWidth:200 }}>
          <div className="stat-icon" style={{ background:'rgba(14,165,233,0.12)' }}><MdTrendingUp size={22} color="#0ea5e9"/></div>
          <div className="stat-info">
            <div className="stat-value">{gpa?.cgpa ?? '—'}</div>
            <div className="stat-label">CGPA</div>
          </div>
        </div>
        <div className="stat-card green" style={{ flex:'0 0 auto', minWidth:200 }}>
          <div className="stat-icon" style={{ background:'rgba(16,185,129,0.12)' }}><MdGrade size={22} color="#10b981"/></div>
          <div className="stat-info">
            <div className="stat-value">{gpa?.graded_courses ?? 0}</div>
            <div className="stat-label">Graded Courses</div>
          </div>
        </div>
      </div>

      {Object.keys(bySemester).sort().map(sem => (
        <div key={sem} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>
            Semester {sem}
          </h3>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper" style={{ border:'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Credits</th>
                    <th style={{textAlign:'center'}}>Internal</th>
                    <th style={{textAlign:'center'}}>Mid-term</th>
                    <th style={{textAlign:'center'}}>Final</th>
                    <th style={{textAlign:'center'}}>Total</th>
                    <th style={{textAlign:'center'}}>Grade</th>
                    <th style={{textAlign:'center'}}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {bySemester[sem].map(g => (
                    <tr key={g.course_code}>
                      <td className="fw-600" style={{fontSize:14}}>{g.course_title}</td>
                      <td><code style={{color:'var(--primary-light)',fontSize:12}}>{g.course_code}</code></td>
                      <td style={{color:'var(--text-secondary)'}}>{g.credits}</td>
                      <td style={{textAlign:'center',color:'var(--text-muted)'}}>{g.internal_marks??'—'}</td>
                      <td style={{textAlign:'center',color:'var(--text-muted)'}}>{g.midterm_marks??'—'}</td>
                      <td style={{textAlign:'center',color:'var(--text-muted)'}}>{g.final_marks??'—'}</td>
                      <td style={{textAlign:'center'}} className="fw-600">{g.total_marks??'—'}</td>
                      <td style={{textAlign:'center'}}>
                        {g.grade_letter
                          ? <span className={`badge ${GRADE_COLOR[g.grade_letter]||'badge-muted'}`}>{g.grade_letter}</span>
                          : <span className="badge badge-muted">N/A</span>}
                      </td>
                      <td style={{textAlign:'center',color:'var(--text-secondary)'}}>{g.grade_point??'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {!grades.length && (
        <div className="empty-state">
          <MdGrade className="empty-state-icon"/>
          <p>No grades available yet. Grades will appear once your faculty submits them.</p>
        </div>
      )}
    </div>
  );
}
