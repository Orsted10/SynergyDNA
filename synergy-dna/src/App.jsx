import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, Users, Briefcase, BookmarkCheck, Trash2, TrendingUp, Award, BarChart2, X } from 'lucide-react';
import CandidatePipeline from './components/CandidatePipeline';

const STAGE_CONFIG = {
  Screening: { color: '#fef3c7', text: '#92400e', badge: '#fbbf24' },
  Interview: { color: '#e0e7ff', text: '#3730a3', badge: '#6366f1' },
  Hired: { color: '#dcfce7', text: '#166534', badge: '#22c55e' },
};

function PipelineCard({ c, onClick, onDelete, onMoveBack }) {
  const cfg = STAGE_CONFIG[c.status] || {};
  const rec = c.ai_recommendation || '';
  return (
    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div onClick={onClick}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h4 style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.name}</h4>
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: c.compatibility_index_score >= 85 ? '#166534' : c.compatibility_index_score >= 70 ? '#92400e' : '#991b1b' }}>
            {c.compatibility_index_score}
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>{c.job_title}</p>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: rec === 'STRONG HIRE' ? '#dcfce7' : rec === 'REJECT' ? '#fee2e2' : '#fef3c7', color: rec === 'STRONG HIRE' ? '#166534' : rec === 'REJECT' ? '#991b1b' : '#92400e' }}>
          {rec}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
        {onMoveBack && (
          <button onClick={e => { e.stopPropagation(); onMoveBack(c); }} style={{ fontSize: '0.65rem', padding: '3px 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', color: '#64748b' }}>
            ← Move Back
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(c); }} style={{ background: '#fee2e2', border: 'none', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Trash2 size={10} /> Remove
        </button>
      </div>
    </div>
  );
}

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedCandidates, setSavedCandidates] = useState(() => {
    const saved = localStorage.getItem('ats_pipeline');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('requisitions');
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    axios.get('/api/jobs').then(res => {
      setJobs(res.data);
      if (res.data.length > 0) setSelectedJob(res.data[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const persist = (newState) => {
    localStorage.setItem('ats_pipeline', JSON.stringify(newState));
    setSavedCandidates(newState);
  };

  const handleUpdateCandidateState = (candidate, newStatus) => {
    const updated = { ...candidate, status: newStatus };
    setSavedCandidates(prev => {
      const exists = prev.find(c => c.candidate_id === candidate.candidate_id);
      const next = exists ? prev.map(c => c.candidate_id === candidate.candidate_id ? updated : c) : [...prev, updated];
      localStorage.setItem('ats_pipeline', JSON.stringify(next));
      return next;
    });
  };

  const handleDelete = (candidate) => {
    setDeleteConfirm(candidate);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const next = savedCandidates.filter(c => c.candidate_id !== deleteConfirm.candidate_id);
    persist(next);
    setDeleteConfirm(null);
    if (viewingCandidate?.candidate_id === deleteConfirm.candidate_id) setViewingCandidate(null);
  };

  const handleMoveBack = (candidate) => {
    const stages = ['Sourced', 'Screening', 'Interview', 'Hired'];
    const idx = stages.indexOf(candidate.status);
    if (idx <= 0) return;
    handleUpdateCandidateState(candidate, stages[idx - 1]);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear entire pipeline? This cannot be undone.')) {
      persist([]);
      setViewingCandidate(null);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <h2 className="text-xl font-semibold">Loading ATS Dashboard...</h2>
    </div>
  );

  const screeningCands = savedCandidates.filter(c => c.status === 'Screening');
  const interviewCands = savedCandidates.filter(c => c.status === 'Interview');
  const hiredCands = savedCandidates.filter(c => c.status === 'Hired');
  const avgCIS = savedCandidates.length ? (savedCandidates.reduce((s, c) => s + c.compatibility_index_score, 0) / savedCandidates.length).toFixed(1) : '—';
  const strongHires = savedCandidates.filter(c => c.ai_recommendation === 'STRONG HIRE').length;

  const searchResults = searchQuery.length > 1
    ? savedCandidates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.job_title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const renderPipelineCol = (label, cands, badgeStyle) => (
    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>{label}</h3>
        <span style={{ fontWeight: 800, fontSize: '0.75rem', padding: '2px 10px', borderRadius: '20px', ...badgeStyle }}>{cands.length}</span>
      </div>
      {cands.map(c => (
        <PipelineCard
          key={c.candidate_id}
          c={c}
          onClick={() => setViewingCandidate(c)}
          onDelete={handleDelete}
          onMoveBack={label !== 'Screening' ? handleMoveBack : null}
        />
      ))}
      {cands.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No candidates here yet.</p>}
    </div>
  );

  return (
    <>
      <header className="enterprise-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>SynergyDNA</span>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Enterprise ATS</span>
          {savedCandidates.length > 0 && (
            <span style={{ background: '#4f46e5', color: 'white', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700 }}>
              {savedCandidates.length} Active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('requisitions')} style={{ background: activeTab === 'requisitions' ? '#e2e8f0' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Briefcase size={15} /> Open Jobs
          </button>
          <button onClick={() => setActiveTab('saved')} style={{ background: activeTab === 'saved' ? '#e2e8f0' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <BookmarkCheck size={15} /> Pipeline ({savedCandidates.length})
          </button>
          <button onClick={() => setShowSearch(s => !s)} style={{ background: showSearch ? '#e2e8f0' : '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Search size={15} /> Search
          </button>
        </div>
      </header>

      {showSearch && (
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 100 }}>
          <Search size={16} color="#94a3b8" />
          <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name or role across all pipeline stages..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.875rem', color: '#1e293b' }} />
          {searchResults.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {searchResults.map(c => (
                <button key={c.candidate_id} onClick={() => { setViewingCandidate(c); setShowSearch(false); setSearchQuery(''); }}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                  {c.name} <span style={{ color: '#94a3b8' }}>({c.status})</span>
                </button>
              ))}
            </div>
          )}
          {searchQuery.length > 1 && searchResults.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No results found</span>
          )}
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16}/></button>
        </div>
      )}

      <div className="app-container" style={{ gridTemplateColumns: activeTab === 'requisitions' ? '300px 1fr' : '1fr' }}>
        {activeTab === 'requisitions' ? (
          <>
            <aside className="panel fade-in">
              <div className="panel-header">
                <h2 className="panel-title"><Building2 size={18} /> Open Requisitions</h2>
              </div>
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg,#f8fafc,#eef2ff)' }}>
                <h3 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Pipeline Analytics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {[
                    { label: 'In Pipeline', val: savedCandidates.length, icon: <Users size={12}/>, color: '#4f46e5' },
                    { label: 'Strong Hires', val: strongHires, icon: <Award size={12}/>, color: '#059669' },
                    { label: 'Avg CIS', val: avgCIS, icon: <TrendingUp size={12}/>, color: '#f59e0b' },
                    { label: 'Hired', val: hiredCands.length, icon: <BarChart2 size={12}/>, color: '#8b5cf6' },
                  ].map(({ label, val, icon, color }) => (
                    <div key={label} style={{ background: 'white', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color, marginBottom: '2px' }}>{icon}<span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span></div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[['Sourced', savedCandidates.length, '#e0e7ff', '#4338ca'], ['Screening', screeningCands.length, '#fef3c7', '#d97706'], ['Interview', interviewCands.length, '#dbeafe', '#1d4ed8'], ['Hired', hiredCands.length, '#dcfce7', '#166534']].map(([l, n, bg, tc]) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center', background: bg, padding: '0.4rem 0.2rem', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: tc }}>{n}</div>
                      <div style={{ fontSize: '0.55rem', fontWeight: 700, color: tc, textTransform: 'uppercase' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
                <div className="pipeline-list" style={{ padding: '1rem', gap: '0.5rem' }}>
                  {jobs.map((job) => (
                    <div key={job.job_id} className={`pipeline-item ${selectedJob?.job_id === job.job_id ? 'active' : ''}`}
                      onClick={() => setSelectedJob(job)} style={{ padding: '1rem', borderRadius: '6px' }}>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: selectedJob?.job_id === job.job_id ? 'var(--accent-indigo)' : 'var(--text-primary)' }}>{job.job_title}</h3>
                        <p className="text-xs text-secondary">{job.company_name} • {job.location}</p>
                        <span style={{ fontSize: '0.6rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', marginTop: '4px', display: 'inline-block', color: '#64748b' }}>{job.company_size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="fade-in">
              {selectedJob ? (
                <CandidatePipeline job={selectedJob} onUpdateCandidate={handleUpdateCandidateState} savedCandidates={savedCandidates} />
              ) : (
                <div className="panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>Select a requisition to view candidates</h3>
                  </div>
                </div>
              )}
            </main>
          </>
        ) : (
          <main className="fade-in panel" style={{ padding: '2rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkCheck color="#4f46e5" /> Global Candidate Pipeline
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', marginLeft: '0.5rem' }}>
                  {savedCandidates.length} candidates tracked
                </span>
              </h2>
              {savedCandidates.length > 0 && (
                <button onClick={handleClearAll} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={14} /> Clear All Pipeline
                </button>
              )}
            </div>

            {/* Summary stats bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total in Pipeline', val: savedCandidates.length, color: '#4f46e5', bg: '#eef2ff' },
                { label: 'Strong Hire Recs', val: strongHires, color: '#059669', bg: '#f0fdf4' },
                { label: 'Average CIS Score', val: avgCIS, color: '#d97706', bg: '#fffbeb' },
                { label: 'Conversion Rate', val: savedCandidates.length ? `${Math.round((hiredCands.length / savedCandidates.length) * 100)}%` : '0%', color: '#7c3aed', bg: '#f5f3ff' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} style={{ background: bg, padding: '1.25rem', borderRadius: '10px', border: `1px solid ${color}22` }}>
                  <div style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              {renderPipelineCol('Screening', screeningCands, { background: '#fef3c7', color: '#92400e' })}
              {renderPipelineCol('Interview', interviewCands, { background: '#dbeafe', color: '#1d4ed8' })}
              {renderPipelineCol('Hired', hiredCands, { background: '#dcfce7', color: '#166534' })}
            </div>
          </main>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trash2 color="#ef4444" size={20}/> Remove Candidate</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Remove <strong>{deleteConfirm.name}</strong> from the pipeline? This will permanently delete their profile and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={confirmDelete} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 700 }}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate View Modal Overlay */}
      {viewingCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '1200px', height: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{viewingCandidate.name}</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{viewingCandidate.job_title} · Status: <strong>{viewingCandidate.status}</strong></div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => handleDelete(viewingCandidate)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={14}/> Remove from Pipeline
                </button>
                <button onClick={() => setViewingCandidate(null)} style={{ background: '#1e293b', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>✕ Close</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <CandidatePipeline
                key={`modal-${viewingCandidate.candidate_id}`}
                job={jobs.find(j => j.job_title === viewingCandidate.job_title) || { job_id: 'view', job_title: viewingCandidate.job_title, salary: '120000', company_name: 'Tech Corp', location: 'India' }}
                onUpdateCandidate={handleUpdateCandidateState}
                savedCandidates={[viewingCandidate]}
                overrideCandidateId={viewingCandidate.candidate_id}
                isReviewMode={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
