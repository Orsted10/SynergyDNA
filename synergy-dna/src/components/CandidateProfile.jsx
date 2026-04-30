import { User, Activity, Code } from 'lucide-react';

const TraitBar = ({ label, value, max = 100, color = 'var(--accent-blue)' }) => {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : 0;
  const percentage = Math.min((safeVal / max) * 100, 100);
  const displayVal = max === 5 ? safeVal.toFixed(1) : Math.round(safeVal);

  return (
    <div className="trait-bar-container">
      <div className="trait-header text-sm">
        <span className="font-medium text-secondary">{label}</span>
        <span className="font-bold" style={{ color: max === 5 && safeVal >= 4 ? '#059669' : max === 5 && safeVal <= 2 ? '#ef4444' : 'inherit' }}>
          {displayVal}{max === 5 ? '/5' : ''}
        </span>
      </div>
      <div className="trait-bar-bg">
        <div
          className="trait-bar-fill"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const CandidateProfile = ({ candidate }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <User size={18} /> Candidate Overview
        </h2>
      </div>
      
      <div className="panel-body">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="text-xl font-bold text-secondary">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <h3 className="text-lg font-bold">{candidate.name}</h3>
          <p className="text-sm text-secondary">Ref: {candidate.candidate_id}</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 className="text-sm font-bold text-tertiary uppercase" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={16} /> JDS Technical Profile
          </h4>
          <TraitBar label="AI & Machine Learning" value={candidate.skills?.['AI & Machine Learning']} max={5} color="#0ea5e9" />
          <TraitBar label="Maths & Stats" value={candidate.skills?.['Maths & Stats']} max={5} color="#0ea5e9" />
          <TraitBar label="Coding Skills" value={candidate.skills?.['Coding Skills']} max={5} color="#0ea5e9" />
          <TraitBar label="Big Data" value={candidate.skills?.['Big Data']} max={5} color="#0ea5e9" />
          <TraitBar label="Dashboarding" value={candidate.skills?.['Dashboarding']} max={5} color="#0ea5e9" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-tertiary uppercase" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} /> SDS OCEAN Profile
          </h4>
          <TraitBar label="Openness" value={candidate.personality.openness} color="#4f46e5" />
          <TraitBar label="Conscientiousness" value={candidate.personality.conscientiousness} color="#4f46e5" />
          <TraitBar label="Extraversion" value={candidate.personality.extraversion} color="#4f46e5" />
          <TraitBar label="Agreeableness" value={candidate.personality.agreeableness} color="#4f46e5" />
          <TraitBar label="Neuroticism" value={candidate.personality.neuroticism} color="#ef4444" />
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
