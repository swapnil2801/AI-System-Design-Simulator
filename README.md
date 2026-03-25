# AI System Design Simulator

A full-stack web application for visually designing distributed system architectures, simulating traffic, detecting bottlenecks, estimating infrastructure costs, and getting AI-based architecture improvement suggestions.

## Tech Stack

- **Frontend**: React 18, React Flow, TailwindCSS, Recharts, Axios, React Router
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic v2, JWT Auth, bcrypt
- **Database**: PostgreSQL

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### Database Setup

```sql
CREATE DATABASE system_design_db;
```

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Edit `backend/.env` to match your PostgreSQL credentials:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/system_design_db
SECRET_KEY=your-secret-key-change-in-production-abc123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Start the backend:

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000. Swagger docs at http://localhost:8000/docs.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will open at http://localhost:3000.

## Features

1. **User Authentication** - Register, login, JWT-protected routes
2. **Visual Architecture Builder** - Drag-and-drop system components (Client, CDN, Load Balancer, API Gateway, Microservice, Cache, Message Queue, Database)
3. **Save/Load Architectures** - Persist designs to PostgreSQL
4. **Traffic Simulation** - Simulate requests and identify bottlenecks
5. **AI Architecture Analyzer** - Rule-based suggestions for improvements
6. **Cost Estimation** - Monthly infrastructure cost breakdown

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /auth/me | Get current user |
| GET | /architectures/ | List architectures |
| POST | /architectures/ | Create architecture |
| GET | /architectures/{id} | Get architecture |
| PUT | /architectures/{id} | Update architecture |
| DELETE | /architectures/{id} | Delete architecture |
| POST | /simulate | Run traffic simulation |
| GET | /simulations/{id} | Simulation history |
| POST | /analyze | Analyze architecture |
| POST | /estimate-cost | Estimate costs |

## Example Test Architecture

Create an architecture with these components:

```
Client → CDN → Load Balancer → API Gateway → Microservice → Database
```

Then run a simulation with 1000 requests/second to see the Database flagged as a bottleneck, and the analyzer will suggest adding a Redis cache layer.