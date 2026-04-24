import { useEffect, useState } from 'react';
import { coursesAPI, enrollmentsAPI } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdMenuBook, MdPeople, MdSchool } from 'react-icons/md';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesAPI.getAll({ faculty_id: user?.id, limit: 100 })
      .then(r => setCourses(r.data.data || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [user]);

  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.full_name?.split(' ')[0]}! 👋</h1>
        <p>Here's your teaching overview for this semester</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:28 }}>
        <div className="stat-card blue">
          <div className="stat-icon" style={{background:'rgba(99,102,241,0.12)'}}><MdMenuBook size={22} color="#6366f1"/></div>
          <div className="stat-info">
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Assigned Courses</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon" style={{background:'rgba(16,185,129,0.12)'}}><MdPeople size={22} color="#10b981"/></div>
          <div className="stat-info">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon" style={{background:'rgba(14,165,233,0.12)'}}><MdSchool size={22} color="#0ea5e9"/></div>
          <div className="stat-info">
            <div className="stat-value">{user?.department_name || '—'}</div>
            <div className="stat-label">Department</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">My Courses</span></div>
        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <div className="table-wrapper" style={{border:'none', borderRadius:0}}>
            <table>
              <thead>
                <tr><th>Course</th><th>Code</th><th>Semester</th><th>Credits</th><th>Enrolled</th></tr>
              </thead>
              <tbody>
                {courses.length ? courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-600">{c.title}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{c.description?.slice(0,60)}{c.description?.length>60?'…':''}</div>
                    </td>
                    <td><code style={{color:'var(--primary-light)',fontSize:12}}>{c.course_code}</code></td>
                    <td><span className="badge badge-primary">Sem {c.semester}</span></td>
                    <td style={{color:'var(--text-secondary)'}}>{c.credits} credits</td>
                    <td>
                      <span style={{fontSize:13}}>{c.enrolled_count}/{c.max_students}</span>
                      <div className="progress-bar" style={{width:80,marginTop:4}}>
                        <div className="progress-fill" style={{width:`${Math.min((c.enrolled_count/c.max_students)*100,100)}%`}}/>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}><div className="empty-state"><MdMenuBook className="empty-state-icon"/><p>No courses assigned yet</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
