from datetime import date

from .models import Profile, Recommendation, ScoreBreakdown

LIFESTYLE_FIELDS = (
    "sleep_schedule",
    "cleanliness",
    "social_level",
    "noise_tolerance",
    "guest_frequency",
)


def _similarity(first: int, second: int) -> float:
    return 1 - abs(first - second) / 4


def _budget_overlap(first: Profile, second: Profile) -> float:
    overlap = max(0, min(first.budget_max, second.budget_max) - max(first.budget_min, second.budget_min))
    union = max(first.budget_max, second.budget_max) - min(first.budget_min, second.budget_min)
    return overlap / union if union else 1.0


def _interest_similarity(first: Profile, second: Profile) -> tuple[float, set[str]]:
    left = {interest.lower() for interest in first.interests}
    right = {interest.lower() for interest in second.interests}
    shared = left & right
    union = left | right
    return (len(shared) / len(union) if union else 1.0), shared


def _move_in_similarity(first: date, second: date) -> float:
    days = abs((first - second).days)
    return max(0.0, 1 - days / 90)


def score_candidate(current: Profile, candidate: Profile) -> Recommendation:
    lifestyle = sum(
        _similarity(getattr(current, field), getattr(candidate, field))
        for field in LIFESTYLE_FIELDS
    ) / len(LIFESTYLE_FIELDS)
    interests, shared = _interest_similarity(current, candidate)
    budget = _budget_overlap(current, candidate)
    move_in = _move_in_similarity(current.move_in_date, candidate.move_in_date)

    boolean_matches = [
        current.smoking == candidate.smoking,
        current.pets == candidate.pets,
        current.work_from_home == candidate.work_from_home,
    ]
    deal_breakers = sum(boolean_matches) / len(boolean_matches)

    # Lifestyle alignment matters most; logistical fit and shared interests refine rank.
    total = (
        lifestyle * 0.40
        + interests * 0.20
        + budget * 0.15
        + move_in * 0.10
        + deal_breakers * 0.15
    ) * 100

    reasons: list[str] = []
    if lifestyle >= 0.8:
        reasons.append("Your daily routines are closely aligned")
    if shared:
        reasons.append(f"Shared interests: {', '.join(sorted(shared)[:3])}")
    if budget >= 0.5:
        reasons.append("Strong budget overlap")
    if move_in >= 0.8:
        reasons.append("Move-in dates are well aligned")
    if not reasons:
        reasons.append("Potential match based on overall preferences")

    return Recommendation(
        user_id=candidate.id,
        score=round(total, 1),
        breakdown=ScoreBreakdown(
            lifestyle=round(lifestyle * 100, 1),
            interests=round(interests * 100, 1),
            budget=round(budget * 100, 1),
            move_in=round(move_in * 100, 1),
            deal_breakers=round(deal_breakers * 100, 1),
        ),
        reasons=reasons,
    )


def rank_candidates(current: Profile, candidates: list[Profile]) -> list[Recommendation]:
    same_city = [candidate for candidate in candidates if candidate.city.lower() == current.city.lower()]
    return sorted(
        (score_candidate(current, candidate) for candidate in same_city if candidate.id != current.id),
        key=lambda recommendation: recommendation.score,
        reverse=True,
    )
