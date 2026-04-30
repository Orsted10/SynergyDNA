import { Zap, AlertTriangle } from 'lucide-react';

const SHAPExplainer = ({ drivers, risks }) => {
  if (!drivers && !risks) return null;
  const safeRisks = risks || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      
      {drivers.map((driver, idx) => (
        <div key={`d-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid var(--accent-indigo)' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-indigo)' }}>
            <Zap size={16} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: 'var(--accent-indigo)' }}>Positive Signal</div>
            <div className="text-sm">{driver}</div>
          </div>
        </div>
      ))}

      {safeRisks.map((risk, idx) => (
        <div key={`r-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '50%', color: '#ef4444' }}>
            <AlertTriangle size={16} />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: '#ef4444' }}>Negative Signal / Risk</div>
            <div className="text-sm">{risk}</div>
          </div>
        </div>
      ))}
      
    </div>
  );
};

export default SHAPExplainer;
