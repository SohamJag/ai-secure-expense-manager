from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy training data
data = {
    'amount': [10, 20, 15, 30, 25, 12, 18, 500, 22, 19, 1000, 15, 20, 25, 30],
    'category': ['food', 'transport', 'food', 'utilities', 'food', 'transport', 'food', 'entertainment', 'food', 'transport', 'shopping', 'food', 'transport', 'utilities', 'food']
}
df = pd.DataFrame(data)

# Preprocessing
le = LabelEncoder()
df['category_encoded'] = le.fit_transform(df['category'])

# Train Isolation Forest
X = df[['amount', 'category_encoded']]
model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X)

class Transaction(BaseModel):
    amount: float
    category: str

@app.post("/predict")
def predict_anomaly(transaction: Transaction):
    try:
        # Handle unseen categories safely
        if transaction.category in le.classes_:
            category_encoded = le.transform([transaction.category])[0]
        else:
            category_encoded = -1 # Unknown category
            
        X_new = pd.DataFrame({'amount': [transaction.amount], 'category_encoded': [category_encoded]})
        prediction = model.predict(X_new)
        
        # Isolation Forest returns -1 for anomalies, 1 for normal
        is_anomaly = bool(prediction[0] == -1)
        
        return {"is_anomaly": is_anomaly, "transaction": transaction.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
