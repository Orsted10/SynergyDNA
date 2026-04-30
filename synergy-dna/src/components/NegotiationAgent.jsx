import { useState, useRef } from 'react';
import { X, Bot, User, Sparkles, TrendingUp } from 'lucide-react';

const NEGOTIATION_SCRIPT = (candidate, job, fmt, annualCTC, esopValue) => [
  {
    role: 'system',
    text: `AI Negotiation Agent activated for ${candidate.name}. Base offer: ${fmt(annualCTC)} CTC. ESOP pool: ${fmt(esopValue)}. Strategy: Protect base salary. Offer equity & flexibility as trade-offs for any counter above 10%.`,
    timestamp: '09:01 AM'
  },
  {
    role: 'candidate',
    text: `Hi, thank you for the offer! I'm very excited about the ${job.job_title} role. However, I was expecting something closer to ${fmt(Math.floor(annualCTC * 1.18))} CTC. Would that be possible?`,
    timestamp: '09:03 AM'
  },
  {
    role: 'agent',
    text: `Thank you for your candid response! We genuinely value your profile — your CIS Score of ${candidate.compatibility_index_score} is among the highest we've seen for this cohort. 
    
    We're not in a position to stretch the base to that level while maintaining internal pay-parity. However, here's what I can offer you instead:

    📈 ESOP Grant: Increase from ${fmt(esopValue)} → ${fmt(Math.floor(esopValue * 1.35))} (4yr vest)
    🎯 Q1 Performance Review: Guaranteed salary review in 6 months if KPIs are met
    🏠 Remote Work Stipend: ₹60,000/year additional WFH allowance
    📚 L&D Budget: ₹1,20,000/year dedicated upskilling budget

    This effectively brings your total first-year value to ${fmt(Math.floor(annualCTC * 1.14))}. Thoughts?`,
    timestamp: '09:04 AM'
  },
  {
    role: 'candidate',
    text: `That ESOP increase is attractive! Could we also lock in a 15% performance bonus instead of 20% target?`,
    timestamp: '09:07 AM'
  },
  {
    role: 'agent',
    text: `Absolutely. I can confirm a guaranteed floor of 12% bonus (regardless of company performance) with a 20% ceiling tied to your individual KPIs. This gives you certainty while maintaining upside potential.
    
    ✅ Final Package Summary:
    • CTC: ${fmt(annualCTC)} (Base)
    • ESOPs: ${fmt(Math.floor(esopValue * 1.35))} (Enhanced)
    • Guaranteed Bonus Floor: 12%
    • WFH Stipend: ₹60,000/yr
    • L&D: ₹1,20,000/yr
    
    Shall I generate the revised offer letter?`,
    timestamp: '09:08 AM'
  },
  {
    role: 'candidate',
    text: `Yes, I accept! This works for me. Looking forward to joining the team!`,
    timestamp: '09:09 AM'
  },
  {
    role: 'agent',
    text: `🎉 Excellent! Negotiation concluded successfully. Generating revised offer letter and notifying HR... Candidate onboarding timeline: T+30 days. Welcome aboard, ${candidate.name.split(' ')[0]}!`,
    timestamp: '09:09 AM'
  }
];

