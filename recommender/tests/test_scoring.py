from datetime import date

from app.models import Profile
from app.scoring import rank_candidates, score_candidate


def profile(profile_id: str, **overrides) -> Profile:
    values = {
        "id": profile_id,
        "city": "New York",
        "move_in_date": date(2026, 8, 1),
        "budget_min": 1500,
        "budget_max": 2200,
        "interests": ["hiking", "cooking"],
        "sleep_schedule": 3,
        "cleanliness": 5,
        "social_level": 3,
        "noise_tolerance": 2,
        "guest_frequency": 2,
        "smoking": False,
        "pets": True,
        "work_from_home": True,
    }
    values.update(overrides)
    return Profile(**values)


def test_identical_profiles_score_100() -> None:
    assert score_candidate(profile("a"), profile("b")).score == 100


def test_rank_excludes_other_cities_and_current_user() -> None:
    current = profile("current")
    results = rank_candidates(
        current,
        [current, profile("near"), profile("away", city="Boston")],
    )
    assert [result.user_id for result in results] == ["near"]


def test_more_compatible_candidate_ranks_first() -> None:
    current = profile("current")
    close = profile("close", interests=["hiking", "cooking", "yoga"])
    distant = profile(
        "distant",
        interests=["clubbing"],
        sleep_schedule=5,
        cleanliness=1,
        social_level=5,
        noise_tolerance=5,
        guest_frequency=5,
        smoking=True,
        pets=False,
        work_from_home=False,
    )
    results = rank_candidates(current, [distant, close])
    assert results[0].user_id == "close"
    assert results[0].score > results[1].score
