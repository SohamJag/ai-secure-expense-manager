# AI Secure Expense Manager

A full-stack expense management application featuring secure authentication, transaction tracking, an analytics dashboard, and an Isolation Forest-based anomaly detection module to identify unusual transaction patterns.

## Features

*   **Secure Authentication**: JWT-based authentication and protected routes.
*   **Transaction Tracking**: Easily add, view, and delete expenses.
*   **Analytics Dashboard**: Visual charts for expense categorization and spending trends.
*   **Anomaly Detection**: Integration with a Python/FastAPI module that uses Isolation Forest to flag unusual expenses.
*   **Modern UI**: Stunning glassmorphism design with responsive elements.
*   **Backend Security**: Helmet for HTTP headers and Rate Limiter to prevent abuse.


## Tech Stack

*   **Frontend**: React, Vite, Chart.js, Lucide React
*   **Backend**: Node.js, Express, MongoDB, Mongoose, bcryptjs, jsonwebtoken, helmet, express-rate-limit
*   **ML API**: Python, FastAPI, scikit-learn, pandas

## Setup Instructions

```bash
cd backend
npm install
# Create a .env file with MONGODB_URI, PORT=5001, and JWT_SECRET
node server.js
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. ML API Setup

```bash
cd ml_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