const NegotiationAgent = ({ candidate, job, onClose }) => {
  const [visibleCount, setVisibleCount] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef();

  const maxSalStr = (job.salary || '120000').replace(/[^0-9]/g, '');
  const maxSalUsd = parseInt(maxSalStr) || 120000;
  const techFactor = (candidate.math_proof?.tech_score || 75) / 100;
  const growthFactor = (candidate.math_proof?.growth_score || 80) / 100;
  const annualCTC = Math.floor(maxSalUsd * 25 * techFactor);
  const esopValue = Math.floor(annualCTC * growthFactor * 0.8);
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const script = NEGOTIATION_SCRIPT(candidate, job, fmt, annualCTC, esopValue);
  const visibleMessages = script.slice(0, visibleCount);

  const handleNext = () => {
    if (visibleCount >= script.length) return;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setVisibleCount(v => v + 1);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 1200);
  };

  const isComplete = visibleCount >= script.length;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.85)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'680px', maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 40px 80px -12px rgba(0,0,0,0.6)' }}>
        
        {/* Header */}
        <div style={{ padding:'1rem 1.5rem', background:'linear-gradient(135deg,#0f172a,#1e293b)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem' }}>
              <Bot size={18} color="#a78bfa"/> AI Negotiation Agent
              <span style={{ background:'#7c3aed', color:'white', fontSize:'0.6rem', padding:'2px 8px', borderRadius:'20px', fontWeight:600 }}>YEAR 3 ROADMAP</span>
            </div>
            <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'2px' }}>Autonomous Salary Negotiation · {candidate.name} · {job.job_title}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'8px', padding:'0.5rem', cursor:'pointer', color:'white' }}><X size={18}/></button>
        </div>

        {/* Chat */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', background:'#f8fafc' }}>
          {visibleMessages.map((msg, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: msg.role === 'candidate' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'system' && (
                <div style={{ background:'#fef3c7', border:'1px solid #fbbf24', borderRadius:'8px', padding:'0.75rem 1rem', fontSize:'0.75rem', color:'#92400e', width:'100%', display:'flex', gap:'0.5rem' }}>
                  <Sparkles size={14} style={{ flexShrink:0, marginTop:'2px' }}/> <span>{msg.text}</span>
                </div>
              )}
              {msg.role === 'agent' && (
                <div style={{ display:'flex', gap:'0.75rem', maxWidth:'85%' }}>
                  <div style={{ width:32, height:32, background:'#7c3aed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Bot size={16} color="white"/>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginBottom:'4px' }}>SynergyDNA Negotiation AI · {msg.timestamp}</div>
                    <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:'0 12px 12px 12px', padding:'0.85rem 1rem', fontSize:'0.82rem', color:'#1e293b', lineHeight:1.7, whiteSpace:'pre-line', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
              {msg.role === 'candidate' && (
                <div style={{ display:'flex', gap:'0.75rem', maxWidth:'85%', flexDirection:'row-reverse' }}>
                  <div style={{ width:32, height:32, background:'#4f46e5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <User size={16} color="white"/>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.65rem', color:'#94a3b8', marginBottom:'4px', textAlign:'right' }}>{candidate.name} · {msg.timestamp}</div>
                    <div style={{ background:'#4f46e5', borderRadius:'12px 0 12px 12px', padding:'0.85rem 1rem', fontSize:'0.82rem', color:'white', lineHeight:1.7 }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <div style={{ width:32, height:32, background:'#7c3aed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}><Bot size={16} color="white"/></div>
              <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:'0 12px 12px 12px', padding:'0.75rem 1rem' }}>
                <div style={{ display:'flex', gap:'4px' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, background:'#94a3b8', borderRadius:'50%', animation:`bounce ${0.6+i*0.2}s infinite alternate` }}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Footer */}
        <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid #e2e8f0', background:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <TrendingUp size={14} color="#10b981"/> {isComplete ? 'Negotiation completed successfully!' : `Message ${visibleCount} of ${script.length}`}
          </div>
          {!isComplete ? (
            <button onClick={handleNext} disabled={isTyping} style={{ background: isTyping ? '#e2e8f0' : '#7c3aed', color: isTyping ? '#94a3b8' : 'white', border:'none', borderRadius:'8px', padding:'0.6rem 1.5rem', fontWeight:700, cursor: isTyping ? 'not-allowed' : 'pointer', fontSize:'0.85rem' }}>
              {isTyping ? 'Agent Responding...' : 'Next Message →'}
            </button>
          ) : (
            <button onClick={onClose} style={{ background:'#10b981', color:'white', border:'none', borderRadius:'8px', padding:'0.6rem 1.5rem', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
              ✓ Close — Deal Closed!
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
};

export default NegotiationAgent;
