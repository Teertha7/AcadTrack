import { useEffect, useState, useCallback } from 'react';
import { feesAPI, studentsAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';
import { MdAdd, MdPayment, MdSearch, MdReceipt } from 'react-icons/md';

const FEE_TYPES = ['tuition','hostel','library','lab','exam','other'];
const PAY_METHODS = ['cash','online','bank_transfer','cheque','upi'];
const STATUS_BADGE = { pending:'badge-warning', partial:'badge-info', paid:'badge-success', overdue:'badge-danger', waived:'badge-muted' };

const feeEmpty = { student_id:'', fee_type:'tuition', description:'', amount:'', due_date:'', academic_year:'2024-25', semester:'' };
const payEmpty = { fee_id:'', student_id:'', amount_paid:'', payment_method:'cash', transaction_ref:'', notes:'' };

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('fees');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'fee' | 'payment'
  const [feeForm, setFeeForm] = useState(feeEmpty);
  const [payForm, setPayForm] = useState(payEmpty);
  const [submitting, setSubmitting] = useState(false);
  const limit = 15;

  const loadFees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feesAPI.getAll({ page, limit, status: statusFilter||undefined, student_id: studentFilter||undefined });
      setFees(res.data.data || []); setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load fees'); }
    finally { setLoading(false); }
  }, [page, statusFilter, studentFilter]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feesAPI.getPayments({ page, limit, student_id: studentFilter||undefined });
      setPayments(res.data.data || []); setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [page, studentFilter]);

  useEffect(() => { tab==='fees'?loadFees():loadPayments(); }, [tab, loadFees, loadPayments]);
  useEffect(() => { studentsAPI.getAll({ limit: 500 }).then(r => setStudents(r.data.data || [])); }, []);

  const handleCreateFee = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await feesAPI.create({ ...feeForm, semester: feeForm.semester || null });
      toast.success('Fee record created!'); setModal(null); loadFees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const openPaymentModal = (fee) => {
    setPayForm({ fee_id: fee.id, student_id: fee.student_id, amount_paid: '', payment_method:'cash', transaction_ref:'', notes:'' });
    setModal('payment');
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await feesAPI.recordPayment(payForm);
      toast.success('Payment recorded!'); setModal(null); loadFees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const ff = (k,v) => setFeeForm(p=>({...p,[k]:v}));
  const pf = (k,v) => setPayForm(p=>({...p,[k]:v}));
  const totalPages = Math.ceil(total/limit);

  return (
    <div>
      <div className="page-header">
        <h1>Fees & Payments</h1>
        <p>Manage student fee records and payment collection</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {['fees','payments'].map(t=>(
          <button key={t} className={`btn ${tab===t?'btn-primary':'btn-secondary'}`} onClick={()=>{setTab(t);setPage(1);}}>
            {t==='fees'?<><MdReceipt size={16}/> Fee Records</>:<><MdPayment size={16}/> Payment History</>}
          </button>
        ))}
      </div>

      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select className="form-control" style={{width:'auto',minWidth:180}}
            value={studentFilter} onChange={e=>{setStudentFilter(e.target.value);setPage(1);}}>
            <option value="">All Students</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
          </select>
          {tab==='fees' && (
            <select className="form-control" style={{width:'auto',minWidth:130}}
              value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}>
              <option value="">All Status</option>
              {['pending','partial','paid','overdue','waived'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
        {tab==='fees' && (
          <button className="btn btn-primary" onClick={()=>setModal('fee')} id="add-fee-btn">
            <MdAdd size={18}/> Add Fee
          </button>
        )}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrapper" style={{border:'none'}}>
          {loading?<div className="loading-center"><div className="spinner"/></div>:(
            tab==='fees'?(
              <table>
                <thead><tr>
                  <th>Student</th><th>Fee Type</th><th>Amount</th><th>Paid</th><th>Balance</th>
                  <th>Due Date</th><th>Year</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {fees.length?fees.map(f=>{
                    const balance = (parseFloat(f.amount)-parseFloat(f.amount_paid||0)).toFixed(2);
                    return (
                      <tr key={f.id}>
                        <td>
                          <div className="fw-600" style={{fontSize:14}}>{f.student_name}</div>
                          <div style={{fontSize:11,color:'var(--text-muted)'}}>{f.roll_number}</div>
                        </td>
                        <td><span className="badge badge-primary">{f.fee_type}</span></td>
                        <td className="fw-600">₹{parseFloat(f.amount).toLocaleString()}</td>
                        <td style={{color:'var(--success)'}}>₹{parseFloat(f.amount_paid||0).toLocaleString()}</td>
                        <td style={{color:balance>0?'var(--danger)':'var(--success)'}}>₹{balance}</td>
                        <td style={{fontSize:13,color:'var(--text-muted)'}}>
                          {new Date(f.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </td>
                        <td style={{fontSize:13}}>{f.academic_year}</td>
                        <td><span className={`badge ${STATUS_BADGE[f.status]||'badge-muted'}`}>{f.status}</span></td>
                        <td>
                          {f.status!=='paid'&&f.status!=='waived'&&(
                            <button className="btn btn-success btn-sm" onClick={()=>openPaymentModal(f)} id={`pay-btn-${f.id}`}>
                              <MdPayment size={14}/> Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }):(
                    <tr><td colSpan={9}><div className="empty-state"><MdReceipt className="empty-state-icon"/><p>No fees found</p></div></td></tr>
                  )}
                </tbody>
              </table>
            ):(
              <table>
                <thead><tr>
                  <th>Student</th><th>Fee Type</th><th>Amount Paid</th><th>Method</th>
                  <th>Transaction Ref</th><th>Date</th><th>Received By</th>
                </tr></thead>
                <tbody>
                  {payments.length?payments.map(p=>(
                    <tr key={p.id}>
                      <td>
                        <div className="fw-600" style={{fontSize:14}}>{p.student_name}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{p.roll_number}</div>
                      </td>
                      <td><span className="badge badge-info">{p.fee_type}</span></td>
                      <td className="fw-600" style={{color:'var(--success)'}}>₹{parseFloat(p.amount_paid).toLocaleString()}</td>
                      <td><span className="badge badge-muted">{p.payment_method}</span></td>
                      <td style={{fontSize:12,color:'var(--text-muted)'}}>{p.transaction_ref||'—'}</td>
                      <td style={{fontSize:13,color:'var(--text-muted)'}}>
                        {new Date(p.payment_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td style={{fontSize:13}}>{p.received_by_name||'—'}</td>
                    </tr>
                  )):(
                    <tr><td colSpan={7}><div className="empty-state"><MdPayment className="empty-state-icon"/><p>No payments found</p></div></td></tr>
                  )}
                </tbody>
              </table>
            )
          )}
        </div>
        {!loading && total > 0 && (
          <div className="pagination">
            <span>Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} className={`page-btn${p===page?' active':''}`} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Fee Modal */}
      {modal==='fee' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Add Fee Record</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleCreateFee}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Student <span>*</span></label>
                    <select className="form-control" value={feeForm.student_id} onChange={e=>ff('student_id',e.target.value)} required>
                      <option value="">Select Student</option>
                      {students.map(s=><option key={s.id} value={s.id}>{s.full_name} — {s.roll_number}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fee Type <span>*</span></label>
                    <select className="form-control" value={feeForm.fee_type} onChange={e=>ff('fee_type',e.target.value)} required>
                      {FEE_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹) <span>*</span></label>
                    <input type="number" className="form-control" value={feeForm.amount}
                      onChange={e=>ff('amount',e.target.value)} required min={0} step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date <span>*</span></label>
                    <input type="date" className="form-control" value={feeForm.due_date}
                      onChange={e=>ff('due_date',e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Academic Year <span>*</span></label>
                    <input className="form-control" value={feeForm.academic_year}
                      onChange={e=>ff('academic_year',e.target.value)} required placeholder="2024-25" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select className="form-control" value={feeForm.semester} onChange={e=>ff('semester',e.target.value)}>
                      <option value="">N/A</option>
                      {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={feeForm.description} onChange={e=>ff('description',e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?'Saving…':'Create Fee Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {modal==='payment' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Record Payment</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={()=>setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount Paid (₹) <span>*</span></label>
                  <input type="number" className="form-control" value={payForm.amount_paid}
                    onChange={e=>pf('amount_paid',e.target.value)} required min={0.01} step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method <span>*</span></label>
                  <select className="form-control" value={payForm.payment_method} onChange={e=>pf('payment_method',e.target.value)} required>
                    {PAY_METHODS.map(m=><option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Transaction Reference</label>
                  <input className="form-control" value={payForm.transaction_ref}
                    onChange={e=>pf('transaction_ref',e.target.value)} placeholder="UTR / Cheque No." />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={payForm.notes}
                    onChange={e=>pf('notes',e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={submitting} id="confirm-payment-btn">
                  {submitting?'Processing…':'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
