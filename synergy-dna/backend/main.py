import random
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="SynergyDNA ATS Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Datasets
BASE_DIR = "e:/Tensor Titans"
try:
    df_jobs = pd.read_csv(f"{BASE_DIR}/ai_jobs.csv").dropna(subset=['job_id', 'job_title', 'company_size', 'industry'])
except Exception as e:
    df_jobs = pd.DataFrame()

try:
    df_sds = pd.read_csv(f"{BASE_DIR}/SDS Personality Traits.csv").dropna()
except:
    df_sds = pd.DataFrame()

try:
    df_jds = pd.read_csv(f"{BASE_DIR}/JDS Skill Traits.csv").dropna()
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
    skills: dict
    personality: dict
    compatibility_index_score: float
    math_proof: MathProof
    top_drivers: List[str]
    risks: List[str]
    ai_recommendation: str
    status: str = "Sourced"
    job_title: str = ""

indian_first_names = ["Rahul", "Priya", "Amit", "Anjali", "Rohan", "Sneha", "Vikram", "Pooja", "Aditya", "Neha", "Karthik", "Divya", "Siddharth", "Meera", "Arjun", "Kavya", "Varun", "Shruti", "Nikhil", "Aarav"]
indian_last_names = ["Sharma", "Patel", "Singh", "Desai", "Gupta", "Reddy", "Malhotra", "Iyer", "Verma", "Kapoor", "Nair", "Menon", "Joshi", "Bose", "Das", "Chopra", "Rao", "Jain"]

def generate_indian_name():
    return f"{random.choice(indian_first_names)} {random.choice(indian_last_names)}"

def compute_cultural_resonance(cand_personality, company_type):
    ideal = {'neuroticism': 40, 'extraversion': 60, 'openness': 60, 'agreeableness': 60, 'conscientiousness': 70}
    if company_type == 'Startup':
        ideal = {'neuroticism': 60, 'extraversion': 70, 'openness': 80, 'agreeableness': 50, 'conscientiousness': 60}
    elif company_type == 'MNC':
        ideal = {'neuroticism': 30, 'extraversion': 60, 'openness': 50, 'agreeableness': 70, 'conscientiousness': 85}
        
    diff = sum([abs(cand_personality[k] - ideal[k]) for k in ideal.keys()])
    max_diff = 500
    similarity = ((max_diff - diff) / max_diff) * 100
    return max(min(similarity, 99.0), 10.0)

@app.get("/api/jobs", response_model=List[JobReq])
async def get_jobs():
    if df_jobs.empty:
        return []
    
    sampled = df_jobs.sample(8).to_dict('records')
    jobs = []
    prefixes = ["Tech", "Global", "NextGen", "Nova", "Apex", "Quantum", "Synergy", "Omni"]
    
    for job in sampled:
        jobs.append(JobReq(
            job_id=str(job['job_id']),
            job_title=job['job_title'],
            company_name=f"{random.choice(prefixes)} {job['industry']}",
            industry=job['industry'],
            location=f"{job.get('city', 'Unknown')}, {job.get('country', 'Unknown')}",
            salary=f"${job.get('salary_max_usd', 0):,.0f}",
            company_size=job['company_size'],
            company_type=job.get('company_type', 'Startup')
        ))
    return jobs

@app.get("/api/jobs/{job_id}/candidates", response_model=List[CandidateProfile])
async def get_candidates_for_job(job_id: str):
    if df_sds.empty or df_jds.empty or df_jobs.empty:
        return []
        
    # Get job context to score against
    try:
        job = df_jobs[df_jobs['job_id'].astype(str) == job_id].iloc[0]
    except:
        job = df_jobs.iloc[0] # Fallback
        
    candidates = []
    # Generate realistic candidates
    for _ in range(12):
        sds_row = df_sds.sample(1).iloc[0]
        jds_row = df_jds.sample(1).iloc[0]
        
        personality = {
            "neuroticism": int(sds_row['neuroticism']),
            "extraversion": int(sds_row.get(' extraversion', sds_row.get('extraversion', 50))),
            "openness": int(sds_row['openness_to_experience']),
            "agreeableness": int(sds_row['agreeableness']),
            "conscientiousness": int(sds_row['conscientiousness'])
        }
        
        skills = {
            "big_data": float(jds_row['big_data_skills']),
            "math_stats": float(jds_row['maths-stats_skills']),
            "coding": float(jds_row['coding_skills']),
            "ai_ml": float(jds_row['ai_and_ml_skills']),
            "dashboarding": float(jds_row['dashboard_and_storytelling_skills'])
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
        risks = []
        
        # Calculate Positive Signals (Drivers)
        if tech_score > 80: drivers.append(f"Strong match for {job['job_title']} technical stack.")
        if cult_score > 75: drivers.append(f"High cultural resonance with {job.get('company_size', 'Large')} environment.")
        if personality['openness'] > 60: drivers.append(f"High Openness ({personality['openness']}) indicates adaptability.")
        if len(drivers) == 0: drivers.append("Solid overall foundational fit.")
        
        # Calculate Negative Signals (Risks)
        if skills['big_data'] <= 3.0: risks.append(f"Technical gap: Big Data proficiency is critically low ({skills['big_data']}/5).")
        if skills['coding'] <= 3.0: risks.append(f"Technical gap: Sub-par fundamental coding skills ({skills['coding']}/5).")
        if personality['conscientiousness'] < 45: risks.append(f"Low Conscientiousness ({personality['conscientiousness']}) indicates potential unstructured execution.")
        if personality['neuroticism'] > 75: risks.append(f"High Neuroticism ({personality['neuroticism']}) may signal stress vulnerability under pressure.")
        if cult_score < 50: risks.append(f"Severe cultural mismatch with {job.get('company_type', 'Startup')} values.")
        
        # AI Recommendation Engine
        if cis >= 82 and len(risks) <= 1:
            ai_rec = "STRONG HIRE"
        elif cis >= 70 and len(risks) <= 3:
            ai_rec = "PROCEED WITH CAUTION"
        else:
            ai_rec = "REJECT"

        candidates.append(CandidateProfile(
            candidate_id=f"CAND-{random.randint(1000,9999)}",
            name=generate_indian_name(),
            skills=skills,
            personality=personality,
            compatibility_index_score=round(cis, 1),
            math_proof=proof,
            top_drivers=drivers,
            risks=risks,
            ai_recommendation=ai_rec,
            status="Sourced",
            job_title=job['job_title']
        ))
        
    candidates.sort(key=lambda x: x.compatibility_index_score, reverse=True)
    return candidates

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
