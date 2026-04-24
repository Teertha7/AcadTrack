import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdDashboard, MdGrade, MdChecklist, MdPayment, MdLogout, MdFolderOpen } from 'react-icons/md';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: <MdDashboard />, exact: true },
  { to: '/student/grades', label: 'My Grades', icon: <MdGrade /> },
  { to: '/student/attendance', label: 'Attendance', icon: <MdChecklist /> },
  { to: '/student/fees', label: 'Fees & Payments', icon: <MdPayment /> },
  { to: '/student/materials', label: 'Course Materials', icon: <MdFolderOpen /> },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'S';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">Acad<span>Track</span></span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section-label">Student Portal</span>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.full_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.roll_number}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ width:'100%' }}>
            <span className="nav-icon"><MdLogout /></span>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  );
}
