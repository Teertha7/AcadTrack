import { useState, useEffect, useRef } from 'react';
import { courseMaterialsAPI } from '../../api/endpoints';
import { BASE_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import {
  MdUpload, MdDelete, MdDescription, MdAssignment, MdLibraryBooks,
  MdScience, MdFolder, MdDownload, MdClose, MdInsertDriveFile,
} from 'react-icons/md';

const TYPE_META = {
  lecture:    { label: 'Lecture',    icon: <MdDescription />,  color: 'var(--primary-light)',  bg: 'var(--primary-bg)' },
  assignment: { label: 'Assignment', icon: <MdAssignment />,   color: 'var(--warning)',        bg: 'var(--warning-bg)' },
  reference:  { label: 'Reference',  icon: <MdLibraryBooks />, color: 'var(--info)',           bg: 'var(--info-bg)' },
  lab:        { label: 'Lab',        icon: <MdScience />,      color: 'var(--success)',        bg: 'var(--success-bg)' },
  other:      { label: 'Other',      icon: <MdFolder />,       color: 'var(--text-muted)',     bg: 'var(--bg-elevated)' },
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
});

export default function CourseMaterialsPanel({ course, canUpload = false }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', material_type: 'lecture', file: null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await courseMaterialsAPI.getMaterials(course.id);
      setMaterials(res.data.data || []);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [course.id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.file) { toast.error('Please select a file'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    const fd = new FormData();
    fd.append('file', form.file);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('material_type', form.material_type);

    setUploading(true);
    try {
      await courseMaterialsAPI.upload(course.id, fd);
      toast.success('Material uploaded successfully');
      setShowUpload(false);
      setForm({ title: '', description: '', material_type: 'lecture', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete "${material.title}"?`)) return;
    setDeleting(material.id);
    try {
      await courseMaterialsAPI.remove(course.id, material.id);
      toast.success('Material deleted');
      setMaterials(prev => prev.filter(m => m.id !== material.id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // Group materials by type
  const grouped = materials.reduce((acc, m) => {
    const t = m.material_type || 'other';
    if (!acc[t]) acc[t] = [];
    acc[t].push(m);
    return acc;
  }, {});
  const typeOrder = ['lecture', 'assignment', 'reference', 'lab', 'other'];

  return (
    <div>
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 0, padding: '20px 24px', borderBottom: '1px solid var(--bg-border)' }}>
        <div>
          <span className="card-title">Course Materials</span>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {materials.length} file{materials.length !== 1 ? 's' : ''} available
          </p>
        </div>
        {canUpload && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
            <MdUpload size={16} /> Upload Material
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">📎 Upload Course Material</span>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowUpload(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title <span>*</span></label>
                  <input
                    className="form-control"
                    placeholder="e.g. Lecture 1 - Introduction to OS"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-control"
                    value={form.material_type}
                    onChange={e => setForm(p => ({ ...p, material_type: e.target.value }))}
                  >
                    {Object.entries(TYPE_META).map(([v, m]) => (
                      <option key={v} value={v}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Optional short description..."
                    value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: 60 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">File <span>*</span></label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    style={{ cursor: 'pointer' }}
                    accept=".pdf"
                    onChange={e => setForm(p => ({ ...p, file: e.target.files[0] || null }))}
                    required
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Accepted: PDF (max 10 MB)
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading…' : <><MdUpload size={16} /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div style={{ padding: '16px 24px 24px' }}>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : materials.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 200 }}>
            <MdInsertDriveFile className="empty-state-icon" />
            <p>{canUpload ? 'No materials uploaded yet. Click "Upload Material" to add one.' : 'No materials available for this course yet.'}</p>
          </div>
        ) : (
          <>
            {typeOrder.filter(t => grouped[t]?.length).map(type => {
              const meta = TYPE_META[type];
              return (
                <div key={type} style={{ marginBottom: 24 }}>
                  {/* Section header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginBottom: 10, paddingBottom: 8,
                    borderBottom: '1px solid var(--bg-border)',
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 6, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: meta.bg, color: meta.color, fontSize: 16,
                    }}>{meta.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {meta.label}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                      {grouped[type].length} file{grouped[type].length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Material rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {grouped[type].map(m => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--bg-border)',
                        transition: 'var(--transition)',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bg-border)'}
                      >
                        {/* File icon */}
                        <div style={{
                          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                          background: meta.bg, color: meta.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                        }}>
                          <MdInsertDriveFile />
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {m.title}
                          </div>
                          {m.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.description}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                            <span>📁 {m.file_name}</span>
                            <span>📦 {formatSize(m.file_size)}</span>
                            <span>📅 {formatDate(m.created_at)}</span>
                            {canUpload && <span>👤 {m.uploaded_by_name}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <a
                            href={`${BASE_URL}/uploads/course_materials/${m.file_path.split(/[\\/]/).pop()}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            title="Download"
                          >
                            <MdDownload size={15} /> Download
                          </a>
                          {canUpload && (
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDelete(m)}
                              disabled={deleting === m.id}
                              title="Delete"
                            >
                              {deleting === m.id ? '…' : <MdDelete size={15} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
