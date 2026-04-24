import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MdDashboard, MdMenuBook, MdChecklist, MdGrade, MdLogout } from 'react-icons/md';

const navItems = [
  { to: '/faculty', label: 'Dashboard', icon: <MdDashboard />, exact: true },
  { to: '/faculty/courses', label: 'My Courses', icon: <MdMenuBook /> },
  { to: '/faculty/attendance', label: 'Attendance', icon: <MdChecklist /> },
  { to: '/faculty/grades', label: 'Grades', icon: <MdGrade /> },
];

export default function FacultyLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'F';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">Acad<span>Track</span></span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section-label">Faculty Portal</span>
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
              <div className="role-badge faculty" style={{ padding:'2px 8px', marginTop:2 }}>Faculty</div>
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
