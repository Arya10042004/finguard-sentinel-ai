def calculate_risk(transaction):
    risk_score=0.12
    if(transaction["amount"]>100000):
        risk_score+=0.45
    if(transaction["country"]=="High Risk"):
        risk_score+=0.30

    return {
        "risk_score":risk_score
    }