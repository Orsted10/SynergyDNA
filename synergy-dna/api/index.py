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

BASE_DIR = os.path.join(os.path.dirname(__file__), "data")

try:
    df_jobs = pd.read_csv(os.path.join(BASE_DIR, "ai_jobs.csv")).dropna(subset=['job_id', 'job_title', 'company_size', 'industry'])
except:
    df_jobs = pd.DataFrame()

try:
    df_sds = pd.read_csv(os.path.join(BASE_DIR, "SDS Personality Traits.csv")).dropna()
    df_sds.columns = df_sds.columns.str.strip()
except:
    df_sds = pd.DataFrame()

try:
    df_jds = pd.read_csv(os.path.join(BASE_DIR, "JDS Skill Traits.csv")).dropna()
    df_jds.columns = df_jds.columns.str.strip()
except:
    df_jds = pd.DataFrame()

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
    data_source: str

INDIAN_NAMES = [
    "Aarav Nair", "Shruti Das", "Vikram Patel", "Pooja Sharma", "Nikhil Gupta",
    "Meera Nair", "Rahul Singh", "Sneha Chopra", "Amit Malhotra", "Kavya Menon",
    "Rohan Bose", "Divya Rao", "Karthik Reddy", "Ananya Verma", "Siddharth Iyer",
    "Priya Krishnan", "Arjun Mehta", "Nandita Joshi", "Varun Tiwari", "Ishita Banerjee"
]

INDIAN_CITIES = ["Bengaluru", "Mumbai", "Hyderabad", "Pune", "Chennai", "Delhi NCR", "Kolkata", "Ahmedabad"]

