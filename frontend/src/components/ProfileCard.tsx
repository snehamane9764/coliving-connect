import { BriefcaseBusiness, CalendarDays, Check, Heart, MapPin, X } from "lucide-react";
import type { Recommendation } from "../types";

interface ProfileCardProps {
  recommendation: Recommendation;
  onSwipe: (decision: "like" | "pass") => void;
  busy: boolean;
}

const labels: Record<string, string> = {
  lifestyle: "Lifestyle",
  interests: "Interests",
  budget: "Budget",
  move_in: "Move-in",
  deal_breakers: "Home habits",
};

export function ProfileCard({ recommendation, onSwipe, busy }: ProfileCardProps) {
  const { profile, score, breakdown, reasons } = recommendation;
  const moveIn = new Date(`${profile.moveInDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="profile-card">
      <div className="profile-photo">
        <img src={profile.avatarUrl} alt={`${profile.name}'s profile`} />
        <div className="score-badge">
          <strong>{Math.round(score)}%</strong>
          <span>match</span>
        </div>
        <div className="photo-gradient" />
        <div className="profile-title">
          <div className="online-dot" aria-label="Recently active" />
          <h1>{profile.name}, {profile.age}</h1>
          <p><MapPin size={15} /> {profile.city}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="quick-facts">
          <span><BriefcaseBusiness size={17} /> {profile.occupation}</span>
          <span><CalendarDays size={17} /> Moves {moveIn}</span>
          <span>${profile.budgetMin.toLocaleString()}-${profile.budgetMax.toLocaleString()}</span>
        </div>

        <p className="bio">{profile.bio}</p>

        <div className="interests">
          {profile.interests.map((interest) => <span key={interest}>{interest}</span>)}
        </div>

        <section className="compatibility">
          <div className="section-title">
            <div>
              <span className="eyebrow">Why you connect</span>
              <h3>Compatibility breakdown</h3>
            </div>
            <Check size={20} />
          </div>
          <div className="score-grid">
            {Object.entries(breakdown).map(([key, value]) => (
              <div className="score-row" key={key}>
                <span>{labels[key] ?? key}</span>
                <div className="score-track"><i style={{ width: `${value}%` }} /></div>
                <strong>{Math.round(value)}</strong>
              </div>
            ))}
          </div>
          <p className="reason">{reasons[0]}</p>
        </section>

        <div className="actions">
          <button disabled={busy} className="swipe-button pass" onClick={() => onSwipe("pass")} aria-label="Pass">
            <X />
          </button>
          <button disabled={busy} className="swipe-button like" onClick={() => onSwipe("like")}>
            <Heart fill="currentColor" /> <span>Connect</span>
          </button>
        </div>
      </div>
    </article>
  );
}
