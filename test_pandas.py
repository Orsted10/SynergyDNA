import pandas as pd
import traceback
BASE_DIR = "e:/Tensor Titans"
try:
    df_jobs = pd.read_csv(f"{BASE_DIR}/ai_jobs.csv")
    print(f"Original len: {len(df_jobs)}")
    df_jobs = df_jobs.dropna(subset=['job_id', 'job_title', 'company_size', 'industry'])
    print(f"After dropna: {len(df_jobs)}")
except Exception as e:
    traceback.print_exc()

try:
    df_sds = pd.read_csv(f"{BASE_DIR}/SDS Personality Traits.csv").dropna()
    print(f"SDS len: {len(df_sds)}")
except Exception as e:
    traceback.print_exc()

try:
    df_jds = pd.read_csv(f"{BASE_DIR}/JDS Skill Traits.csv").dropna()
    print(f"JDS len: {len(df_jds)}")
except Exception as e:
    traceback.print_exc()
