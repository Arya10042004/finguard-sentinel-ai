from fastapi import FastAPI

app = FastAPI(
    title="FINGUARD Sentinel AI",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "FINGUARD Sentinel AI Backend Running"
    }