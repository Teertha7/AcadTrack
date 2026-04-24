import { useEffect, useState } from 'react';
import { enrollmentsAPI } from '../../api/endpoints';
import CourseMaterialsPanel from '../faculty/CourseMaterials';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdMenuBook, MdInsertDriveFile } from 'react-icons/md';

export default function StudentCourseMaterials() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentsAPI.getMyEnrollments()
      .then(r => {
        const active = (r.data.data || []).filter(e => e.status === 'active');
        setEnrollments(active);
      })
      .catch(() => toast.error('Failed to load enrolled courses'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div className="page-header">
        <h1>Course Materials</h1>
        <p>Browse and download study materials shared by your faculty</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Enrolled Courses sidebar */}
        <div className="card" style={{ padding: 0, height: 'fit-content' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-border)' }}>
            <span className="card-title">My Courses</span>
          </div>
          {loading ? (
            <div className="loading-center" style={{ minHeight: 160 }}><div className="spinner" /></div>
          ) : enrollments.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <MdMenuBook size={36} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 13 }}>No active enrollments</p>
            </div>
          ) : (
            enrollments.map(e => (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--bg-border)',
                  cursor: 'pointer',
                  background: selected?.id === e.id ? 'var(--primary-bg)' : 'transparent',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={ev => ev.currentTarget.style.background = selected?.id === e.id ? 'var(--primary-bg)' : 'transparent'}
              >
                <div
                  className="fw-600"
                  style={{ fontSize: 14, color: selected?.id === e.id ? 'var(--primary-light)' : 'var(--text-primary)' }}
                >
                  {e.course_title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <code style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.course_code}</code>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>Sem {e.semester}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Materials panel */}
        <div className="card" style={{ padding: 0 }}>
          {!selected ? (
            <div className="empty-state">
              <MdInsertDriveFile className="empty-state-icon" />
              <p>Select a course to view its materials</p>
            </div>
          ) : (
            <CourseMaterialsPanel
              course={{ id: selected.course_id, title: selected.course_title }}
              canUpload={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
