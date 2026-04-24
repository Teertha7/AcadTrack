import { useEffect, useState } from 'react';
import { coursesAPI, enrollmentsAPI } from '../../api/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import CourseMaterialsPanel from './CourseMaterials';
import toast from 'react-hot-toast';
import { MdPeople, MdMenuBook, MdInsertDriveFile } from 'react-icons/md';

const TAB_STUDENTS = 'students';
const TAB_MATERIALS = 'materials';

export default function FacultyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_STUDENTS);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studLoading, setStudLoading] = useState(false);

  useEffect(() => {
    coursesAPI.getAll({ faculty_id: user?.id, limit: 100 })
      .then(r => setCourses(r.data.data || []))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, [user]);

  const selectCourse = async (course) => {
    setSelected(course);
    setActiveTab(TAB_STUDENTS);
    setStudLoading(true);
    try {
      const res = await enrollmentsAPI.getAll({ course_id: course.id, status: 'active', limit: 200 });
      setStudents(res.data.data || []);
    } catch { toast.error('Failed to load students'); }
    finally { setStudLoading(false); }
  };

  const tabStyle = (tab) => ({
    flex: 1,
    padding: '9px 12px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'var(--transition)',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
  });

  return (
    <div>
      <div className="page-header">
        <h1>My Courses</h1>
        <p>Manage students and course materials for your assigned courses</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Course List */}
        <div className="card" style={{ padding: 0, height: 'fit-content' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
            <span className="card-title">Courses ({courses.length})</span>
          </div>
          {loading ? <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div> : (
            courses.length ? courses.map(c => (
              <div
                key={c.id}
                onClick={() => selectCourse(c)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--bg-border)',
                  cursor: 'pointer',
                  background: selected?.id === c.id ? 'var(--primary-bg)' : 'transparent',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = selected?.id === c.id ? 'var(--primary-bg)' : 'transparent'}
              >
                <div className="fw-600" style={{ fontSize: 14, color: selected?.id === c.id ? 'var(--primary-light)' : 'var(--text-primary)' }}>
                  {c.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.course_code}</code>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>Sem {c.semester}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.enrolled_count} students</span>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <MdMenuBook size={40} style={{ opacity: 0.3 }} />
                <p>No courses assigned</p>
              </div>
            )
          )}
        </div>

        {/* Right Panel */}
        <div className="card" style={{ padding: 0 }}>
          {!selected ? (
            <div className="empty-state">
              <MdPeople className="empty-state-icon" />
              <p>Select a course to manage it</p>
            </div>
          ) : (
            <>
              {/* Course info bar */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--bg-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <span className="card-title">{selected.title}</span>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {selected.department_name} · Semester {selected.semester}
                  </p>
                </div>
                <code style={{ color: 'var(--primary-light)', fontSize: 14 }}>{selected.course_code}</code>
              </div>

              {/* Tab switcher */}
              <div style={{
                display: 'flex',
                gap: 6,
                padding: '12px 24px',
                borderBottom: '1px solid var(--bg-border)',
                background: 'var(--bg-elevated)',
              }}>
                <button style={tabStyle(TAB_STUDENTS)} onClick={() => setActiveTab(TAB_STUDENTS)}>
                  <MdPeople size={15} /> Students ({students.length})
                </button>
                <button style={tabStyle(TAB_MATERIALS)} onClick={() => setActiveTab(TAB_MATERIALS)}>
                  <MdInsertDriveFile size={15} /> Materials
                </button>
              </div>

              {/* Tab content */}
              {activeTab === TAB_STUDENTS ? (
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  {studLoading ? <div className="loading-center"><div className="spinner" /></div> : (
                    <table>
                      <thead>
                        <tr><th>Student</th><th>Roll Number</th><th>Email</th><th>Department</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {students.length ? students.map(e => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                                  {e.student_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </div>
                                <span className="fw-600" style={{ fontSize: 14 }}>{e.student_name}</span>
                              </div>
                            </td>
                            <td><code style={{ color: 'var(--primary-light)', fontSize: 12 }}>{e.roll_number}</code></td>
                            <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{e.student_email || '—'}</td>
                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.department_name || '—'}</td>
                            <td><span className="badge badge-success">{e.status}</span></td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5}>
                            <div className="empty-state"><MdPeople className="empty-state-icon" /><p>No students enrolled</p></div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <CourseMaterialsPanel course={selected} canUpload={true} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
