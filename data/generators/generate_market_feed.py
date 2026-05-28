import pandas as pd
import random
from datetime import datetime, timedelta

def generate_market_feed(total_records=365):
    records = []

    for i in range(total_records):
        date_value = datetime.now() - timedelta(days=i)

        records.append({
            "market_date": date_value.strftime("%Y-%m-%d"),
            "usd_inr_rate": round(random.uniform(80, 86), 2),
            "market_volatility_index": round(random.uniform(10, 40), 2),
            "country_risk_index": round(random.uniform(0.1, 0.9), 2),
            "global_sanction_alert_level": random.choice(["LOW", "MEDIUM", "HIGH"]),
            "financial_stress_indicator": round(random.uniform(0.05, 0.95), 2)
        })

    df = pd.DataFrame(records)

    output_path = "data/raw/market_feed/market_feed.csv"
    df.to_csv(output_path, index=False)

    print("Market feed dataset generated:", output_path)

if __name__ == "__main__":
    generate_market_feed()