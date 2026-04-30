import { useRef } from 'react';
import { X, Download, Building2, CheckCircle, IndianRupee } from 'lucide-react';

const OfferLetterModal = ({ candidate, job, onClose }) => {
  const maxSalStr = (job.salary || '120000').replace(/[^0-9]/g, '');
  const maxSalUsd = parseInt(maxSalStr) || 120000;
  const techFactor = (candidate.math_proof?.tech_score || 75) / 100;
  const growthFactor = (candidate.math_proof?.growth_score || 80) / 100;

  const annualCTC = Math.floor(maxSalUsd * 25 * techFactor);
  const basic = Math.floor(annualCTC * 0.40);
  const hra = Math.floor(annualCTC * 0.20);
  const specialAllowance = Math.floor(annualCTC * 0.24);
  const pf = Math.floor(annualCTC * 0.12);
  const gratuity = Math.floor(annualCTC * 0.0481);
  const signOnBonus = Math.floor(annualCTC * 0.15);
  const esopValue = Math.floor(annualCTC * growthFactor * 0.8);
  const totalCompensation = annualCTC + signOnBonus;

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const joiningDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const offerRef = `OL-${candidate.candidate_id}-${Date.now().toString(36).toUpperCase()}`;

  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Offer Letter - ${candidate.name}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:48px;max-width:800px;margin:auto}
    h1{font-size:26px;font-weight:800;text-align:center;margin-bottom:24px}.header{display:flex;justify-content:space-between;border-bottom:3px solid #4f46e5;padding-bottom:16px;margin-bottom:28px}
    .logo{font-size:22px;font-weight:800;color:#4f46e5}p{line-height:1.8;margin-bottom:14px;font-size:14px}
    table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#4f46e5;color:white;padding:10px;text-align:left;font-size:13px}
    td{padding:10px;font-size:13px;border-bottom:1px solid #e2e8f0}.total{background:#dcfce7;font-weight:800;color:#166534}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}.box{background:#f8fafc;padding:14px;border-radius:8px;border:1px solid #e2e8f0}
    .box-label{font-size:11px;color:#64748b;margin-bottom:4px}.box-value{font-size:18px;font-weight:800}
    .footer{margin-top:40px;display:flex;justify-content:space-between}.sig{width:200px;border-top:1px solid #334155;padding-top:8px;font-size:12px;color:#64748b}
    .compliance{margin-top:24px;background:#f0fdf4;border:1px solid #86efac;padding:12px;border-radius:6px;font-size:11px;color:#166534}
    </style></head><body>
    <div class="header"><div><div class="logo">SynergyDNA</div><div style="font-size:12px;color:#64748b">Career Soulmate Algorithm™</div><div style="font-size:11px;color:#64748b;margin-top:4px">Ref: ${offerRef} | ${today}</div></div>
    <div style="text-align:right"><div style="font-weight:700">${job.company_name || 'Tech Corp India'}</div><div style="font-size:12px;color:#64748b">${job.location || 'Bengaluru, India'}</div></div></div>
    <h1>OFFER OF EMPLOYMENT</h1>
    <p>Dear <strong>${candidate.name}</strong>,<br><br>We are pleased to extend this formal offer for the position of <strong>${job.job_title}</strong> at <strong>${job.company_name || 'Tech Corp India'}</strong>. Your SynergyDNA Compatibility Index Score of <strong>${candidate.compatibility_index_score}/100</strong> places you in the top 3% of all applicants evaluated through our Career Soulmate Algorithm™.</p>
    <p><strong>Date of Joining:</strong> ${joiningDate} &nbsp;|&nbsp; <strong>Location:</strong> ${job.location || 'Bengaluru, India'} (Hybrid)</p>
    <table><tr><th>CTC Component</th><th>Annual (INR)</th><th>Monthly (INR)</th></tr>
    <tr><td>Basic Salary (40%)</td><td>${fmt(basic)}</td><td>${fmt(Math.floor(basic/12))}</td></tr>
    <tr><td>House Rent Allowance (20%)</td><td>${fmt(hra)}</td><td>${fmt(Math.floor(hra/12))}</td></tr>
    <tr><td>Special Performance Allowance (24%)</td><td>${fmt(specialAllowance)}</td><td>${fmt(Math.floor(specialAllowance/12))}</td></tr>
    <tr><td>Employer PF (12%)</td><td>${fmt(pf)}</td><td>${fmt(Math.floor(pf/12))}</td></tr>
    <tr><td>Gratuity (4.81%)</td><td>${fmt(gratuity)}</td><td>${fmt(Math.floor(gratuity/12))}</td></tr>
    <tr class="total"><td><strong>Total Annual CTC</strong></td><td><strong>${fmt(annualCTC)}</strong></td><td><strong>${fmt(Math.floor(annualCTC/12))}</strong></td></tr></table>
    <div class="grid">
    <div class="box"><div class="box-label">Sign-On Bonus</div><div class="box-value">${fmt(signOnBonus)}</div><div style="font-size:11px;color:#94a3b8">Payable on Day 1</div></div>
    <div class="box"><div class="box-label">Annual Performance Bonus</div><div class="box-value">Up to 20%</div><div style="font-size:11px;color:#94a3b8">KPI-linked</div></div>
    <div class="box"><div class="box-label">ESOPs / RSUs</div><div class="box-value">${fmt(esopValue)}</div><div style="font-size:11px;color:#94a3b8">4yr vest, 1yr cliff</div></div>
    <div class="box"><div class="box-label">Total First-Year Compensation</div><div class="box-value" style="color:#166534">${fmt(totalCompensation)}</div></div></div>
    <p style="margin-top:16px">Please confirm acceptance within <strong>5 business days</strong>. This offer is subject to background verification.</p>
    <div class="footer"><div class="sig">Authorized Signatory<br>${job.company_name || 'Tech Corp India'}</div><div class="sig">Candidate Acceptance<br>${candidate.name}</div></div>
    <div class="compliance">✓ DPDPA 2023 Compliant &nbsp;|&nbsp; ✓ PII-Protected &nbsp;|&nbsp; Generated by SynergyDNA v3.1 &nbsp;|&nbsp; Ref: ${offerRef}</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.85)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'760px', maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 40px 80px -12px rgba(0,0,0,0.6)' }}>
        <div style={{ padding:'1.25rem 2rem', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, fontSize:'1.1rem', color:'white', display:'flex', alignItems:'center', gap:'0.5rem' }}><Building2 size={20}/> Formal Offer Letter</div>
            <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.7)', marginTop:'2px' }}>Ref: {offerRef} · {today}</div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={handlePrint} style={{ background:'white', color:'#4f46e5', border:'none', borderRadius:'8px', padding:'0.5rem 1.25rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.875rem' }}>
              <Download size={16}/> Download PDF
            </button>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'8px', padding:'0.5rem', cursor:'pointer', color:'white' }}><X size={20}/></button>
          </div>
        </div>

        <div style={{ overflowY:'auto', padding:'2rem', flex:1 }}>
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h1 style={{ fontWeight:800, fontSize:'1.4rem', color:'#0f172a' }}>OFFER OF EMPLOYMENT</h1>
            <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:'0.5rem' }}>{job.company_name} · {job.location} · Ref: {offerRef}</p>
          </div>
          <p style={{ lineHeight:1.8, color:'#334155', marginBottom:'1.5rem', fontSize:'0.875rem' }}>
            Dear <strong style={{ color:'#4f46e5' }}>{candidate.name}</strong>,<br/><br/>
            We are pleased to extend this formal offer for the role of <strong>{job.job_title}</strong>. Your SynergyDNA CIS Score of{' '}
            <strong style={{ color:'#4f46e5' }}>{candidate.compatibility_index_score}/100</strong> places you in the <strong>top 3% of all applicants</strong>.
            Your joining date is <strong>{joiningDate}</strong>.
          </p>

          <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#0f172a', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <IndianRupee size={16} color="#4f46e5"/> Annual CTC Breakdown
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:'1.5rem', fontSize:'0.8rem' }}>
            <thead><tr style={{ background:'#4f46e5', color:'white' }}>
              <th style={{ padding:'10px 14px', textAlign:'left' }}>Component</th>
              <th style={{ padding:'10px 14px', textAlign:'right' }}>Annual</th>
              <th style={{ padding:'10px 14px', textAlign:'right' }}>Monthly</th>
            </tr></thead>
            <tbody>
              {[['Basic Salary (40%)', basic],['HRA (20%)', hra],['Special Allowance (24%)', specialAllowance],['Employer PF (12%)', pf],['Gratuity (4.81%)', gratuity]].map(([l,v]) => (
                <tr key={l} style={{ borderBottom:'1px solid #e2e8f0' }}>
                  <td style={{ padding:'10px 14px', color:'#334155' }}>{l}</td>
                  <td style={{ padding:'10px 14px', textAlign:'right', color:'#334155' }}>{fmt(v)}</td>
                  <td style={{ padding:'10px 14px', textAlign:'right', color:'#334155' }}>{fmt(Math.floor(v/12))}</td>
                </tr>
              ))}
              <tr style={{ background:'#dcfce7' }}>
                <td style={{ padding:'12px 14px', fontWeight:800, color:'#166534' }}>TOTAL ANNUAL CTC</td>
                <td style={{ padding:'12px 14px', fontWeight:800, color:'#166534', textAlign:'right' }}>{fmt(annualCTC)}</td>
                <td style={{ padding:'12px 14px', fontWeight:800, color:'#166534', textAlign:'right' }}>{fmt(Math.floor(annualCTC/12))}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[['Sign-On Bonus', fmt(signOnBonus), 'Payable on Day 1'],['Annual Bonus', 'Up to 20%', 'KPI-linked performance'],['ESOPs / RSUs', fmt(esopValue), '4-year vest, 1-year cliff'],['Total First-Year', fmt(totalCompensation), 'Including sign-on']].map(([l,v,s]) => (
              <div key={l} style={{ background:'#f8fafc', padding:'1rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:'0.7rem', color:'#64748b', marginBottom:'4px' }}>{l}</div>
                <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#0f172a' }}>{v}</div>
                <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:'2px' }}>{s}</div>
              </div>
            ))}
          </div>

          {(candidate.top_drivers||[]).length > 0 && (
            <div style={{ background:'#eef2ff', padding:'1rem', borderRadius:'8px', marginBottom:'1rem' }}>
              <div style={{ fontWeight:700, fontSize:'0.8rem', color:'#4338ca', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <CheckCircle size={14}/> Why SynergyDNA Selected {candidate.name}
              </div>
              {candidate.top_drivers.map((d,i) => <p key={i} style={{ fontSize:'0.8rem', color:'#3730a3', lineHeight:1.6 }}>• {d}</p>)}
            </div>
          )}

          <p style={{ fontSize:'0.7rem', color:'#94a3b8', borderTop:'1px solid #e2e8f0', paddingTop:'1rem', marginTop:'0.5rem' }}>
            ✓ DPDPA 2023 Compliant · PII-Protected · SynergyDNA Career Soulmate Algorithm™ v3.1 · Ref: {offerRef}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterModal;
