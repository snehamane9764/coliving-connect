import { useCallback, useEffect, useState } from "react";
import { Building2, Filter, Heart, MessageCircle, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { Filters } from "./components/Filters";
import { ProfileCard } from "./components/ProfileCard";
import { PreferenceQuiz } from "./components/PreferenceQuiz";
import { previewRecommendations, submitSwipe } from "./lib/api";
import type { MatchPreferences, Recommendation } from "./types";

const CURRENT_USER_ID = "11111111-1111-4111-8111-111111111111";

export default function App() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [onboarding, setOnboarding] = useState(true);
  const [matchPreferences, setMatchPreferences] = useState<MatchPreferences | null>(null);
  const [filters, setFilters] = useState({ maxBudget: 2400, interests: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [matchedWith, setMatchedWith] = useState<string | null>(null);

  const load = useCallback(async (preferences?: MatchPreferences) => {
    if (!preferences) return;
    setLoading(true);
    setError("");
    try {
      const results = await previewRecommendations(CURRENT_USER_ID, preferences);
      setRecommendations(results);
      setMatchPreferences(preferences);
      setFilters({ maxBudget: preferences.maxBudget, interests: preferences.interests.join(",") });
      setOnboarding(false);
    } catch {
      setError("We couldn't load your matches. Check that the services are running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (onboarding || !matchPreferences) return;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const interests = filters.interests.split(",").map((item) => item.trim()).filter(Boolean);
        setRecommendations(await previewRecommendations(CURRENT_USER_ID, {
          ...matchPreferences,
          maxBudget: filters.maxBudget,
          interests: interests.length ? interests : matchPreferences.interests,
        }));
      } catch {
        setError("We couldn't update your matches. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters, matchPreferences, onboarding]);

  async function handleSwipe(decision: "like" | "pass") {
    const current = recommendations[0];
    if (!current) return;
    setBusy(true);
    try {
      const result = await submitSwipe({
        swiperId: CURRENT_USER_ID,
        swipedId: current.userId,
        decision,
        compatibilityScore: current.score,
      });
      setRecommendations((items) => items.slice(1));
      if (result.matched) setMatchedWith(current.profile.name);
    } catch {
      setError("Your choice wasn't saved. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const current = recommendations[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="CoLiving Connect home">
          <span><Building2 /></span>
          <div>CoLiving <strong>Connect</strong></div>
        </a>
        <nav aria-label="Main navigation">
          <a className="active" href="#discover"><Sparkles size={18} /> Discover</a>
          <a href="#matches"><Heart size={18} /> Matches</a>
          <a href="#messages"><MessageCircle size={18} /> Messages</a>
        </nav>
        <button className="avatar-button" aria-label="Open profile"><UserRound /></button>
      </header>

      {onboarding ? <PreferenceQuiz submitting={loading} error={error} onComplete={load} /> : (

      <main>
        <section className="intro">
          <div>
            <span className="eyebrow">New York City · August 2026</span>
            <h1>Meet people you could <em>live well</em> with.</h1>
            <p>Recommendations built around the routines, values, and little habits that make a home work.</p>
          </div>
          <button className="filter-toggle" onClick={() => setFilterOpen(true)}><Filter size={18} /> Filters</button>
        </section>

        <div className="discovery-layout" id="discover">
          <Filters {...filters} open={filterOpen} onToggle={() => setFilterOpen(false)} onChange={setFilters} />
          <section className="card-stage" aria-live="polite">
            {loading && <div className="state-card"><span className="loader" /><h2>Finding compatible roommates...</h2></div>}
            {!loading && error && <div className="state-card"><h2>Connection interrupted</h2><p>{error}</p><button onClick={() => setOnboarding(true)}><RotateCcw size={17} /> Update answers</button></div>}
            {!loading && !error && current && <ProfileCard recommendation={current} onSwipe={handleSwipe} busy={busy} />}
            {!loading && !error && !current && (
              <div className="state-card">
                <Sparkles size={34} />
                <h2>You're all caught up</h2>
                <p>Try widening your budget or clearing the interest filter to meet more people.</p>
                <button onClick={() => setOnboarding(true)}><RotateCcw size={17} /> Update answers</button>
              </div>
            )}
            {!loading && !error && recommendations.length > 0 && (
              <p className="queue-count">{recommendations.length} compatible {recommendations.length === 1 ? "profile" : "profiles"} in your queue</p>
            )}
          </section>
        </div>
      </main>
      )}

      {filterOpen && <button className="scrim" onClick={() => setFilterOpen(false)} aria-label="Close filters" />}
      {matchedWith && (
        <div className="modal-backdrop" role="presentation">
          <div className="match-modal" role="dialog" aria-modal="true" aria-label="New match">
            <div className="match-icon"><Heart fill="currentColor" /></div>
            <span className="eyebrow">It's mutual</span>
            <h2>You matched with {matchedWith}</h2>
            <p>Start a conversation about neighborhoods, move-in plans, and what home means to both of you.</p>
            <button onClick={() => setMatchedWith(null)}>Keep discovering</button>
          </div>
        </div>
      )}
    </div>
  );
}
