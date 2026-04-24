import { useEffect, useState } from 'react';
import { attendanceAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdChecklist } from 'react-icons/md';

export default function StudentAttendance() {
  const [summary, setSummary] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    attendanceAPI.getMySummary()
      .then(res => setSummary(res.data.data || []))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const loadRecords = async (course) => {
    setSelectedCourse(course);
    setRecLoading(true);
    try {
      const res = await attendanceAPI.getMy({ course_id: course.course_id });
      setRecords(res.data.data || []);
    } catch { toast.error('Failed to load records'); }
    finally { setRecLoading(false); }
  };

  const STATUS_BADGE = { present:'badge-success', absent:'badge-danger', late:'badge-warning', excused:'badge-info' };

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>Track your attendance across all enrolled courses</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20 }}>
        {/* Summary Panel */}
        <div>
          {summary.map(c => (
            <div
              key={c.course_id}
              className="card"
              style={{
                marginBottom: 12, cursor:'pointer', padding:'16px',
                border: selectedCourse?.course_id===c.course_id ? '1px solid var(--primary)' : '1px solid var(--bg-border)',
              }}
              onClick={() => loadRecords(c)}
            >
              <div className="fw-600" style={{fontSize:14,marginBottom:8}}>{c.course_title}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>{c.course_code}</span>
                <span style={{
                  fontSize:15, fontWeight:700,
                  color: c.percentage>=75?'var(--success)':c.percentage>=60?'var(--warning)':'var(--danger)'
                }}>{c.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width:`${c.percentage}%`,
                  background: c.percentage>=75?undefined:c.percentage>=60?'var(--warning)':'var(--danger)',
                }}/>
              </div>
              <div style={{display:'flex',gap:12,marginTop:10,fontSize:12,color:'var(--text-muted)'}}>
                <span>✅ {c.present_count} present</span>
                <span>❌ {c.absent_count} absent</span>
                <span>🕐 {c.late_count} late</span>
              </div>
              {c.percentage < 75 && (
                <div style={{marginTop:8,fontSize:11,color:'var(--danger)',fontWeight:600}}>⚠ Below 75% threshold</div>
              )}
            </div>
          ))}
          {!summary.length && (
            <div className="empty-state"><MdChecklist className="empty-state-icon"/><p>No attendance data</p></div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="card">
          {!selectedCourse ? (
            <div className="empty-state">
              <MdChecklist className="empty-state-icon"/>
              <p>Select a course to view detailed records</p>
            </div>
          ) : (
            <>
              <div className="card-header">
                <div>
                  <span className="card-title">{selectedCourse.course_title}</span>
                  <p style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>
                    {selectedCourse.total_classes} total classes
                  </p>
                </div>
                <span style={{
                  fontSize:18,fontWeight:700,
                  color:selectedCourse.percentage>=75?'var(--success)':selectedCourse.percentage>=60?'var(--warning)':'var(--danger)'
                }}>{selectedCourse.percentage}%</span>
              </div>
              <div className="table-wrapper" style={{border:'none',borderRadius:0}}>
                {recLoading ? <div className="loading-center"><div className="spinner"/></div> : (
                  <table>
                    <thead>
                      <tr><th>Date</th><th style={{textAlign:'center'}}>Status</th><th>Remarks</th></tr>
                    </thead>
                    <tbody>
                      {records.length ? records.map((r,i) => (
                        <tr key={i}>
                          <td style={{fontWeight:500}}>
                            {new Date(r.class_date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}
                          </td>
                          <td style={{textAlign:'center'}}>
                            <span className={`badge ${STATUS_BADGE[r.status]||'badge-muted'}`}>{r.status}</span>
                          </td>
                          <td style={{color:'var(--text-muted)',fontSize:13}}>{r.remarks||'—'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3}><div className="empty-state" style={{padding:32}}><p>No records for this course</p></div></td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
