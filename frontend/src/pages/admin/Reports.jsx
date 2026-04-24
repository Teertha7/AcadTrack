import React, { useState, useEffect } from 'react';
import { reportsAPI, coursesAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdBarChart, MdTableChart } from 'react-icons/md';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('department'); // 'department' or 'course'
  
  // Department Report State
  const [deptReport, setDeptReport] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);

  // Course Grade Report State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseReport, setCourseReport] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // Fetch Department Report
  useEffect(() => {
    if (activeTab === 'department') {
      fetchDeptReport();
    }
  }, [activeTab]);

  // Fetch Courses list once for the dropdown
  useEffect(() => {
    coursesAPI.getAll({ limit: 500 }).then(r => setCourses(r.data.data || []));
  }, []);

  const fetchDeptReport = async () => {
    setLoadingDept(true);
    try {
      const res = await reportsAPI.getDepartmentAcademic();
      setDeptReport(res.data.data || []);
    } catch {
      toast.error('Failed to load Department Report');
    } finally {
      setLoadingDept(false);
    }
  };

  const fetchCourseReport = async (courseId) => {
    setSelectedCourse(courseId);
    if (!courseId) {
      setCourseReport([]);
      return;
    }
    setLoadingCourse(true);
    try {
      const res = await reportsAPI.getCourseGrade(courseId);
      setCourseReport(res.data.data || []);
    } catch {
      toast.error('Failed to load Course Grades Report');
    } finally {
      setLoadingCourse(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>System Reports</h1>
        <p>View aggregated academic data directly computed from the database.</p>
      </div>

      <div className="page-toolbar">
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${activeTab === 'department' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('department')}
          >
            <MdBarChart /> Get Department Report
          </button>
          <button 
            className={`btn ${activeTab === 'course' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('course')}
          >
            <MdTableChart /> Course Grades Report
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {activeTab === 'department' && (
          <div className="table-wrapper" style={{ border: 'none' }}>
            {loadingDept ? <div className="loading-center"><div className="spinner" /></div> : (
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th>Active Students</th>
                    <th>Enrollments</th>
                    <th>Avg GPA</th>
                    <th>Attendance %</th>
                    <th>Fee Collection %</th>
                  </tr>
                </thead>
                <tbody>
                  {deptReport.length ? deptReport.map((row, idx) => (
                    <tr key={row.department_id || idx}>
                      <td className="fw-600">{row.department_name}</td>
                      <td><code style={{color: 'var(--info)'}}>{row.department_code}</code></td>
                      <td>{row.total_students}</td>
                      <td>{row.total_enrollments}</td>
                      <td>
                         <span className="badge badge-primary">{row.avg_gpa !== null ? row.avg_gpa : 'N/A'}</span>
                      </td>
                      <td>{row.attendance_pct ? `${row.attendance_pct}%` : 'N/A'}</td>
                      <td>
                        <span className={`badge ${parseFloat(row.fee_collection_pct) >= 80 ? 'badge-success' : 'badge-warning'}`}>
                          {row.fee_collection_pct ? `${row.fee_collection_pct}%` : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7}><div className="empty-state"><MdBarChart className="empty-state-icon" /><p>No departmental data found</p></div></td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'course' && (
          <div style={{ padding: '20px' }}>
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label className="form-label">Select a Course to generate report</label>
              <select className="form-control" value={selectedCourse} onChange={(e) => fetchCourseReport(e.target.value)}>
                <option value="">Choose a course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.course_code})</option>)}
              </select>
            </div>

            <div className="table-wrapper" style={{ marginTop: '20px', margin: '-20px', borderTop: '1px solid var(--bg-border)' }}>
              {loadingCourse ? <div className="loading-center" style={{ padding: 40 }}><div className="spinner" /></div> : (
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>Internal</th>
                      <th>Mid-Term</th>
                      <th>Final</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Graded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!selectedCourse ? (
                       <tr><td colSpan={8}><div className="empty-state" style={{ padding: 40 }}><MdTableChart className="empty-state-icon" /><p>Please select a course</p></div></td></tr>
                    ) : courseReport.length ? courseReport.map((row, idx) => (
                      <tr key={idx}>
                        <td className="fw-600">{row.student_name}</td>
                        <td><code>{row.roll_number}</code></td>
                        <td>{row.internal_marks}</td>
                        <td>{row.midterm_marks}</td>
                        <td>{row.final_marks}</td>
                        <td className="fw-600">{row.total_marks}</td>
                        <td>
                          {row.grade_letter !== 'N/A' 
                            ? <span className={`badge ${row.grade_letter==='F'?'badge-danger':['O','A+'].includes(row.grade_letter)?'badge-success':'badge-primary'}`}>{row.grade_letter}</span> 
                            : <span className="badge badge-muted">N/A</span>}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{row.graded_by || '—'}</td>
                      </tr>
                    )) : (
                       <tr><td colSpan={8}><div className="empty-state" style={{ padding: 40 }}><MdTableChart className="empty-state-icon" /><p>No students enrolled/graded in this course yet.</p></div></td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
