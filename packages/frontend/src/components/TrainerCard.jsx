import { useState } from 'react';

const TEAM_EMOJI = { mystic: '💙', valor: '❤️', instinct: '💛' };
const TEAM_LABEL = { mystic: 'Mystic', valor: 'Valor', instinct: 'Instinct' };

/** Format code as "XXXX XXXX XXXX" */
function prettyCode(code) {
  return code.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <button
      type="button"
      className={`btn-copy${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      aria-label="Copy trainer code"
    >
      {copied ? (
        <>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function TrainerCard({ trainer }) {
  const { username, trainer_code, team, country, city } = trainer;

  return (
    <article className="trainer-card">
      <div className={`trainer-card__avatar trainer-card__avatar--${team}`} aria-hidden="true">
        {TEAM_EMOJI[team] ?? '🎮'}
      </div>

      <div className="trainer-card__info">
        <div className="trainer-card__name">{username}</div>
        <div className="trainer-card__meta">
          <span className={`badge badge-${team}`}>{TEAM_LABEL[team]}</span>
          {(city || country) && (
            <span style={{ marginLeft: 8 }}>
              📍 {[city, country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
        <div className="trainer-card__code">
          <span>{prettyCode(trainer_code)}</span>
          <CopyButton text={trainer_code} />
        </div>
      </div>
    </article>
  );
}
