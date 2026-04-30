import { useState } from 'react';
import { MapPin, Building2, CircleDollarSign, Target } from 'lucide-react';
import DNARadarChart from './DNARadarChart';
import SHAPExplainer from './SHAPExplainer';

const MatchPipeline = ({ matches, candidate }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!matches || matches.length === 0) return null;

  const activeMatch = matches[activeIndex];

  const getCisClass = (score) => {
    if (score >= 85) return 'cis-high';
    if (score >= 70) return 'cis-medium';
    return 'cis-low';
  };

  return (
    <div className="panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="panel-title">
          <Target size={18} /> Role Matching Pipeline
        </h2>
        <span className="badge badge-blue">Found {matches.length} Matches</span>
      </div>

      <div className="panel-body" style={{ padding: 0 }}>
        <div style={{ display: 'flex', height: '800px' }}>
          
          {/* Left Column: Pipeline List */}
          <div style={{ width: '40%', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '1.5rem', background: '#f8fafc' }}>
            <div className="pipeline-list">
              {matches.map((match, idx) => (
                <div 
                  key={match.job_id} 
                  className={`pipeline-item ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <div style={{ flex: 1 }}>
                    <h3 className="text-base font-bold" style={{ color: idx === activeIndex ? 'var(--accent-indigo)' : 'var(--text-primary)' }}>
                      {match.job_title}
                    </h3>
                    <p className="text-sm font-medium text-secondary">{match.company_name}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <span className="badge">{match.company_type}</span>
                    </div>
                  </div>
                  <div className={`cis-circle ${getCisClass(match.compatibility_index_score)}`}>
                    {Math.round(match.compatibility_index_score)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Deep Details */}
          <div style={{ width: '60%', padding: '2rem', overflowY: 'auto' }}>
            {activeMatch && (
              <div className="fade-in" key={activeMatch.job_id}>
                
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h1 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>{activeMatch.job_title}</h1>
                      <h2 className="text-lg text-secondary font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={20} /> {activeMatch.company_name}
                      </h2>
                    </div>
                    <button className="btn btn-primary">Proceed to Next Step</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                    <div className="text-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} /> {activeMatch.location}
                    </div>
                    <div className="text-sm text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CircleDollarSign size={16} /> {activeMatch.salary}
                    </div>
                  </div>
                </div>

                <div className="match-details-grid">
                  <div className="panel" style={{ boxShadow: 'none' }}>
                    <div className="panel-header" style={{ padding: '1rem' }}>
                      <h3 className="font-semibold text-sm">4-D Career DNA Alignment</h3>
                    </div>
                    <div className="panel-body" style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <DNARadarChart match={activeMatch} />
                    </div>
                  </div>

                  <div className="panel" style={{ boxShadow: 'none' }}>
                    <div className="panel-header" style={{ padding: '1rem' }}>
                      <h3 className="font-semibold text-sm">Explainable AI (SHAP)</h3>
                    </div>
                    <div className="panel-body" style={{ padding: '1rem' }}>
                      <SHAPExplainer drivers={activeMatch.top_drivers} risks={activeMatch.risk_flags} />
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPipeline;
