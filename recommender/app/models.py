from datetime import date

from pydantic import BaseModel, Field


class Profile(BaseModel):
    id: str
    city: str
    move_in_date: date
    budget_min: int = Field(ge=0)
    budget_max: int = Field(ge=0)
    interests: list[str] = Field(default_factory=list)
    sleep_schedule: int = Field(ge=1, le=5)
    cleanliness: int = Field(ge=1, le=5)
    social_level: int = Field(ge=1, le=5)
    noise_tolerance: int = Field(ge=1, le=5)
    guest_frequency: int = Field(ge=1, le=5)
    smoking: bool
    pets: bool
    work_from_home: bool


class RecommendationRequest(BaseModel):
    current_user: Profile
    candidates: list[Profile]


class ScoreBreakdown(BaseModel):
    lifestyle: float
    interests: float
    budget: float
    move_in: float
    deal_breakers: float


class Recommendation(BaseModel):
    user_id: str
    score: float
    breakdown: ScoreBreakdown
    reasons: list[str]


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
