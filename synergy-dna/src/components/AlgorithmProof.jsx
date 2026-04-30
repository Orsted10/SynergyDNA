import { Calculator } from 'lucide-react';

const AlgorithmProof = ({ proof }) => {
  if (!proof) return null;

  return (
    <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h4 className="text-sm font-bold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Calculator size={16} /> Compatibility Algorithm Transparency
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div className="text-xs text-secondary uppercase font-bold" style={{fontSize: '0.65rem'}}>Tech ({proof.tech_weight * 100}%)</div>
          <div className="text-base font-bold">{proof.tech_score}</div>
        </div>
        <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div className="text-xs text-secondary uppercase font-bold" style={{fontSize: '0.65rem'}}>Cult ({proof.cult_weight * 100}%)</div>
          <div className="text-base font-bold">{proof.cult_score}</div>
        </div>
        <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div className="text-xs text-secondary uppercase font-bold" style={{fontSize: '0.65rem'}}>Grow ({proof.growth_weight * 100}%)</div>
          <div className="text-base font-bold">{proof.growth_score}</div>
        </div>
        <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div className="text-xs text-secondary uppercase font-bold" style={{fontSize: '0.65rem'}}>Chem ({proof.chemistry_weight * 100}%)</div>
          <div className="text-base font-bold">{proof.chemistry_score}</div>
        </div>
        <div style={{ padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div className="text-xs text-secondary uppercase font-bold" style={{fontSize: '0.65rem'}}>Mrkt ({proof.market_weight * 100}%)</div>
          <div className="text-base font-bold">{proof.market_score}</div>
        </div>
      </div>
      
      <div style={{ padding: '0.75rem', background: '#1e293b', color: '#10b981', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        // Raw Calculation Matrix
        <br />
        {proof.formula_string}
      </div>
    </div>
  );
};

export default AlgorithmProof;
