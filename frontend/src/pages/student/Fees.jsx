import { useEffect, useState } from 'react';
import { feesAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdPayment, MdReceipt, MdAttachMoney } from 'react-icons/md';

const STATUS_BADGE = { pending:'badge-warning', partial:'badge-info', paid:'badge-success', overdue:'badge-danger', waived:'badge-muted' };

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feesAPI.getMy()
      .then(res => { setFees(res.data.data || []); setSummary(res.data.summary); })
      .catch(() => toast.error('Failed to load fee data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Fees & Payments</h1>
        <p>View your fee status and payment history</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom:24, gridTemplateColumns:'repeat(4,1fr)' }}>
          <div className="stat-card blue">
            <div className="stat-icon" style={{background:'rgba(99,102,241,0.12)'}}><MdReceipt size={22} color="#6366f1"/></div>
            <div className="stat-info">
              <div className="stat-value">₹{parseFloat(summary.total_amount||0).toLocaleString()}</div>
              <div className="stat-label">Total Fees</div>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon" style={{background:'rgba(16,185,129,0.12)'}}><MdPayment size={22} color="#10b981"/></div>
            <div className="stat-info">
              <div className="stat-value">₹{parseFloat(summary.total_paid||0).toLocaleString()}</div>
              <div className="stat-label">Total Paid</div>
            </div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon" style={{background:'rgba(245,158,11,0.12)'}}><MdAttachMoney size={22} color="#f59e0b"/></div>
            <div className="stat-info">
              <div className="stat-value">₹{parseFloat(summary.balance||0).toLocaleString()}</div>
              <div className="stat-label">Balance Due</div>
            </div>
          </div>
          <div className="stat-card red">
            <div className="stat-icon" style={{background:'rgba(239,68,68,0.12)'}}><MdPayment size={22} color="#ef4444"/></div>
            <div className="stat-info">
              <div className="stat-value">₹{parseFloat(summary.overdue_amount||0).toLocaleString()}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Records */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--bg-border)' }}>
          <span className="card-title">Fee Records</span>
        </div>
        <div className="table-wrapper" style={{ border:'none' }}>
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Description</th>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.length ? fees.map(f => {
                const balance = (parseFloat(f.amount) - parseFloat(f.amount_paid||0)).toFixed(2);
                const isOverdue = new Date(new Date(f.due_date).setHours(23, 59, 59, 999)) < new Date() && f.status !== 'paid' && f.status !== 'waived';
                return (
                  <tr key={f.id}>
                    <td>
                      <span className="badge badge-primary" style={{textTransform:'capitalize'}}>{f.fee_type}</span>
                    </td>
                    <td style={{fontSize:13,color:'var(--text-secondary)'}}>{f.description||'—'}</td>
                    <td style={{fontSize:13}}>{f.academic_year}</td>
                    <td style={{fontSize:13}}>{f.semester ? `Sem ${f.semester}` : 'All'}</td>
                    <td className="fw-600">₹{parseFloat(f.amount).toLocaleString()}</td>
                    <td style={{color:'var(--success)'}}>₹{parseFloat(f.amount_paid||0).toLocaleString()}</td>
                    <td style={{color: parseFloat(balance)>0?'var(--danger)':'var(--success)', fontWeight:600}}>
                      ₹{balance}
                    </td>
                    <td style={{fontSize:13,color:isOverdue?'var(--danger)':'var(--text-muted)'}}>
                      {new Date(f.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      {isOverdue && <span style={{fontSize:10,display:'block',fontWeight:600}}>OVERDUE</span>}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[f.status]||'badge-muted'}`}>{f.status}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <MdReceipt className="empty-state-icon"/>
                    <p>No fee records found</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {fees.length > 0 && (
          <div style={{ padding:'12px 20px', borderTop:'1px solid var(--bg-border)', fontSize:12, color:'var(--text-muted)' }}>
            Contact the accounts office to make a payment. Bring your fee ID and a valid photo ID.
          </div>
        )}
      </div>
    </div>
  );
}
