import random
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os

app = FastAPI(title="SynergyDNA ATS Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Datasets dynamically
BASE_DIR = os.path.join(os.path.dirname(__file__), "data")
try:
    df_jobs = pd.read_csv(os.path.join(BASE_DIR, "ai_jobs.csv")).dropna(subset=['job_id', 'job_title', 'company_size', 'industry'])
except Exception as e:
    df_jobs = pd.DataFrame()

try:
    df_sds = pd.read_csv(os.path.join(BASE_DIR, "SDS Personality Traits.csv")).dropna()
except:
    df_sds = pd.DataFrame()

try:
    df_jds = pd.read_csv(os.path.join(BASE_DIR, "JDS Skill Traits.csv")).dropna()
except:
    df_jds = pd.DataFrame()

# Data Models
class JobReq(BaseModel):
    job_id: str
    job_title: str
    company_name: str
    industry: str
    location: str
    salary: str
    company_size: str
    company_type: str

class MathProof(BaseModel):
    tech_score: float
    cult_score: float
    growth_score: float
    chemistry_score: float
    market_score: float
    tech_weight: float
    cult_weight: float
    growth_weight: float
    chemistry_weight: float
    market_weight: float
    formula_string: str

class CandidateProfile(BaseModel):
    candidate_id: str
    name: str
    job_title: str
    compatibility_index_score: float
    skills: dict
    personality: dict
    top_drivers: List[str]
    risks: List[str]
    ai_recommendation: str
    math_proof: MathProof
    status: str

INDIAN_NAMES = ["Aarav Nair", "Shruti Das", "Vikram Patel", "Pooja Sharma", "Nikhil Gupta", "Meera Nair", "Rahul Singh", "Sneha Chopra", "Amit Malhotra", "Kavya Menon", "Rohan Bose", "Divya Rao", "Karthik Reddy", "Ananya Verma", "Siddharth Iyer"]

def compute_cultural_resonance(personality, company_type):
    # Base match: Conscientiousness and Agreeableness are generally good
    score = (personality.get('conscientiousness', 50) * 0.5) + (personality.get('agreeableness', 50) * 0.5)
    
    # Contextual Modifiers based on Startup vs MNC
    if "Startup" in str(company_type) or "Small" in str(company_type):
        score += (personality.get('openness', 50) * 0.3)
        score += (personality.get('extraversion', 50) * 0.2)
    else: # MNC / Large
        score -= (personality.get('neuroticism', 50) * 0.2)
        
    return min(max(score * 1.5, 10.0), 99.0)

@app.get("/api/jobs", response_model=List[JobReq])
def get_open_jobs():
    if df_jobs.empty:
        return []
    
    sampled = df_jobs.sample(min(8, len(df_jobs))).to_dict('records')
    jobs = []
    for row in sampled:
        jobs.append(JobReq(
            job_id=str(row['job_id']),
            job_title=str(row['job_title']),
            company_name=str(row.get('company_name', 'Tech Corp')),
            industry=str(row['industry']),
            location=str(row.get('location', 'India')),
            salary=str(row.get('salary_max_usd', '100000')),
            company_size=str(row['company_size']),
            company_type=str(row.get('company_type', 'MNC'))
        ))
    return jobs

@app.get("/api/jobs/{job_id}/candidates", response_model=List[CandidateProfile])
def generate_candidates_for_job(job_id: str):
    if df_sds.empty or df_jds.empty or df_jobs.empty:
        return []
        
    # Find job
    job = df_jobs[df_jobs['job_id'] == job_id]
    if job.empty:
        job = df_jobs.iloc[0].to_dict()
    else:
        job = job.iloc[0].to_dict()
        
    # Sample 12 candidates
    candidates = []
    names = random.sample(INDIAN_NAMES, 12)
    
    for i in range(12):
        sds_row = df_sds.sample(1).iloc[0]
        jds_row = df_jds.sample(1).iloc[0]
        
        personality = {
            "openness": float(sds_row.get('openness', 50)),
            "conscientiousness": float(sds_row.get('conscientiousness', 50)),
            "extraversion": float(sds_row.get('extraversion', 50)),
            "agreeableness": float(sds_row.get('agreeableness', 50)),
            "neuroticism": float(sds_row.get('neuroticism', 50))
        }
        
        skills = {
            "AI & Machine Learning": float(jds_row.get('ai_ml', random.uniform(2, 5))),
            "Maths & Stats": float(jds_row.get('maths_stats', random.uniform(2, 5))),
            "Coding Skills": float(jds_row.get('coding', random.uniform(2, 5))),
            "Big Data": float(jds_row.get('big_data', random.uniform(1, 5))),
            "Dashboarding": float(jds_row.get('dashboarding', random.uniform(1, 5)))
        }
        
        avg_tech = sum(skills.values()) / 5.0
        tech_score = (avg_tech / 5.0) * 100 * random.uniform(0.7, 1.0) # Scale to 100
        
        cult_score = compute_cultural_resonance(personality, job.get('company_type', 'MNC'))
        growth_score = random.uniform(60, 95)
        chemistry_score = min(max(personality['agreeableness'] * 1.5 + random.uniform(-10, 10), 10.0), 99.0)
        market_score = random.uniform(50, 90)
        
        weights = {"tech": 0.30, "cult": 0.25, "growth": 0.20, "chemistry": 0.15, "market": 0.10}
        
        cis = (
            (tech_score * weights["tech"]) +
            (cult_score * weights["cult"]) +
            (growth_score * weights["growth"]) +
            (chemistry_score * weights["chemistry"]) +
            (market_score * weights["market"])
        )
        
        formula = f"({tech_score:.1f} × {weights['tech']}) + ({cult_score:.1f} × {weights['cult']}) + ({growth_score:.1f} × {weights['growth']}) + ({chemistry_score:.1f} × {weights['chemistry']}) + ({market_score:.1f} × {weights['market']}) = {cis:.1f}"
        
        proof = MathProof(
            tech_score=round(tech_score, 1),
            cult_score=round(cult_score, 1),
            growth_score=round(growth_score, 1),
            chemistry_score=round(chemistry_score, 1),
            market_score=round(market_score, 1),
            tech_weight=weights["tech"],
            cult_weight=weights["cult"],
            growth_weight=weights["growth"],
            chemistry_weight=weights["chemistry"],
            market_weight=weights["market"],
            formula_string=formula
        )
        
        drivers = []
        if tech_score > 80: drivers.append(f"Strong match for {job.get('job_title', 'Role')} technical stack.")
        if cult_score > 80: drivers.append(f"High cultural resonance with {job.get('company_size', 'Enterprise')} environment.")
        if growth_score > 80: drivers.append("Growth trajectory aligns tightly with role requirements.")
        if not drivers: drivers.append("Solid overall fit across multiple dimensions.")
        
        risks = []
        if personality['conscientiousness'] < 45: risks.append("Low Conscientiousness indicates potential unstructured execution or flight risk.")
        if skills['Big Data'] < 3: risks.append("Technical gap: Big Data proficiency is critically low.")
        if personality['neuroticism'] > 65: risks.append("High Neuroticism suggests potential stress management issues under pressure.")
        if tech_score < 60: risks.append("Core technical skills do not meet baseline requirements.")

        ai_rec = "PROCEED WITH CAUTION"
        if cis > 82 and len(risks) <= 1:
            ai_rec = "STRONG HIRE"
        elif cis < 70 or len(risks) >= 3:
            ai_rec = "REJECT"

        candidates.append(CandidateProfile(
            candidate_id=f"CAND-{random.randint(1000, 9999)}",
            name=names[i],
            job_title=job.get('job_title', 'Role'),
            compatibility_index_score=round(cis, 1),
            skills=skills,
            personality=personality,
            top_drivers=drivers[:3],
            risks=risks[:3],
            ai_recommendation=ai_rec,
            math_proof=proof,
            status='Sourced'
        ))
        
    candidates.sort(key=lambda x: x.compatibility_index_score, reverse=True)
    return candidates
