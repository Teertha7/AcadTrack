import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import {
  MdPeople, MdSchool, MdMenuBook, MdAssignment,
  MdTrendingUp, MdAttachMoney, MdWarning
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

const StatCard = ({ icon, label, value, colorClass, iconBg }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value?.toLocaleString?.() ?? value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const deptChartData = stats?.department_stats?.map(d => ({
    name: d.name.split(' ')[0], students: d.student_count
  })) || [];

  const feeBreakdown = [
    { name: 'Collected', value: Math.round(stats?.finance?.annual_revenue || 0) },
    { name: 'Pending', value: Math.round(stats?.finance?.pending_fees || 0) },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and key metrics</p>
      </div>

      <div className="stats-grid">
        <StatCard
          colorClass="blue" label="Total Students" icon={<MdPeople size={22} color="#6366f1" />}
          value={stats?.totals?.students} iconBg="rgba(99,102,241,0.12)"
        />
        <StatCard
          colorClass="cyan" label="Faculty Members" icon={<MdSchool size={22} color="#0ea5e9" />}
          value={stats?.totals?.faculty} iconBg="rgba(14,165,233,0.12)"
        />
        <StatCard
          colorClass="green" label="Active Courses" icon={<MdMenuBook size={22} color="#10b981" />}
          value={stats?.totals?.courses} iconBg="rgba(16,185,129,0.12)"
        />
        <StatCard
          colorClass="amber" label="Active Enrollments" icon={<MdAssignment size={22} color="#f59e0b" />}
          value={stats?.totals?.enrollments} iconBg="rgba(245,158,11,0.12)"
        />
        <StatCard
          colorClass="green" label="Annual Revenue (₹)" icon={<MdAttachMoney size={22} color="#10b981" />}
          value={`₹${(stats?.finance?.annual_revenue || 0).toLocaleString()}`}
          iconBg="rgba(16,185,129,0.12)"
        />
        <StatCard
          colorClass="red" label="Pending Fees (₹)" icon={<MdWarning size={22} color="#ef4444" />}
          value={`₹${(stats?.finance?.pending_fees || 0).toLocaleString()}`}
          iconBg="rgba(239,68,68,0.12)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Department Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Students by Department</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2436', border: '1px solid #2a3147', borderRadius: 8, color: '#e8eaf6' }}
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              />
              <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Finance Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fee Collection Status</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={feeBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={4}>
                {feeBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2436', border: '1px solid #2a3147', borderRadius: 8, color: '#e8eaf6' }}
                formatter={(v) => `₹${v.toLocaleString()}`}
              />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recently Enrolled Students</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Email</th>
                <th>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_students?.length ? stats.recent_students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {s.full_name.split(' ').map(w => w[0]).join('').slice(0,2)}
                      </div>
                      <span className="fw-600">{s.full_name}</span>
                    </div>
                  </td>
                  <td><code style={{ color: 'var(--primary-light)', fontSize: 12 }}>{s.roll_number}</code></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.department}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(s.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5}>
                  <div className="empty-state" style={{ padding: 32 }}>
                    <span className="empty-state-icon">📭</span>
                    <p>No students yet</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