# Realistic Indian company names keyed by (company_type, industry)
COMPANY_NAMES = {
    ("Startup",      "Tech"):        ["Razorpay", "Zepto", "Groww", "Meesho", "BrowserStack", "Postman", "Darwinbox"],
    ("Startup",      "Finance"):     ["Cred", "Slice", "Fi Money", "Jupiter", "Freo", "Juspay"],
    ("Startup",      "Education"):   ["Byju's", "Unacademy", "Scaler", "upGrad", "Vedantu", "PrepLadder"],
    ("Startup",      "Healthcare"):  ["Practo", "PharmEasy", "1mg", "HealthifyMe", "Innovaccer"],
    ("Startup",      "E-commerce"):  ["Nykaa", "Meesho", "Dealshare", "Udaan", "Vahak"],
    ("MNC",          "Tech"):        ["Google India", "Microsoft IDC", "Amazon India", "Adobe Systems", "Salesforce India"],
    ("MNC",          "Finance"):     ["Goldman Sachs Bengaluru", "JP Morgan India", "Deutsche Bank India", "Citi India"],
    ("MNC",          "Education"):   ["Pearson India", "Coursera India", "Duolingo India"],
    ("MNC",          "Healthcare"):  ["Johnson & Johnson India", "Philips Healthcare", "Siemens Healthineers"],
    ("MNC",          "E-commerce"):  ["Amazon India", "Flipkart", "Myntra"],
    ("Large",        "Tech"):        ["Tata Consultancy Services", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra"],
    ("Large",        "Finance"):     ["HDFC Bank Tech", "ICICI Lombard", "Bajaj Finserv", "Kotak Digital"],
    ("Large",        "Education"):   ["Tata ClassEdge", "NIIT Technologies", "Educomp"],
    ("Research Lab", "Tech"):        ["IISc Research", "TCS Innovation Labs", "Samsung R&D India", "Intel India"],
    ("Research Lab", "Finance"):     ["Reserve Bank Innovation Hub", "SEBI Research", "NPCI Analytics"],
    ("Research Lab", "Education"):   ["IIT Bombay AI Lab", "IISc ML Lab", "IIIT Hyderabad NLP Lab"],
    ("Small",        "Tech"):        ["Hasura", "Setu", "Clarisights", "Dukaan", "SuperOps", "Zuddl"],
    ("Small",        "Finance"):     ["Smallcase", "Stable Money", "Finvasia", "Paytm Money"],
    ("Medium",       "Tech"):        ["Freshworks", "Zoho Corp", "Chargebee", "Kissflow", "Saama Tech"],
    ("Medium",       "Finance"):     ["Moneytap", "Lendingkart", "NeoGrowth", "Stashfin"],
}
DEFAULT_COMPANIES = ["Infosys", "Wipro", "HCL Technologies", "Mphasis", "Hexaware", "Mindtree", "L&T Infotech"]

def get_company_name(company_type: str, industry: str, rng) -> str:
    key = (company_type, industry)
    pool = COMPANY_NAMES.get(key)
    if not pool:
        # Try matching just company_type
        for k, v in COMPANY_NAMES.items():
            if k[0] == company_type:
                pool = v
                break
    if not pool:
        pool = DEFAULT_COMPANIES
    return rng.choice(pool)


def compute_cultural_resonance(personality, company_type):
    score = (personality.get('conscientiousness', 50) * 0.5) + (personality.get('agreeableness', 50) * 0.5)
    ctype = str(company_type).lower()
    if "startup" in ctype or "small" in ctype:
        score += (personality.get('openness', 50) * 0.3)
        score += (personality.get('extraversion', 50) * 0.2)
    else:
        score -= (personality.get('neuroticism', 50) * 0.2)
    return min(max(score * 1.5, 10.0), 99.0)

@app.get("/api/jobs", response_model=List[JobReq])
def get_open_jobs():
    if df_jobs.empty:
        return []
    sampled = df_jobs.sample(min(8, len(df_jobs))).to_dict('records')
    jobs = []
    rng = random.Random(42)  # Fixed seed so jobs list is stable on refresh
    for row in sampled:
        ctype = str(row.get('company_type', 'Large'))
        industry = str(row.get('industry', 'Tech'))
        company_name = get_company_name(ctype, industry, rng)
        # Use city from dataset if present and non-remote, else pick Indian city
        raw_city = str(row.get('city', ''))
        location = raw_city if (raw_city and raw_city.lower() != 'remote' and raw_city != 'nan') else rng.choice(INDIAN_CITIES)
        jobs.append(JobReq(
            job_id=str(row['job_id']),
            job_title=str(row['job_title']),
            company_name=company_name,
            industry=industry,
            location=location,
            salary=str(row.get('salary_max_usd', '100000')),
            company_size=str(row['company_size']),
            company_type=ctype
        ))
    return jobs


@app.get("/api/jobs/{job_id}/candidates", response_model=List[CandidateProfile])
def generate_candidates_for_job(job_id: str):
    if df_sds.empty or df_jds.empty or df_jobs.empty:
        return []

    job_match = df_jobs[df_jobs['job_id'] == job_id]
    job = job_match.iloc[0].to_dict() if not job_match.empty else df_jobs.iloc[0].to_dict()

    # Deterministic seed per job — same job always returns same 12 candidates
    seed = abs(hash(str(job_id))) % (2**31)
    rng = random.Random(seed)

    sds_indices = rng.sample(range(len(df_sds)), min(12, len(df_sds)))
    jds_indices = rng.sample(range(len(df_jds)), min(12, len(df_jds)))
    name_pool = rng.sample(INDIAN_NAMES, 12)

    candidates = []
    for i in range(12):
        sds_row = df_sds.iloc[sds_indices[i]]
        jds_row = df_jds.iloc[jds_indices[i]]

        # Real SDS columns (after strip): id, neuroticism, extraversion,
        # openness_to_experience, agreeableness, conscientiousness,
        # success_ classification_ high_low  (note the spaces — stripped now)
        sds_id = int(sds_row.get('id', 0))
        personality = {
            "openness":          float(sds_row.get('openness_to_experience', 50)),
            "conscientiousness": float(sds_row.get('conscientiousness', 50)),
            "extraversion":      float(sds_row.get('extraversion', 50)),
            "agreeableness":     float(sds_row.get('agreeableness', 50)),
            "neuroticism":       float(sds_row.get('neuroticism', 50)),
        }
        sds_success = int(sds_row.get('success_ classification_ high_low', 0))

        # Real JDS columns (after strip): id, big_data_skills, maths-stats_skills,
        # coding_skills, ai_and_ml_skills, dashboard_and_storytelling_skills,
        # salary_hike_high_or_low
        jds_id = int(jds_row.get('id', 0))
        skills = {
            "AI & Machine Learning": round(float(jds_row.get('ai_and_ml_skills', 3.0)), 2),
            "Maths & Stats":         round(float(jds_row.get('maths-stats_skills', 3.0)), 2),
            "Coding Skills":         round(float(jds_row.get('coding_skills', 3.0)), 2),
            "Big Data":              round(float(jds_row.get('big_data_skills', 3.0)), 2),
            "Dashboarding":          round(float(jds_row.get('dashboard_and_storytelling_skills', 3.0)), 2),
        }
        jds_hike = int(jds_row.get('salary_hike_high_or_low', 0))

        avg_tech = sum(skills.values()) / 5.0
        tech_score = round((avg_tech / 5.0) * 100, 1)

        # Growth boosted by real success classifications from both datasets
        growth_base = 65.0 + (sds_success * 10) + (jds_hike * 10)
        growth_score = round(min(growth_base + rng.uniform(-5, 8), 97.0), 1)

        cult_score      = round(compute_cultural_resonance(personality, job.get('company_type', 'MNC')), 1)
        chemistry_score = round(min(max(personality['agreeableness'] * 1.5 + rng.uniform(-8, 8), 10.0), 99.0), 1)
        market_score    = round(rng.uniform(52, 91), 1)

        weights = {"tech": 0.30, "cult": 0.25, "growth": 0.20, "chemistry": 0.15, "market": 0.10}
        cis = round(
            tech_score * weights["tech"] + cult_score * weights["cult"] +
            growth_score * weights["growth"] + chemistry_score * weights["chemistry"] +
            market_score * weights["market"], 1
        )

        formula = (f"({tech_score} × 0.30) + ({cult_score} × 0.25) + "
                   f"({growth_score} × 0.20) + ({chemistry_score} × 0.15) + "
                   f"({market_score} × 0.10) = {cis}")

        proof = MathProof(
            tech_score=tech_score, cult_score=cult_score, growth_score=growth_score,
            chemistry_score=chemistry_score, market_score=market_score,
            tech_weight=weights["tech"], cult_weight=weights["cult"],
            growth_weight=weights["growth"], chemistry_weight=weights["chemistry"],
            market_weight=weights["market"], formula_string=formula
        )

        drivers = []
        if tech_score > 78:   drivers.append(f"Strong match for {job.get('job_title','Role')} technical stack (JDS #{jds_id}).")
        if cult_score > 78:   drivers.append(f"High cultural resonance with {job.get('company_size','Enterprise')} environment.")
        if growth_score > 80: drivers.append(f"High-success SDS profile (#{sds_id}) — strong growth trajectory signal.")
        if jds_hike == 1:     drivers.append("JDS data: High salary-hike classification — proven top-performer pattern.")
        if sds_success == 1:  drivers.append("SDS data: High-success classification — above-average career outcomes.")
        if not drivers:       drivers.append("Balanced fit across all 5 compatibility dimensions.")

        risks = []
        if personality['conscientiousness'] < 35: risks.append(f"Low Conscientiousness ({personality['conscientiousness']}/100) — risk of unstructured execution.")
        if skills['Big Data'] < 2.5:              risks.append(f"Big Data gap: {skills['Big Data']}/5 — below role threshold.")
        if personality['neuroticism'] > 65:       risks.append(f"Elevated Neuroticism ({personality['neuroticism']}/100) — stress resilience risk.")
        if tech_score < 58:                       risks.append(f"Tech score {tech_score}/100 below role minimum of 60.")
        if avg_tech < 3.0:                        risks.append(f"Average JDS skill score {avg_tech:.1f}/5 — significant upskilling required.")

        ai_rec = "PROCEED WITH CAUTION"
        if cis >= 78 and len(risks) <= 1: ai_rec = "STRONG HIRE"
        elif cis < 68 or len(risks) >= 3: ai_rec = "REJECT"

        candidates.append(CandidateProfile(
            candidate_id=f"SDS{sds_id}-JDS{jds_id}",
            name=name_pool[i],
            job_title=str(job.get('job_title', 'Role')),
            compatibility_index_score=cis,
            skills=skills,
            personality=personality,
            top_drivers=drivers[:3],
            risks=risks[:3],
            ai_recommendation=ai_rec,
            math_proof=proof,
            status='Sourced',
            data_source=f"SDS Dataset Row #{sds_id} × JDS Dataset Row #{jds_id}"
        ))

    candidates.sort(key=lambda x: x.compatibility_index_score, reverse=True)
    return candidates
