import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Search, Users, Briefcase, BookmarkCheck } from 'lucide-react';
import CandidatePipeline from './components/CandidatePipeline';

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Global ATS State
  const [savedCandidates, setSavedCandidates] = useState(() => {
    const saved = localStorage.getItem('ats_pipeline');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState('requisitions'); // 'requisitions' | 'saved'
  const [viewingCandidate, setViewingCandidate] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/api/jobs');
        setJobs(res.data);
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleUpdateCandidateState = (candidate, newStatus) => {
    const updatedCandidate = { ...candidate, status: newStatus };
    
    setSavedCandidates(prev => {
      let newState = [];
      const exists = prev.find(c => c.candidate_id === candidate.candidate_id);
      if (exists) {
        newState = prev.map(c => c.candidate_id === candidate.candidate_id ? updatedCandidate : c);
      } else {
        newState = [...prev, updatedCandidate];
      }
      localStorage.setItem('ats_pipeline', JSON.stringify(newState));
      return newState;
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2 className="text-xl font-semibold">Loading ATS Dashboard...</h2>
      </div>
    );
  }

  // Filter saved candidates by status for the Saved view
  const screeningCands = savedCandidates.filter(c => c.status === 'Screening');
  const interviewCands = savedCandidates.filter(c => c.status === 'Interview');
  const hiredCands = savedCandidates.filter(c => c.status === 'Hired');

  return (
    <>
      <header className="enterprise-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} color="var(--accent-indigo)" />
          <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>SynergyDNA</span>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Enterprise ATS</span>
        </div>
        <div className="text-sm font-medium text-secondary" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setActiveTab('requisitions')}
              style={{ background: activeTab === 'requisitions' ? '#e2e8f0' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Briefcase size={16} /> Open Jobs
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              style={{ background: activeTab === 'saved' ? '#e2e8f0' : 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <BookmarkCheck size={16} /> My Pipeline ({savedCandidates.length})
            </button>
          </div>
          <div style={{ padding: '0.4rem 1rem', background: '#f1f5f9', borderRadius: '4px', display: 'flex', gap: '0.5rem' }}>
            <Search size={16} /> Search ATS...
          </div>
        </div>
      </header>

      <div className="app-container" style={{ gridTemplateColumns: activeTab === 'requisitions' ? '300px 1fr' : '1fr' }}>
        
        {activeTab === 'requisitions' ? (
          <>
            <aside className="panel fade-in">
              <div className="panel-header">
                <h2 className="panel-title">
                  <Building2 size={18} /> Open Requisitions
                </h2>
              </div>
              
              {/* Analytics Funnel */}
              <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <h3 className="text-xs font-bold text-secondary uppercase mb-3">Pipeline Conversion Funnel</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.25rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', background: '#e0e7ff', padding: '0.5rem', borderRadius: '4px' }}>
                    <div className="text-sm font-bold text-indigo-700">{screeningCands.length + interviewCands.length + hiredCands.length}</div>
                    <div className="text-[10px] uppercase text-indigo-600 font-semibold">Sourced</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: '#fef3c7', padding: '0.5rem', borderRadius: '4px' }}>
                    <div className="text-sm font-bold text-amber-700">{interviewCands.length + hiredCands.length}</div>
                    <div className="text-[10px] uppercase text-amber-600 font-semibold">Screened</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>
                    <div className="text-sm font-bold text-green-700">{hiredCands.length}</div>
                    <div className="text-[10px] uppercase text-green-600 font-semibold">Hired</div>
                  </div>
                </div>
              </div>
              
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                <div className="pipeline-list" style={{ padding: '1rem', gap: '0.5rem' }}>
                  {jobs.map((job) => (
                    <div 
                      key={job.job_id}
                      className={`pipeline-item ${selectedJob?.job_id === job.job_id ? 'active' : ''}`}
                      onClick={() => setSelectedJob(job)}
                      style={{ padding: '1rem', borderRadius: '6px' }}
                    >
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: selectedJob?.job_id === job.job_id ? 'var(--accent-indigo)' : 'var(--text-primary)' }}>
                          {job.job_title}
                        </h3>
                        <p className="text-xs text-secondary">{job.company_name} • {job.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="fade-in">
              {selectedJob ? (
                <CandidatePipeline 
                  job={selectedJob} 
                  onUpdateCandidate={handleUpdateCandidateState}
                  savedCandidates={savedCandidates}
                />
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
          <main className="fade-in panel" style={{ padding: '2rem' }}>
            <h2 className="text-2xl font-bold" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookmarkCheck /> Global Candidate Pipeline
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
              
              {/* Screening Column */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 className="text-lg font-bold mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Screening <span className="badge">{screeningCands.length}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {screeningCands.map(c => (
                    <div 
                      key={c.candidate_id} 
                      onClick={() => setViewingCandidate(c)}
                      style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <h4 className="font-bold">{c.name}</h4>
                      <p className="text-xs text-secondary">{c.job_title}</p>
                      <div className="text-xs mt-2" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>CIS: {c.compatibility_index_score}</div>
                    </div>
                  ))}
                  {screeningCands.length === 0 && <p className="text-sm text-secondary italic">No candidates in screening.</p>}
                </div>
              </div>

              {/* Interview Column */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 className="text-lg font-bold mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Interview <span className="badge badge-blue">{interviewCands.length}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {interviewCands.map(c => (
                    <div 
                      key={c.candidate_id} 
                      onClick={() => setViewingCandidate(c)}
                      style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <h4 className="font-bold">{c.name}</h4>
                      <p className="text-xs text-secondary">{c.job_title}</p>
                      <div className="text-xs mt-2" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>CIS: {c.compatibility_index_score}</div>
                    </div>
                  ))}
                  {interviewCands.length === 0 && <p className="text-sm text-secondary italic">No candidates in interview.</p>}
                </div>
              </div>

              {/* Hired Column */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 className="text-lg font-bold mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Hired <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>{hiredCands.length}</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hiredCands.map(c => (
                    <div 
                      key={c.candidate_id} 
                      onClick={() => setViewingCandidate(c)}
                      style={{ background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <h4 className="font-bold">{c.name}</h4>
                      <p className="text-xs text-secondary">{c.job_title}</p>
                      <div className="text-xs mt-2" style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>CIS: {c.compatibility_index_score}</div>
                    </div>
                  ))}
                  {hiredCands.length === 0 && <p className="text-sm text-secondary italic">No hired candidates.</p>}
                </div>
              </div>

            </div>
          </main>
        )}
      </div>

      {/* Candidate View Modal Overlay */}
      {viewingCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '1200px', height: '100%', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 className="text-xl font-bold">Reviewing Saved Profile</h2>
              <button onClick={() => setViewingCandidate(null)} className="btn btn-primary" style={{ background: '#ef4444' }}>Close Viewer</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
               <CandidatePipeline 
                  key={`modal-${viewingCandidate.candidate_id}`}
                  job={jobs.find(j => j.job_title === viewingCandidate.job_title) || { job_id: 'view', job_title: viewingCandidate.job_title, salary: '$120,000' }} 
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
