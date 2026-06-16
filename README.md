# CoLiving Connect

An explainable roommate recommendation platform for people relocating to a new city. CoLiving Connect ranks potential housemates using lifestyle preferences, living habits, budget overlap, shared interests, and move-in timing, then lets users connect through a swipe-style discovery flow.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)

## Product Tour

- Discover roommates in the same destination city.
- Filter candidates by monthly budget and interests.
- Complete a guided interest and lifestyle questionnaire before viewing matches.
- Review an overall compatibility score and its contributing factors.
- Like or pass on profiles in a focused discovery queue.
- Create a match only when both users like each other.
- Preserve decisions and matches in PostgreSQL.

## Architecture

```mermaid
flowchart LR
    A[React client] -->|REST| B[Node.js API]
    B --> C[(PostgreSQL)]
    B -->|Profiles to score| D[Python recommendation service]
    D -->|Ranked results and reasons| B
```

The Node API owns application workflows and persistence. The Python service owns recommendation logic, making the model independently testable and easy to replace with a learned model later.

## Compatibility Model

Every candidate receives a score from 0 to 100:

| Signal | Weight | Method |
| --- | ---: | --- |
| Lifestyle | 40% | Average similarity across sleep, cleanliness, social level, noise, and guests |
| Interests | 20% | Jaccard similarity of interest sets |
| Budget | 15% | Overlap relative to the combined budget range |
| Deal-breakers | 15% | Agreement on smoking, pets, and remote work |
| Move-in date | 10% | Linear decay across a 90-day window |

The API returns the factor-level breakdown and human-readable reasons, not only a black-box score.

## Quick Start

Requirements: Docker Desktop and Docker Compose. For local, non-Docker Python development, use Python 3.13.

### Easiest demo (no Docker required)

```bash
cd frontend
npm install
npm run demo
```

Open [http://localhost:5173](http://localhost:5173). If the backend is unavailable, the site automatically uses built-in profiles and runs the same weighted matching algorithm in the browser.

If your computer blocks local development servers, open the standalone demo instead:

```bash
open offline-demo.html
```

```bash
docker compose up --build
```

Then open:

- Web app: [http://localhost:5173](http://localhost:5173)
- API health: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- Recommendation API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

The database initializes with five profiles. The demo signs in as **Maya Patel** (`11111111-1111-4111-8111-111111111111`).

To reset all demo swipes and matches:

```bash
docker compose down -v
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database health |
| `GET` | `/api/users/:id` | Fetch one user profile |
| `GET` | `/api/recommendations/:userId` | Get filtered, ranked candidates |
| `POST` | `/api/recommendations/:userId/preview` | Rank candidates from questionnaire answers |
| `POST` | `/api/swipes` | Save a like/pass and detect a mutual match |
| `GET` | `/api/matches/:userId` | List a user's matches |
| `POST` | `/recommendations` | Score candidates in the Python service |

Example:

```bash
curl "http://localhost:3001/api/recommendations/11111111-1111-4111-8111-111111111111?maxBudget=2400&interests=cooking"
```

## Local Development

Run PostgreSQL first, then start each service in a separate terminal:

```bash
docker compose up database
```

```bash
cd recommender
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
cd backend
npm install
DATABASE_URL=postgresql://coliving:coliving_dev@localhost:5432/coliving_connect npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd recommender && python -m pytest
cd backend && npm test
cd frontend && npm run build
```

The recommendation tests verify perfect matches, city exclusion, and rank ordering. The API suite verifies service health and is structured for endpoint integration tests.

## Engineering Decisions

- **Explainability over opaque ranking:** users can see why a person ranks highly.
- **Service boundary for recommendations:** scoring can evolve independently into a trained model.
- **Parameterized SQL:** all filters and mutations avoid SQL injection.
- **Transactional matching:** swipe persistence and mutual-match creation happen atomically.
- **Responsive and accessible UI:** semantic controls, keyboard-friendly buttons, mobile filters, and loading/error/empty states are included.

## Roadmap

- Authentication and profile onboarding
- Direct messaging with WebSockets
- Preference hard constraints and candidate feedback loops
- Offline evaluation using precision@k and match acceptance rate
- Production image storage and moderation

## About the “60%” Resume Metric

This repository demonstrates how the discovery workflow can be streamlined, but it does **not** independently prove a 60% improvement. Keep that number on a resume only if it came from a real usability study, baseline comparison, or production analytics. A defensible evaluation would compare time-to-shortlist and post-match satisfaction against a manual search flow and document the sample size.

## License

MIT
