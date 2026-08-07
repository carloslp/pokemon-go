import { useState, useCallback } from 'react';

const TEAM_OPTIONS = [
  { value: '', label: 'Select your team…' },
  { value: 'mystic', label: '💙 Team Mystic' },
  { value: 'valor', label: '❤️ Team Valor' },
  { value: 'instinct', label: '💛 Team Instinct' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/** Format a 12-digit string as "XXXX XXXX XXXX" */
function formatCode(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

import TurnstileWidget from './TurnstileWidget.jsx';

export default function RegistrationForm({ onSuccess }) {
  const [form, setForm] = useState({ username: '', trainer_code: '', team: '' });
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'trainer_code') {
      setForm((f) => ({ ...f, trainer_code: formatCode(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleTurnstileVerify = useCallback((token) => setTurnstileToken(token), []);
  const handleTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError('Please complete the security challenge.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trainers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          trainer_code: form.trainer_code.replace(/\s/g, ''),
          team: form.team,
          turnstile_token: turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      onSuccess?.(data);
      setForm({ username: '', trainer_code: '', team: '' });
      setTurnstileToken(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card stack" onSubmit={handleSubmit} noValidate>
      <h2>Register as a Trainer</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="username">Trainer Name</label>
        <input
          id="username"
          name="username"
          type="text"
          className="form-control"
          placeholder="AshKetchum"
          value={form.username}
          onChange={handleChange}
          minLength={3}
          maxLength={50}
          required
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label htmlFor="trainer_code">Trainer Code</label>
        <input
          id="trainer_code"
          name="trainer_code"
          type="text"
          inputMode="numeric"
          className="form-control"
          placeholder="1234 5678 9012"
          value={form.trainer_code}
          onChange={handleChange}
          maxLength={14}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="team">Team</label>
        <select
          id="team"
          name="team"
          className="form-control form-select"
          value={form.team}
          onChange={handleChange}
          required
        >
          {TEAM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <TurnstileWidget onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Registering…' : 'Register'}
      </button>
    </form>
  );
}
