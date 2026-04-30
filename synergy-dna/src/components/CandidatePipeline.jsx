import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, ArrowRight, CheckCircle, FileText, Calendar, DollarSign, BrainCircuit, Bot, Printer } from 'lucide-react';
import DNARadarChart from './DNARadarChart';
import SHAPExplainer from './SHAPExplainer';
import CandidateProfile from './CandidateProfile';
import AlgorithmProof from './AlgorithmProof';
import OfferLetterModal from './OfferLetterModal';
import NegotiationAgent from './NegotiationAgent';

const CandidatePipeline = ({ job, onUpdateCandidate, savedCandidates, overrideCandidateId, isReviewMode }) => {
  const [candidates, setCandidates] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOfferLetter, setShowOfferLetter] = useState(false);
  const [showNegotiationAgent, setShowNegotiationAgent] = useState(false);

  useEffect(() => {
    if (isReviewMode && savedCandidates && savedCandidates.length > 0) {
      setCandidates(savedCandidates);
      setActiveIdx(0);
      setLoading(false);
      return;
    }

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/jobs/${job.job_id}/candidates`);
        
        // Merge with globally saved candidates for this job to preserve their status
        const merged = res.data.map(c => {
          const saved = savedCandidates.find(sc => sc.candidate_id === c.candidate_id);
          if (saved) return saved;
          return { ...c, job_title: job.job_title };
        });
        
        setCandidates(merged);
        
        if (overrideCandidateId) {
          const idx = merged.findIndex(c => c.candidate_id === overrideCandidateId);
          setActiveIdx(idx !== -1 ? idx : 0);
        } else {
          setActiveIdx(0);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (job) fetchCandidates();
  }, [job]);

  if (loading) {
    return (
      <div className="panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (candidates.length === 0) return null;

  const activeCandidate = candidates[activeIdx];

  const handleNextStep = () => {
    const currentStatus = activeCandidate.status;
    let newStatus = 'Sourced';
    if (currentStatus === 'Sourced') newStatus = 'Screening';
    else if (currentStatus === 'Screening') newStatus = 'Interview';
    else if (currentStatus === 'Interview') newStatus = 'Hired';
    else return;

    // Update local state
    const newCands = [...candidates];
    newCands[activeIdx].status = newStatus;
    setCandidates(newCands);
    
    // Update global state
    onUpdateCandidate(activeCandidate, newStatus);
  };

  const getCisClass = (score) => {
    if (score >= 85) return 'cis-high';
    if (score >= 70) return 'cis-medium';
    return 'cis-low';
  };

  // -------------------------------------------------------------
  // DYNAMIC DASHBOARDS
  // -------------------------------------------------------------

  const renderSourcedDashboard = () => (
    <div className="match-details-grid fade-in" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="panel" style={{ boxShadow: 'none' }}>
          <div className="panel-header" style={{ padding: '1rem' }}>
            <h3 className="font-semibold text-sm">4-D DNA vs {job.job_title}</h3>
          </div>
          <div className="panel-body" style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
            <DNARadarChart match={activeCandidate.math_proof} />
          </div>
        </div>

        <div className="panel" style={{ boxShadow: 'none' }}>
          <div className="panel-header" style={{ padding: '1rem' }}>
            <h3 className="font-semibold text-sm">AI SHAP Explainability</h3>
          </div>
          <div className="panel-body" style={{ padding: '1rem' }}>
            <SHAPExplainer drivers={activeCandidate.top_drivers} risks={activeCandidate.risks} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <CandidateProfile candidate={activeCandidate} />
        <AlgorithmProof proof={activeCandidate.math_proof} />
      </div>
    </div>
  );

  const renderScreeningDashboard = () => {
    const isExtrovert = activeCandidate.personality.extraversion > 60;
    const isHighOpenness = activeCandidate.personality.openness > 70;
    
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="panel" style={{ boxShadow: 'none' }}>
          <div className="panel-header" style={{ padding: '1.5rem', background: '#f8fafc' }}>
            <h3 className="font-bold text-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit color="var(--accent-indigo)"/> AI Behavioral Screening Generator
            </h3>
            <p className="text-sm text-secondary mt-1">Generated based on SDS Big 5 Profile for {job.job_title}</p>
          </div>
          <div className="panel-body" style={{ padding: '1.5rem' }}>
            <h4 className="font-bold mb-2">Recommended Phone Screen Questions:</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0 }}>
              <li style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px' }}>
                <span className="badge badge-blue mb-2">Technical Baseline</span>
                <p><strong>"Can you walk me through your experience with the {Object.keys(activeCandidate.skills)[0]} stack?"</strong></p>
                <p className="text-xs text-secondary mt-1">Goal: Verify their {activeCandidate.skills[Object.keys(activeCandidate.skills)[0]]}/5 claimed proficiency.</p>
              </li>
              <li style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px' }}>
                <span className="badge badge-blue mb-2">Behavioral: {isExtrovert ? 'Team Dynamics' : 'Independent Execution'}</span>
                <p><strong>{isExtrovert ? '"You have a highly collaborative profile. Describe a time you led a cross-functional technical initiative."' : '"You excel in focused execution. Describe a complex technical problem you solved independently."'}</strong></p>
                <p className="text-xs text-secondary mt-1">Goal: Assess how their natural working style fits the {job.company_type} environment.</p>
              </li>
              <li style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px' }}>
                <span className="badge badge-blue mb-2">Adaptability</span>
                <p><strong>{isHighOpenness ? '"Since you enjoy novel challenges, how do you handle legacy codebases or strict compliance requirements?"' : '"How do you approach a project where the requirements are completely ambiguous?"'}</strong></p>
                <p className="text-xs text-secondary mt-1">Goal: Evaluate adaptability vs structure preference.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderInterviewDashboard = () => (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel" style={{ boxShadow: 'none' }}>
        <div className="panel-header" style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <h3 className="font-bold text-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText color="var(--accent-indigo)"/> Interview Scorecard Rubric
          </h3>
          <p className="text-sm text-secondary mt-1">Input scores from the hiring panel.</p>
        </div>
        <div className="panel-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="text-sm font-bold block mb-2">System Design (1-5)</label>
              <input type="range" min="1" max="5" defaultValue="4" style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'gray' }}><span>Poor</span><span>Excellent</span></div>
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Code Quality (1-5)</label>
              <input type="range" min="1" max="5" defaultValue="5" style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'gray' }}><span>Poor</span><span>Excellent</span></div>
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Culture Fit (1-5)</label>
              <input type="range" min="1" max="5" defaultValue="4" style={{ width: '100%' }} />  
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'gray' }}><span>Poor</span><span>Excellent</span></div>
            </div>
            <div>
              <label className="text-sm font-bold block mb-2">Communication (1-5)</label>
              <input type="range" min="1" max="5" defaultValue="4" style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'gray' }}><span>Poor</span><span>Excellent</span></div>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <label className="text-sm font-bold block mb-2">Hiring Manager Notes</label>
            <textarea className="form-control" rows="4" placeholder="Enter interview feedback..." style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHiredDashboard = () => {
    // Generate a realistic Indian salary offer based on their tech score and the job's max salary string
    // Using PPP (Purchasing Power Parity) multiplier of ~₹25 to 1 USD for realistic Indian tech salaries
    const maxSalStr = job.salary.replace(/[^0-9]/g, '');
    const maxSalUsd = parseInt(maxSalStr) || 120000;
    const baseOfferInr = Math.floor(maxSalUsd * 25 * (activeCandidate.math_proof.tech_score / 100));
    
    // Indian Currency Formatter (₹ XX,XX,XXX)
    const formatINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="panel" style={{ boxShadow: 'none', border: '2px solid #10b981' }}>
          <div className="panel-header" style={{ padding: '1.5rem', background: '#dcfce7', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle color="#166534" size={32} />
            <div>
              <h3 className="font-bold text-xl" style={{ color: '#166534' }}>Offer Accepted</h3>
              <p className="text-sm" style={{ color: '#166534' }}>{activeCandidate.name} has been hired for {job.job_title}.</p>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:'0.75rem' }}>
              <button className="btn" style={{ background:'white', color:'#7c3aed', border:'1px solid #7c3aed', display:'flex', alignItems:'center', gap:'0.5rem' }} onClick={() => setShowNegotiationAgent(true)}>
                <Bot size={16}/> AI Negotiator
              </button>
              <button className="btn btn-primary" style={{ background:'white', color:'#166534', border:'1px solid #166534', display:'flex', alignItems:'center', gap:'0.5rem' }} onClick={() => setShowOfferLetter(true)}>
                <FileText size={16}/> Generate Offer Letter
              </button>
            </div>
          </div>
          <div className="panel-body" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--secondary-color)' }}>
                  <DollarSign size={18}/> <span className="font-bold">Compensation Package (INR)</span>
                </div>
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatINR(baseOfferInr)}</div>
                <div className="text-sm text-secondary mt-1">Base Salary (Derived from Tech Score)</div>
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span className="text-sm">Sign-on Bonus</span>
                    <span className="text-sm font-bold">{formatINR(300000)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-sm">Equity / RSUs</span>
                    <span className="text-sm font-bold">{formatINR(1500000)} / 4yr</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>
                  <Calendar size={18}/> <span className="font-bold">Onboarding Checklist</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" defaultChecked /> Background Check Initiated</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" defaultChecked /> I-9 Verification Complete</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> IT Hardware Provisioning</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" /> Manager Welcome Email Sent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="panel-title">
          <Target size={18} /> ATS Pipeline: {job.job_title}
        </h2>
        <span className="badge badge-blue">{candidates.length} Ranked Matches</span>
      </div>

      <div className="panel-body" style={{ padding: 0, height: 'calc(100vh - 200px)', display: 'flex' }}>
        
        {/* Left Column: Candidate List (Hidden in Review Mode) */}
        {!isReviewMode && (
          <div style={{ width: '35%', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
            <div className="pipeline-list">
              {candidates.map((cand, idx) => (
                <div 
                  key={cand.candidate_id} 
                  className={`pipeline-item ${idx === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  <div style={{ flex: 1 }}>
                    <h3 className="text-base font-bold" style={{ color: idx === activeIdx ? 'var(--accent-indigo)' : 'var(--text-primary)' }}>
                      {cand.name}
                    </h3>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span className="badge" style={{
                        background: cand.status === 'Hired' ? '#dcfce7' : '',
                        color: cand.status === 'Hired' ? '#166534' : ''
                      }}>
                        {cand.status}
                      </span>
                    </div>
                  </div>
                  <div className={`cis-circle ${getCisClass(cand.compatibility_index_score)}`}>
                    {Math.round(cand.compatibility_index_score)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Dynamic Deep Details */}
        <div style={{ width: isReviewMode ? '100%' : '65%', padding: '2rem', overflowY: 'auto', background: '#ffffff' }}>
          {activeCandidate && (
            <div className="fade-in" key={`${activeCandidate.candidate_id}-${activeCandidate.status}`}>
              
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>{activeCandidate.name}</h1>
                    
                    {/* Compliance Badges */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span className="badge" style={{background: '#e0e7ff', color: '#4338ca', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                        <CheckCircle size={10} /> DPDPA 2023 Compliant
                      </span>
                      <span className="badge" style={{background: '#f1f5f9', color: 'gray', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                        PII Stripped for Scoring
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>
                        Right to be Forgotten
                      </span>
                    </div>

                    <h2 className="text-sm text-secondary font-medium" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge" style={{background: '#f1f5f9'}}>{activeCandidate.candidate_id}</span>
                      <span>Applying for: <strong>{job.job_title}</strong> at {job.company_name}</span>
                    </h2>
                  </div>
                  
                  {activeCandidate.status !== 'Hired' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn" style={{ background:'#f1f5f9', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'0.5rem' }} onClick={() => {
                        const w = window.open('','_blank');
                        const fmt = (n) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
                        const p = activeCandidate.math_proof || {};
                        w.document.write(`<!DOCTYPE html><html><head><title>SynergyDNA Dossier - ${activeCandidate.name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:40px;max-width:800px;margin:auto}.logo{font-size:22px;font-weight:800;color:#4f46e5;margin-bottom:4px}h1{font-size:22px;font-weight:800;margin:20px 0 8px}h3{font-size:14px;font-weight:700;margin:18px 0 8px;color:#4f46e5}p,li{font-size:13px;line-height:1.8;color:#334155}table{width:100%;border-collapse:collapse;margin:12px 0}th{background:#4f46e5;color:white;padding:8px 12px;text-align:left;font-size:12px}td{padding:8px 12px;font-size:12px;border-bottom:1px solid #e2e8f0}.green{background:#dcfce7;color:#166534;font-weight:700}.red{background:#fee2e2;color:#991b1b}.footer{margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}</style></head><body><div class="logo">SynergyDNA</div><div style="font-size:11px;color:#64748b">Career Soulmate Algorithm™ · Candidate Dossier</div><h1>${activeCandidate.name}</h1><p><strong>Role:</strong> ${job.job_title} at ${job.company_name} &nbsp;|&nbsp; <strong>CIS Score:</strong> ${activeCandidate.compatibility_index_score}/100 &nbsp;|&nbsp; <strong>ID:</strong> ${activeCandidate.candidate_id}</p><p><strong>AI Recommendation:</strong> ${activeCandidate.ai_recommendation}</p><h3>5-Dimensional Compatibility Breakdown</h3><table><tr><th>Dimension</th><th>Score</th><th>Weight</th><th>Contribution</th></tr><tr><td>Technical Fit</td><td>${p.tech_score||'—'}</td><td>30%</td><td>${((p.tech_score||0)*0.3).toFixed(1)}</td></tr><tr><td>Cultural Resonance</td><td>${p.cult_score||'—'}</td><td>25%</td><td>${((p.cult_score||0)*0.25).toFixed(1)}</td></tr><tr><td>Growth Alignment</td><td>${p.growth_score||'—'}</td><td>20%</td><td>${((p.growth_score||0)*0.2).toFixed(1)}</td></tr><tr><td>Chemistry Score</td><td>${p.chemistry_score||'—'}</td><td>15%</td><td>${((p.chemistry_score||0)*0.15).toFixed(1)}</td></tr><tr><td>Market Timing</td><td>${p.market_score||'—'}</td><td>10%</td><td>${((p.market_score||0)*0.1).toFixed(1)}</td></tr><tr class="green"><td><strong>TOTAL CIS</strong></td><td><strong>${activeCandidate.compatibility_index_score}</strong></td><td>100%</td><td><strong>${activeCandidate.compatibility_index_score}</strong></td></tr></table><h3>SHAP Positive Drivers</h3><ul>${(activeCandidate.top_drivers||[]).map(d=>`<li>${d}</li>`).join('')}</ul><h3>Risk Flags</h3><ul>${(activeCandidate.risks||[]).map(r=>`<li style="color:#991b1b">${r}</li>`).join('')}</ul><h3>SDS Big Five Personality</h3><table><tr><th>Trait</th><th>Score</th><th>Interpretation</th></tr>${Object.entries(activeCandidate.personality||{}).map(([k,v])=>`<tr><td style="text-transform:capitalize">${k}</td><td>${v.toFixed(1)}</td><td>${v>65?'High':v>40?'Moderate':'Low'}</td></tr>`).join('')}</table><div class="footer">Generated by SynergyDNA Enterprise ATS · DPDPA 2023 Compliant · ${new Date().toLocaleDateString('en-IN')}</div></body></html>`);
                        w.document.close(); setTimeout(()=>w.print(),500);
                      }}>
                        <Printer size={16}/> Export Dossier
                      </button>
                      <button className="btn btn-primary" onClick={handleNextStep}>
                        Move to {activeCandidate.status === 'Sourced' ? 'Screening' : activeCandidate.status === 'Screening' ? 'Interview' : 'Hired'} <ArrowRight size={16} style={{ marginLeft: '0.5rem' }}/>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* AI Recommendation Banner */}
                {activeCandidate.ai_recommendation && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    borderRadius: '6px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    background: activeCandidate.ai_recommendation === 'STRONG HIRE' ? '#dcfce7' : 
                                activeCandidate.ai_recommendation === 'REJECT' ? '#fee2e2' : '#fef3c7',
                    color: activeCandidate.ai_recommendation === 'STRONG HIRE' ? '#166534' : 
                           activeCandidate.ai_recommendation === 'REJECT' ? '#991b1b' : '#92400e'
                  }}>
                    <Target size={16} /> AI Recommendation: {activeCandidate.ai_recommendation}
                  </div>
                )}
                
                {/* Pipeline Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
                  
                  {['Sourced', 'Screening', 'Interview', 'Hired'].map((step, i) => {
                    const stages = ['Sourced', 'Screening', 'Interview', 'Hired'];
                    const currentIndex = stages.indexOf(activeCandidate.status);
                    const isCompleted = i <= currentIndex;
                    const isActive = i === currentIndex;
                    
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '25%' }}>
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: isActive ? 'var(--accent-indigo)' : (isCompleted ? '#10b981' : '#f1f5f9'),
                          border: `2px solid ${isCompleted || isActive ? 'transparent' : '#cbd5e1'}`,
                          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          {isCompleted && !isActive ? '✓' : i+1}
                        </div>
                        <span className="text-xs font-bold mt-1" style={{ color: isActive ? 'var(--accent-indigo)' : (isCompleted ? '#10b981' : 'gray') }}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RENDER THE CORRECT DASHBOARD STATE */}
              {activeCandidate.status === 'Sourced' && renderSourcedDashboard()}
              {activeCandidate.status === 'Screening' && renderScreeningDashboard()}
              {activeCandidate.status === 'Interview' && (
                <div>
                  {renderInterviewDashboard()}
                  <div style={{ marginTop:'1rem', padding:'1rem', background:'#f5f3ff', borderRadius:'8px', border:'1px solid #e9d5ff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontWeight:700, color:'#6d28d9', fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><Bot size={16}/> Year 3 Feature Preview</div>
                      <div style={{ fontSize:'0.75rem', color:'#7c3aed', marginTop:'2px' }}>Simulate the AI autonomous salary negotiation agent</div>
                    </div>
                    <button onClick={() => setShowNegotiationAgent(true)} style={{ background:'#7c3aed', color:'white', border:'none', borderRadius:'8px', padding:'0.6rem 1.25rem', fontWeight:700, cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <Bot size={16}/> Launch AI Negotiator
                    </button>
                  </div>
                </div>
              )}
              {activeCandidate.status === 'Hired' && renderHiredDashboard()}

            </div>
          )}
        </div>
      </div>
    </div>

    {showOfferLetter && activeCandidate && (
      <OfferLetterModal candidate={activeCandidate} job={job} onClose={() => setShowOfferLetter(false)} />
    )}
    {showNegotiationAgent && activeCandidate && (
      <NegotiationAgent candidate={activeCandidate} job={job} onClose={() => setShowNegotiationAgent(false)} />
    )}
  </>);
};

export default CandidatePipeline;
