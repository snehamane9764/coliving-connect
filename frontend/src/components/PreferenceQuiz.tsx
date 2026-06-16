import { ArrowLeft, ArrowRight, Briefcase, Check, MapPin, Moon, Sparkles, Sun, Users } from "lucide-react";
import { useState } from "react";
import type { MatchPreferences } from "../types";

const interests = [
  "Cooking", "Hiking", "Fitness", "Music", "Art", "Travel",
  "Reading", "Gaming", "Yoga", "Technology", "Coffee", "Plants",
];

const scales = [
  { key: "sleepSchedule", title: "Your usual rhythm", low: "Early bird", high: "Night owl", lowIcon: Sun, highIcon: Moon },
  { key: "cleanliness", title: "Shared-space style", low: "Relaxed", high: "Very tidy", lowIcon: Sparkles, highIcon: Sparkles },
  { key: "socialLevel", title: "Home atmosphere", low: "Quiet retreat", high: "Social home", lowIcon: Briefcase, highIcon: Users },
  { key: "guestFrequency", title: "Friends visiting", low: "Rarely", high: "Often", lowIcon: Users, highIcon: Users },
] as const;

interface PreferenceQuizProps {
  submitting: boolean;
  error: string;
  onComplete: (preferences: MatchPreferences) => void;
}

export function PreferenceQuiz({ submitting, error, onComplete }: PreferenceQuizProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<MatchPreferences>({
    city: "New York",
    moveInDate: "2026-08-01",
    maxBudget: 2400,
    interests: [],
    sleepSchedule: 3,
    cleanliness: 4,
    socialLevel: 3,
    noiseTolerance: 2,
    guestFrequency: 2,
    smoking: false,
    pets: false,
    workFromHome: true,
  });

  function toggleInterest(interest: string) {
    setPreferences((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  const canContinue = step !== 1 || preferences.interests.length >= 3;

  return (
    <main className="quiz-page">
      <section className="quiz-intro">
        <span className="eyebrow">Roommate matching, made personal</span>
        <h1>Tell us what makes a place feel like <em>home.</em></h1>
        <p>We compare your interests, routines, and living preferences to find people likely to fit your everyday life.</p>
        <div className="algorithm-note">
          <Sparkles size={20} />
          <div><strong>How matching works</strong><span>Lifestyle 40% · Interests 20% · Practical fit 40%</span></div>
        </div>
      </section>

      <section className="quiz-card">
        <div className="quiz-progress">
          {[1, 2, 3].map((number) => <i key={number} className={number <= step ? "active" : ""} />)}
          <span>Step {step} of 3</span>
        </div>

        {step === 1 && (
          <div className="quiz-panel">
            <span className="quiz-kicker">Your interests</span>
            <h2>What are you into?</h2>
            <p>Choose at least three. Shared interests help break the ice and shape your match score.</p>
            <div className="interest-options">
              {interests.map((interest) => {
                const selected = preferences.interests.includes(interest);
                return <button type="button" className={selected ? "selected" : ""} key={interest} onClick={() => toggleInterest(interest)}>{selected && <Check size={15} />}{interest}</button>;
              })}
            </div>
            <small>{preferences.interests.length}/12 selected {preferences.interests.length < 3 && "· Pick at least 3"}</small>
          </div>
        )}

        {step === 2 && (
          <div className="quiz-panel">
            <span className="quiz-kicker">Your lifestyle</span>
            <h2>How do you like to live?</h2>
            <p>There are no right answers. Honest choices make stronger recommendations.</p>
            <div className="scale-list">
              {scales.map(({ key, title, low, high, lowIcon: LowIcon, highIcon: HighIcon }) => (
                <label className="preference-scale" key={key}>
                  <strong>{title}</strong>
                  <div className="scale-control">
                    <span><LowIcon size={16} />{low}</span>
                    <input type="range" min="1" max="5" value={preferences[key]} onChange={(event) => setPreferences({ ...preferences, [key]: Number(event.target.value) })} />
                    <span><HighIcon size={16} />{high}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="yes-no-grid">
              <label><span>Work from home?</span><button type="button" className={preferences.workFromHome ? "yes" : ""} onClick={() => setPreferences({ ...preferences, workFromHome: !preferences.workFromHome })}>{preferences.workFromHome ? "Yes" : "No"}</button></label>
              <label><span>Comfortable with pets?</span><button type="button" className={preferences.pets ? "yes" : ""} onClick={() => setPreferences({ ...preferences, pets: !preferences.pets })}>{preferences.pets ? "Yes" : "No"}</button></label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="quiz-panel">
            <span className="quiz-kicker">The practical details</span>
            <h2>Where and when?</h2>
            <p>We only recommend people whose location and housing plans overlap with yours.</p>
            <div className="detail-fields">
              <label><span>Moving to</span><div><MapPin size={18} /><select value={preferences.city} onChange={(event) => setPreferences({ ...preferences, city: event.target.value })}><option>New York</option><option>Boston</option></select></div></label>
              <label><span>Move-in date</span><input type="date" value={preferences.moveInDate} onChange={(event) => setPreferences({ ...preferences, moveInDate: event.target.value })} /></label>
              <label className="budget-field"><span>Maximum monthly budget</span><strong>${preferences.maxBudget.toLocaleString()}</strong><input type="range" min="1200" max="3000" step="100" value={preferences.maxBudget} onChange={(event) => setPreferences({ ...preferences, maxBudget: Number(event.target.value) })} /></label>
            </div>
            <div className="ready-note"><Check size={20} /><div><strong>Your match profile is ready</strong><span>We'll rank available roommates and explain every score.</span></div></div>
            {error && <p className="quiz-error">{error}</p>}
          </div>
        )}

        <div className="quiz-actions">
          {step > 1 ? <button className="back-button" onClick={() => setStep(step - 1)}><ArrowLeft size={17} /> Back</button> : <span />}
          {step < 3 ? (
            <button disabled={!canContinue} className="continue-button" onClick={() => setStep(step + 1)}>Continue <ArrowRight size={17} /></button>
          ) : (
            <button disabled={submitting} className="continue-button" onClick={() => onComplete(preferences)}>{submitting ? "Calculating..." : "See my matches"} <Sparkles size={17} /></button>
          )}
        </div>
      </section>
    </main>
  );
}
