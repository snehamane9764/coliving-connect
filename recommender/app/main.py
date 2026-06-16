from fastapi import FastAPI

from .models import RecommendationRequest, RecommendationResponse
from .scoring import rank_candidates

app = FastAPI(
    title="CoLiving Connect Recommendation Service",
    description="Explainable roommate compatibility scoring API",
    version="1.0.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/recommendations", response_model=RecommendationResponse)
def recommendations(payload: RecommendationRequest) -> RecommendationResponse:
    return RecommendationResponse(
        recommendations=rank_candidates(payload.current_user, payload.candidates)
    )
