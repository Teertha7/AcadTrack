import { useEffect, useState } from 'react';
import { enrollmentsAPI, gradesAPI, attendanceAPI, feesAPI } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdMenuBook, MdGrade, MdChecklist, MdPayment, MdTrendingUp } from 'react-icons/md';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [feeSummary, setFeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      enrollmentsAPI.getMyEnrollments(),
      gradesAPI.getMy(),
      attendanceAPI.getMySummary(),
      feesAPI.getMy(),
    ])
      .then(([enrRes, gradeRes, attRes, feeRes]) => {
        setEnrollments(enrRes.data.data || []);
        setGpa(gradeRes.data.gpa);
        setAttendanceSummary(attRes.data.data || []);
        setFeeSummary(feeRes.data.summary);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  const avgAttendance = attendanceSummary.length
    ? (attendanceSummary.reduce((sum, c) => sum + (c.percentage || 0), 0) / attendanceSummary.length).toFixed(1)
    : 0;

  const lowAttendanceCourses = attendanceSummary.filter(c => c.percentage < 75);

  return (
    <div>
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Hello, {user?.full_name}! Here's your academic summary</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon" style={{background:'rgba(99,102,241,0.12)'}}><MdMenuBook size={22} color="#6366f1"/></div>
          <div className="stat-info">
            <div className="stat-value">{enrollments.length}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon" style={{background:'rgba(14,165,233,0.12)'}}><MdTrendingUp size={22} color="#0ea5e9"/></div>
          <div className="stat-info">
            <div className="stat-value">{gpa?.cgpa ?? '—'}</div>
            <div className="stat-label">CGPA</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon" style={{background:'rgba(16,185,129,0.12)'}}><MdChecklist size={22} color="#10b981"/></div>
          <div className="stat-info">
            <div className="stat-value">{avgAttendance}%</div>
            <div className="stat-label">Avg. Attendance</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon" style={{background:'rgba(245,158,11,0.12)'}}><MdPayment size={22} color="#f59e0b"/></div>
          <div className="stat-info">
            <div className="stat-value">₹{parseFloat(feeSummary?.balance || 0).toLocaleString()}</div>
            <div className="stat-label">Fee Balance</div>
          </div>
        </div>
      </div>

      {/* Low Attendance Warning */}
      {lowAttendanceCourses.length > 0 && (
        <div style={{
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          borderRadius:'var(--radius-md)', padding:'16px 20px', marginBottom:20,
          display:'flex', alignItems:'flex-start', gap:12,
        }}>
          <span style={{fontSize:20}}>⚠️</span>
          <div>
            <div className="fw-600" style={{color:'var(--danger)',marginBottom:4}}>Low Attendance Warning</div>
            <div style={{fontSize:13,color:'var(--text-secondary)'}}>
              Your attendance is below 75% in: {lowAttendanceCourses.map(c => <strong key={c.course_id}>{c.course_title} ({c.percentage}%)</strong>).reduce((acc,el) => [acc,', ',el])}
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Enrolled Courses */}
        <div className="card">
          <div className="card-header"><span className="card-title">My Courses</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {enrollments.slice(0,6).map(e => (
              <div key={e.course_id} style={{
                padding:'12px 16px', background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <div>
                  <div className="fw-600" style={{fontSize:14}}>{e.course_title}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{e.course_code} · {e.credits} credits</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <span className={`badge ${e.grade_letter&&e.grade_letter!=='N/A'?'badge-success':'badge-muted'}`}>
                    {e.grade_letter||'N/A'}
                  </span>
                  <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>
                    {e.attendance_percentage??0}% att.
                  </div>
                </div>
              </div>
            ))}
            {!enrollments.length && (
              <div className="empty-state" style={{padding:32}}>
                <MdMenuBook style={{fontSize:36,opacity:0.3}}/>
                <p>No courses enrolled</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <div className="card-header"><span className="card-title">Attendance Overview</span></div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {attendanceSummary.slice(0,6).map(c => (
              <div key={c.course_id}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:600}}>{c.course_title}</span>
                    <span style={{fontSize:11,color:'var(--text-muted)',marginLeft:8}}>{c.present_count}/{c.total_classes} classes</span>
                  </div>
                  <span style={{
                    fontSize:13, fontWeight:600,
                    color: c.percentage>=75?'var(--success)':c.percentage>=60?'var(--warning)':'var(--danger)'
                  }}>{c.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width:`${c.percentage}%`,
                    background: c.percentage>=75?undefined:c.percentage>=60?'var(--warning)':'var(--danger)',
                  }}/>
                </div>
              </div>
            ))}
            {!attendanceSummary.length && (
              <div className="empty-state" style={{padding:32}}>
                <MdChecklist style={{fontSize:36,opacity:0.3}}/>
                <p>No attendance data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
