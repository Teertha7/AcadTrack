import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MdDashboard, MdPeople, MdSchool, MdMenuBook, MdAssignment,
  MdPayment, MdLogout, MdBarChart
} from 'react-icons/md';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <MdDashboard />, exact: true },
  { to: '/admin/students', label: 'Students', icon: <MdPeople /> },
  { to: '/admin/faculty', label: 'Faculty', icon: <MdSchool /> },
  { to: '/admin/courses', label: 'Courses', icon: <MdMenuBook /> },
  { to: '/admin/enrollments', label: 'Enrollments', icon: <MdAssignment /> },
  { to: '/admin/fees', label: 'Fees & Payments', icon: <MdPayment /> },
  { to: '/admin/reports', label: 'Reports', icon: <MdBarChart /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          <span className="sidebar-logo-text">Acad<span>Track</span></span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
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
              <div className="role-badge admin" style={{ padding:'2px 8px', marginTop:2 }}>Admin</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ width:'100%' }}>
            <span className="nav-icon"><MdLogout /></span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
